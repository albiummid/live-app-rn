import {Device} from 'mediasoup-client';
import {useEffect, useRef, useState} from 'react';
import {Alert} from 'react-native';
import {getUserById} from '../api/user.api';
import {getAppLocalData} from '../constants';
import {getUser} from '../constants/values';
import localAV from '../libs/localAV';
import {
  bsGetBroadcast,
  bsJoinAsBroadcaster,
  bsJoinBroadcast,
  bsStopBroadcasting,
} from '../services/live/AppServerService';
import {
  createServerTransportToConsume,
  createServerTransportToPublish,
  deviceRecvTransportConnect,
  deviceRecvTransportConsume,
  endBroadcasting,
  inquireBroadcast,
  joinBroadcast,
  onAirPublishers,
  resumeConsumer,
  rtpCaps,
  sendTransportOnConnect,
  sendTransportOnProduce,
  subscribe,
} from '../services/live/StreamingServerService';
import {appServerWS, streamingServerWS} from '../services/ws';

export default function useBroadcast(
  broadcastId,
  mode = 'Host' || 'Audience' || 'Co-Host',
) {
  const user = getUser();
  const device = useRef(null);
  const deviceSendTransport = useRef(null);
  const deviceReceiveTransport = useRef(null);
  const vProducer = useRef(null);
  const aProducer = useRef(null);
  const localData = getAppLocalData();
  const originId = user._id;

  // States
  const [broadcast, setBroadcast] = useState(null);
  const [streamKind, setStreamKind] = useState(null);
  const [isBroadcastChecked, setIsBroadcastChecked] = useState(false);
  const [isBroadcastEnded, setIsBroadcastEnded] = useState(false);
  const [subscriberId, setSubscriberId] = useState(null);
  const [isProducing, setIsProducing] = useState(false);
  const [remoteStreams, setRemoteStreams] = useState([]);
  const [currentViewerCount, setCurrentViewerCount] = useState(0);
  const [latestFiveViewers, setLatestFiveViewers] = useState([]);
  const [isConsuming, setIsConsuming] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [isCoHost, setIsCoHost] = useState(false);
  const [hostList, setHostList] = useState([]);

  const checkBroadcastStatus = async (userId, broadcastId) => {
    const ssBroadcast = await inquireBroadcast(userId, broadcastId, {});

    if (ssBroadcast.timeBook.endedAt) {
      setIsBroadcastEnded(true);
      return;
    }
    setIsBroadcastEnded(false);
    const asBroadcast = await bsGetBroadcast({broadcastId});
    setBroadcast(asBroadcast.broadcast);
    setStreamKind(asBroadcast.broadcast.streamKind);
  };

  useEffect(() => {
    checkBroadcastStatus(originId, broadcastId).then(() => {
      setIsBroadcastChecked(true);
    });
  }, [broadcastId]);

  const [called, setCalled] = useState(0);

  console.log(isBroadcastEnded, 'BS_STATUS>>');

  // console.log(called);
  useEffect(() => {
    (async () => {
      //
      if (!isBroadcastChecked) {
        await checkBroadcastStatus(user._id, broadcastId);
        setIsBroadcastChecked(true);
      } else if (mode === 'Host' && !isProducing && streamKind) {
        console.log('BROADCASET', isBroadcastChecked);
        // In general host start producing
        await startProducing(streamKind);
        setIsProducing(true);
      } else if (mode === 'Audience' && !isConsuming && streamKind) {
        // In general audience start consuming
        await startConsuming();
        await loadBroadcastStream(streamKind);
        setIsConsuming(true);
      } else if (
        mode === 'Audience' &&
        isCoHost &&
        !isProducing &&
        streamKind
      ) {
        // when audience will start co-hosting, start producing
        await startProducing(streamKind);
        setIsProducing(true);
      }
    })();

    // return () => {
    //   setIsBroadcastChecked(false);
    //   setIsConsuming(false);
    //   setIsCoHost(false);
    //   setIsProducing(false);
    // };
  }, [isBroadcastChecked, isProducing, isConsuming, isCoHost, streamKind]);

  //   Listeners
  useEffect(() => {
    // Notifier Listener : new producer added in this broadcast
    streamingServerWS.on(`new-producer-${broadcastId}`, async () => {
      console.log('NEW_PRODUCER_JOIN__');
      // console.log("PRODUCER_JOINNED")
      await loadBroadcastStream(streamKind);
    });

    // Notifier Listener : new viewer added in this broadcast
    appServerWS
      .on(`core::new-viewer-joined-${broadcastId}`, async payload => {
        setLatestFiveViewers(payload.data.lastFives);
        setCurrentViewerCount(payload.data.currentViewerCount);
        console.log('NEW_VIWER_JOINED__');
      })
      .on(`core::broadcast-ended-${broadcastId}`, async () => {
        setIsBroadcastEnded(true);
      });

    if (mode == 'Audience') {
      appServerWS.on(`req::join-in-seat-to-${user._id}`, async data => {
        const sender = await getUserById(data.data.originId);

        Alert.alert(
          `${sender.name} asked to join you as host`,
          'Do you want to seat?',
          [
            {
              text: 'No',
              style: 'cancel',
              onPress: async () => {
                appServerWS.emit('res::join-in-seat', {
                  agreed: false,
                  originId: data.data.originId,
                });
              },
            },
            {
              text: 'Yes',
              style: 'destructive',
              // If the user confirmed, then we dispatch the action we blocked earlier
              // This will continue the action that had triggered the removal of the screen
              onPress: async () => {
                appServerWS.emit('res::join-in-seat', {
                  agreed: true,
                  originId: data.data.originId,
                });
                // HERE_START_THE_WORK_TO_JOIN_AS_HOST
                setIsCoHost(true);
              },
            },
          ],
        );
      });
    }

    return () => {
      streamingServerWS.off(`new-producer-${broadcastId}`);
      appServerWS
        .off(`req::join-in-seat-to-${user._id}`)
        .off(`core::broadcast-ended-${broadcastId}`)
        .off(`core::new-viewer-joined-${broadcastId}`);
    };
  }, [streamKind, mode, broadcastId]);

  //   functions

  const handleEndBroadcast = async () => {
    try {
      if (mode == 'Host') {
        await stopProducing();
        await bsStopBroadcasting({broadcastId, userId: user._id});
        await endBroadcasting(user._id, broadcastId, localData);
      }
      deviceReceiveTransport.current?.close();
    } catch (err) {
      console.error('Caught error in ending broadcast', err);
    }
  };

  async function createAndLoadDevice() {
    try {
      // create & load device
      device.current = new Device();
      const routerRtpCaps = await rtpCaps(user._id, broadcastId);

      //  load device
      await device.current.load({
        routerRtpCapabilities: routerRtpCaps,
      });
    } catch (err) {
      console.error('Caught error in createAndLoadDevice', err);
    }
  }

  async function startProducing(streamKind) {
    try {
      const serverWebRtcTransport = await createServerTransportToPublish(
        originId,
        broadcastId,
        localData,
      );
      // join as broadcaster in app server
      await bsJoinAsBroadcaster({
        broadcastId,
        userId: user._id,
        publisherId: serverWebRtcTransport.publisher.transportId,
        streamKind,
      });

      if (!device.current) {
        await createAndLoadDevice();
      }

      // create sendTransport in client side
      deviceSendTransport.current = device.current.createSendTransport(
        serverWebRtcTransport.transportOptions,
      );
      // define sendTransport event listeners
      deviceSendTransport.current.on(
        'connect',
        async ({dtlsParameters}, callback, errback) => {
          try {
            const sendTransportConnected = await sendTransportOnConnect(
              originId,
              broadcastId,
              deviceSendTransport.current.id,
              dtlsParameters,
            );
            callback(sendTransportConnected);
          } catch (error) {
            throw new Error(error);
          }
        },
      );
      deviceSendTransport.current.on(
        'produce',
        async ({kind, rtpParameters, appData}, callback, errback) => {
          try {
            const sendTransportProduced = await sendTransportOnProduce(
              originId,
              broadcastId,
              deviceSendTransport.current.id,
              kind,
              rtpParameters,
            );
            callback(sendTransportProduced);
          } catch (error) {
            throw new Error(error);
          }
        },
      );

      let lStream;
      if (streamKind === 'OTMAV' || streamKind === 'FTMAV') {
        lStream = await localAV.getUserMedia({
          audio: true,
          video: true,
          options: {isFrontCam: true},
        });

        const vTrack = lStream.getVideoTracks()[0];
        const aTrack = lStream.getAudioTracks()[0];
        // producing audio and video
        vProducer.current = await deviceSendTransport.current.produce({
          track: vTrack,
        });
        aProducer.current = await deviceSendTransport.current.produce({
          track: aTrack,
        });
      } else {
        lStream = await localAV.getUserMedia({
          audio: true,
          video: false,
          // options: {isFrontCam: true},
        });
        // producing audio only
        const aTrack = lStream.getAudioTracks()[0];
        aProducer.current = await deviceSendTransport.current.produce({
          track: aTrack,
        });
      }
      setLocalStream(lStream);
    } catch (err) {
      console.error('Caught error in producing', err);
    }
  }

  async function stopProducing() {
    // closing producers
    try {
      if (vProducer.current) {
        vProducer.current.close();
      }
      aProducer.current.close();

      // closing transports
      deviceSendTransport.current.close();
    } catch (err) {
      console.error('Caught error in stop producing', err);
    }
  }

  async function startConsuming() {
    try {
      if (!device.current) {
        await createAndLoadDevice();
      }

      // subscribe_to_broadcast
      let subscribeToBroadcast = await subscribe(originId, broadcastId, {});
      setSubscriberId(subscribeToBroadcast.subscriber.subscriberId);

      // self join the new broadcast
      await joinBroadcast(originId, broadcastId, localData);

      // backendRecord for joinig broadcast
      await bsJoinBroadcast({
        broadcastId,
        userId: user._id,
        subscriberId: subscribeToBroadcast.subscriber.subscriberId,
      });
      // if (mode !== 'Host') {
      //   await loadBroadcastStream(streamKind);
      // }
    } catch (err) {
      console.error('Caught error in consuming broadcast', err);
    }
  }

  async function loadBroadcastStream(streamKind) {
    try {
      const currentPublishers = await onAirPublishers(user._id, broadcastId);
      const publishers = currentPublishers.publishers;
      const rStreams = [];
      if (publishers.length == 0) {
        console.log('No Producer is Producing Now.');
        return;
      }
      for (let i = 0; i < publishers.length; i++) {
        let currentPublisher = publishers[i].publisher;
        const currentUser = await getUserById(currentPublisher.meta.originId);
        let currentProducers = publishers[i].producers;

        // create consumer Transport in Server
        const serverConsumerTransport = await createServerTransportToConsume(
          originId,
          broadcastId,
          subscriberId,
          localData,
        );
        // create device.current.receive transport
        deviceReceiveTransport.current =
          await device.current.createRecvTransport(
            serverConsumerTransport.transportOptions,
          );
        // define recvTransport event listeners
        deviceReceiveTransport.current.on(
          'connect',
          async ({dtlsParameters}, callback, errback) => {
            const recvTransportConnected = await deviceRecvTransportConnect(
              originId,
              broadcastId,
              deviceReceiveTransport.current.id,
              dtlsParameters,
            );
            callback(recvTransportConnected);
          },
        );

        const consumers = [];
        for (let j = 0; j < currentProducers.length; j++) {
          const producer = currentProducers[j];

          // command transport to consume
          const recvTransportConsume = await deviceRecvTransportConsume(
            originId,
            broadcastId,
            deviceReceiveTransport.current.id,
            producer.producerId,
            device.current.rtpCapabilities,
          );

          // create consumer
          let consumer = await deviceReceiveTransport.current.consume({
            id: recvTransportConsume.id,
            producerId: recvTransportConsume.producerId,
            kind: recvTransportConsume.kind,
            rtpParameters: recvTransportConsume.rtpParameters,
          });

          consumer.on('transportclose', () => {
            console.log('transport closed so consumer closed');
            consumer.close();
          });

          consumer.on('producerclose', () => {
            console.log('associated producer closed so consumer closed');
            consumer.close();
          });

          consumers.push(consumer);
        }
        let stream = new MediaStream();
        if (streamKind === 'FTMA') {
          const audioConsumer = consumers[0];
          if (audioConsumer?._track) {
            stream.addTrack(audioConsumer?._track);
            await resumeConsumer(originId, broadcastId, audioConsumer.id);

            console.log(
              !audioConsumer?.paused
                ? 'Audio is being consumed'
                : 'Audio is not being consumed',
            );
          } else {
            console.log('TRACK_MISSING_IN_FTMA::A Loading');
          }
        } else {
          const videoConsumer = consumers[0];
          const audioConsumer = consumers[1];

          if (audioConsumer?._track && videoConsumer?._track) {
            stream.addTrack(videoConsumer?._track);
            stream.addTrack(audioConsumer?._track);
            await resumeConsumer(originId, broadcastId, audioConsumer.id);
            await resumeConsumer(originId, broadcastId, videoConsumer.id);
            console.log(
              !audioConsumer?.paused
                ? 'Audio is being consumed'
                : 'Audio is not being consumed',
            );
          } else {
            console.log('TRACK_MISSING_IN_NON-FTMA::AV Loading');
          }
        }

        rStreams.push({
          user: currentUser,
          stream,
          publisher: currentPublisher,
        });
      } // looping through producers
      setRemoteStreams(rStreams);
      setHostList(rStreams.map(x => x.user));
    } catch (error) {
      console.error('Caught Error in loadBroadcast', error);
    }
  }

  console.log('CALLED', called);

  return {
    broadcast,
    localStream,
    isCoHost,
    streamKind,
    hostList,
    isBroadcastEnded,
    subscriberId,
    remoteStreams,
    currentViewerCount,
    latestFiveViewers,
    endBroadcasting: handleEndBroadcast,
    stopProducing,
  };
}
