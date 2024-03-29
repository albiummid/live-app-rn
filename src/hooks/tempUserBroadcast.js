import {View, Text} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
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
import {getUser} from '../constants/values';
import {
  bsGetBroadcast,
  bsJoinAsBroadcaster,
  bsJoinBroadcast,
  bsStopBroadcasting,
} from '../services/live/AppServerService';
import {appServerWS, streamingServerWS} from '../services/ws';
import {getAppLocalData} from '../constants';
import {Device} from 'mediasoup-client';
import {getUserById} from '../api/user.api';

export default function useBroadcast(
  broadcastId,
  mode = 'Host' || 'Audience',
  localStream,
) {
  const user = getUser();
  const device = useRef(null);
  const deviceSendTransport = useRef(null);
  const vProducer = useRef(null);
  const aProducer = useRef(null);
  const localData = getAppLocalData();
  const originId = user._id;
  const [broadcast, setBroadcast] = useState(null);
  const [streamKind, setStreamKind] = useState(null);
  const [isBroadcastEnded, setIsBroadcastEnded] = useState(false);
  const [subscriberId, setSubscriberId] = useState(null);
  const [publishers, setPublishers] = useState([]);

  const [isJoinedInBroadcast, setIsJoinedInBroadcast] = useState(false);
  const [isBroadcastingStarted, setIsBroadcastingStarted] = useState(false);
  const [remoteStreams, setRemoteStreams] = useState([]);
  const [currentViewerCount, setCurrentViewerCount] = useState(0);
  const [latestFiveViewers, setLatestFiveViewers] = useState([]);
  const [isInquiryDone, setIsInquiryDone] = useState(false);
  const [isSubsciribingStarted, setIsSubscribingStarted] = useState(false);

  useEffect(() => {
    (async () => {
      //
      try {
        if (broadcastId && user) {
          const ssBroadcast = await inquireBroadcast(user._id, broadcastId, {});

          if (ssBroadcast.timeBook.endedAt) {
            setIsBroadcastEnded(true);
            return;
          }
          setIsBroadcastEnded(false);
          const asBroadcast = await bsGetBroadcast({broadcastId});
          setBroadcast(asBroadcast.broadcast);
          setStreamKind(asBroadcast.broadcast.streamKind);
          // joining to the broadcast
          setIsInquiryDone(true);
        }
      } catch (err) {
        console.log('ERROR__: BROADCAST JOINING__: L56');
      }
      //
    })();
  }, [isJoinedInBroadcast, localStream]);

  useEffect(() => {
    if (
      isInquiryDone &&
      localStream &&
      mode == 'Host' &&
      !isBroadcastingStarted
    ) {
      (async () => {
        //
        await startSubscribingAsAudience();
        await startBroadcastingAsHost(broadcastId, localStream);

        //
      })();
    } else if (isInquiryDone && mode === 'Audience' && !isSubsciribingStarted) {
      startSubscribingAsAudience();
    }
  }, [
    isJoinedInBroadcast,
    isBroadcastingStarted,
    localStream,
    isSubsciribingStarted,
  ]);

  //   Listeners
  useEffect(() => {
    // Notifier Listener : new producer added in this broadcast
    streamingServerWS
      .off(`new-producer-${broadcastId}`)
      .on(`new-producer-${broadcastId}`, onNewProducerJoin);

    // Notifier Listener : new viewer added in this broadcast
    appServerWS
      .off(`core::new-viewer-joined-${broadcastId}`)
      .on(`core::new-viewer-joined-${broadcastId}`, onNewViewerJoin);

    // Notifier Listener : new comment in this broadcast
    appServerWS
      .off(`core::broadcast-ended-${broadcastId}`)
      .on(`core::broadcast-ended-${broadcastId}`, onBroadcastEnded);
  }, [broadcastId, streamKind]);

  //   functions

  async function onBroadcastEnded(payload) {
    setIsBroadcastEnded(true);
  }

  async function onNewViewerJoin(payload) {
    console.log('NEEW_JOINED', payload);
    setLatestFiveViewers(payload.data.lastFives);
    setCurrentViewerCount(payload.data.currentViewerCount);
  }
  async function onNewProducerJoin(payload) {
    loadBroadcastStream(broadcastId);
  }

  const handleEndBroadcast = async () => {
    if (mode == 'Host') {
      // closing producers
      if (vProducer.current) {
        vProducer.current.close();
      }
      aProducer.current.close();

      // closing transports
      deviceSendTransport.current.close();
    }
    await bsStopBroadcasting({broadcastId, userId: user._id});
    await endBroadcasting(user._id, broadcastId, localData);
  };

  async function createAndLoadDevice() {
    // create & load device
    device.current = new Device();
    const routerRtpCaps = await rtpCaps(user._id, broadcastId);

    //  load device
    await device.current.load({
      routerRtpCapabilities: routerRtpCaps,
    });
  }

  async function startBroadcastingAsHost(broadcastId, localStream) {
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

    if (!localStream) {
      throw new Error('Localstream not generated');
    }

    if (streamKind === 'OTMAV' || streamKind === 'FTMAV') {
      const vTrack = localStream.getVideoTracks()[0];
      const aTrack = localStream.getAudioTracks()[0];
      // producing audio and video
      vProducer.current = await deviceSendTransport.current.produce({
        track: vTrack,
      });
      aProducer.current = await deviceSendTransport.current.produce({
        track: aTrack,
      });
    } else {
      // producing audio only
      const aTrack = localStream.getAudioTracks()[0];
      aProducer.current = await deviceSendTransport.current.produce({
        track: aTrack,
      });
    }

    setIsBroadcastingStarted(true);
  }

  async function loadBroadcastStream(broadcastId) {
    try {
      const currentPublishers = await onAirPublishers(user._id, broadcastId);
      const publishers = currentPublishers.publishers;
      if (publishers.length > 0) {
        for (let i = 0; i < publishers.length; i++) {
          let currentPublisher = publishers[i].publisher;
          const currentUser = await getUserById(currentPublisher.meta.originId);
          let currentProducers = publishers[i].producers;
          console.log('Current Publisher', currentPublisher);
          console.log('Current Producers', currentProducers);

          // create consumer Transport in Server
          const serverConsumerTransport = await createServerTransportToConsume(
            originId,
            broadcastId,
            subscriberId,
            localData,
          );
          // create device.current.receive transport
          const deviceRecvTransport = await device.current.createRecvTransport(
            serverConsumerTransport.transportOptions,
          );
          // define recvTransport event listeners
          deviceRecvTransport.on(
            'connect',
            async ({dtlsParameters}, callback, errback) => {
              const recvTransportConnected = await deviceRecvTransportConnect(
                originId,
                broadcastId,
                deviceRecvTransport.id,
                dtlsParameters,
              );
              console.log('Recv Transport Connected', recvTransportConnected);
              callback(recvTransportConnected);
            },
          );

          const consumers = [];
          for (let j = 0; j < currentProducers.length; j++) {
            const producer = currentProducers[i];
            console.log('Producer On Loop');
            // command transport to consume
            const recvTransportConsume = await deviceRecvTransportConsume(
              originId,
              broadcastId,
              deviceRecvTransport.id,
              producer.producerId,
              device.current.rtpCapabilities,
            );

            // create consumer
            let consumer = await deviceRecvTransport.consume({
              id: recvTransportConsume.id,
              producerId: recvTransportConsume.producerId,
              kind: recvTransportConsume.kind,
              rtpParameters: recvTransportConsume.rtpParameters,
            });

            consumers.push(consumer);
          }
          let stream = new MediaStream();
          console.log(streamKind, streamKind === 'FTMA', 'STATUS>>');
          if (streamKind === 'FTMA') {
            const audioConsumer = consumers[0];
            stream.addTrack(audioConsumer._track);
            await resumeConsumer(originId, broadcastId, audioConsumer.id);
            if (!audioConsumer?.paused) {
              console.log('Audio is being consumed');
            } else {
              console.log('Audio is not being consumed');
            }
          } else {
            const videoConsumer = consumers[0];
            const audioConsumer = consumers[1];
            stream.addTrack(videoConsumer._track);
            stream.addTrack(audioConsumer._track);
            await resumeConsumer(originId, broadcastId, audioConsumer.id);
            await resumeConsumer(originId, broadcastId, videoConsumer.id);
            if (!audioConsumer?.paused) {
              console.log('Audio is being consumed');
            } else {
              console.log('Audio is not being consumed');
            }
          }

          setRemoteStreams(prv =>
            prv.concat({
              user: currentUser,
              stream,
              publisher: currentPublisher,
            }),
          );
        } // looping through producers
      } else {
        console.log('No Producer is Producing Now.');
      }
    } catch (error) {
      console.log('Caught Error in loadBroadcast');
      console.log(error);
    }
  }

  async function startSubscribingAsAudience() {
    await createAndLoadDevice();
    // subscribe_to_broadcast
    let subscribeToBroadcast = await subscribe(user._id, broadcastId, {});
    setSubscriberId(subscribeToBroadcast.subscriber.subscriberId);

    // self join the new broadcast
    await joinBroadcast(user._id, broadcastId, localData);

    // backendRecord for joinig broadcast
    await bsJoinBroadcast({
      broadcastId,
      userId: user._id,
      subscriberId: subscribeToBroadcast.subscriber.subscriberId,
    });
    setIsJoinedInBroadcast(true);
  }

  return {
    device,
    deviceSendTransport,
    broadcast,
    streamKind,
    isBroadcastEnded,
    subscriberId,
    publishers,
    isJoinedInBroadcast,
    remoteStreams,
    currentViewerCount,
    latestFiveViewers,
    startBroadcastingAsHost,
    endBroadcasting: handleEndBroadcast,
  };
}
