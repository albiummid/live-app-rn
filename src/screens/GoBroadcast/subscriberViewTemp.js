import {
  View,
  Text,
  FlatList,
  Image,
  TextInput,
  TouchableOpacity,
  Keyboard,
  Alert,
} from 'react-native';
import {mediaDevices} from 'react-native-webrtc';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {getUser} from '../../constants/values';
import {Device} from 'mediasoup-client';
import {
  createServerTransportToConsume,
  createServerTransportToPublish,
  deviceRecvTransportConnect,
  deviceRecvTransportConsume,
  inquireBroadcast,
  joinBroadcast,
  onAirPublishers,
  resumeConsumer,
  rtpCaps,
  sendTransportOnConnect,
  sendTransportOnProduce,
  subscribe,
} from '../../services/live/StreamingServerService';
import {
  bsGetBroadcast,
  bsJoinAsBroadcaster,
  bsJoinBroadcast,
  bsSendComment,
} from '../../services/live/AppServerService';
import {getAppLocalData} from '../../constants';
import {RTCView} from 'react-native-webrtc';
import {appServerWS, streamingServerWS} from '../../services/ws';
import {stickers} from '../../assets';
import {getUserById} from '../../api/user.api';

export default function SubscriberView({broadcastId}) {
  const [user, setUser] = useState(getUser());
  const [broadcastEnded, setBroadcastEnded] = useState(false);
  const [remoteStreams, setRemoteStreams] = useState([]);
  const [subscriberId, setSubscriberId] = useState(null);
  const device = useRef(null);
  const deviceSendTransport = useRef(null);
  const [publishers, setPublishers] = useState([]);
  const [currentViewerCount, setCurrentViewerCount] = useState(0);
  const [latestFiveViewers, setLatestFiveViewers] = useState([]);
  const [chats, setChats] = useState([]);
  const [renderChats, setRenderChats] = useState(0);
  const scrollViewRef = useRef(null);
  const [comment, setComment] = useState('');
  const localData = getAppLocalData();
  const [initialized, setInititalized] = useState(false);
  const [stickerPicker, setStickerPicker] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [broadcast, setBroadcast] = useState(null);

  const _initialJoinActions = async (broadcastId, userId, localData = {}) => {
    // inqure that broadcast is not ended
    const ssBroadcast = await inquireBroadcast(userId, broadcastId, {});
    if (ssBroadcast.timeBook.endedAt) {
      setBroadcastEnded(true);
      return;
    }
    setBroadcastEnded(false);
    // subscribe_to_broadcast
    let subscribeToBroadcast = await subscribe(userId, broadcastId, {});
    setSubscriberId(subscribeToBroadcast.subscriber.subscriberId);

    // self join the new broadcast
    await joinBroadcast(userId, broadcastId, localData);

    // backendRecord for joinig broadcast
    await bsJoinBroadcast({
      broadcastId,
      userId,
      subscriberId: subscribeToBroadcast.subscriber.subscriberId,
    });
  };

  async function __joinAsASubscriber(
    originId,
    broadcastId,
    subscriberId,
    publishers,
    localData,
  ) {
    // create & load device
    device.current = new Device();
    const routerRtpCaps = await rtpCaps(user._id, broadcastId);

    //  load device
    await device.current.load({
      routerRtpCapabilities: routerRtpCaps,
    });
    try {
      if (publishers.length > 0) {
        const {broadcast} = await bsGetBroadcast({broadcastId});

        for (let i = 0; i < publishers.length; i++) {
          let currentPublisher = publishers[i].publisher;
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
            console.log(producer, 'Ppppp');
            console.log('Producer On Loop', producer);
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
          let audioConsumer;
          let videoConsumer;

          if (
            broadcast.streamKind === 'OTMAV' ||
            broadcast.streamKind === 'FTMAV'
          ) {
            videoConsumer = consumers[0];
            audioConsumer = consumers[1];
            stream.addTrack(videoConsumer._track);
            stream.addTrack(audioConsumer._track);
            await resumeConsumer(originId, broadcastId, audioConsumer.id);
            await resumeConsumer(originId, broadcastId, videoConsumer.id);
          } else {
            audioConsumer = consumers[0];
            stream.addTrack(audioConsumer._track);
            await resumeConsumer(originId, broadcastId, audioConsumer.id);
          }

          setRemoteStreams(prv => prv.concat(stream));
          if (!audioConsumer?.paused) {
            console.log('Audio is being consumed');
          } else {
            console.log('Audio is not being consumed');
          }
        } // looping through producers
      } else {
        console.log('No Producer is Producing Now.');
      }
    } catch (error) {
      console.log('Caught Error in loadBroadcast');
      console.log(error);
    }
  }
  const __joinLiveAsHost = async (
    originId,
    broadcastId,
    localData,
    userId,
    streamKind,
  ) => {
    const serverWebRtcTransport = await createServerTransportToPublish(
      originId,
      broadcastId,
      localData,
    );
    const joinAsBroadcaster = await bsJoinAsBroadcaster({
      broadcastId,
      userId,
      publisherId: serverWebRtcTransport.publisher.transportId,
      streamKind,
    });
    // create & load device
    device.current = new Device();
    const routerRtpCaps = await rtpCaps(user._id, broadcastId);

    //  load device
    await device.current.load({
      routerRtpCapabilities: routerRtpCaps,
    });

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

    const localStream = await mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });

    // get mediatrack
    // Produce our webcam video.
    const audioTrack = localStream.getAudioTracks()[0];

    // producing audio only
    const audioTrackProducer = await deviceSendTransport.current.produce({
      track: audioTrack,
    });
  };

  useEffect(() => {
    if (broadcastId) {
      console.log('INITIATING__BROADLCAST_JOINING_ACTIONS');
      _initialJoinActions(broadcastId, user._id, localData).then(async () => {
        const currentPublishers = await onAirPublishers(user._id, broadcastId);
        setPublishers(currentPublishers.publishers);
        await __joinAsASubscriber(
          user._id,
          broadcastId,
          subscriberId,
          currentPublishers.publishers,
          localData,
        );
      });
    }
  }, [broadcastId]);

  console.log(broadcast);

  useEffect(() => {
    if (broadcastId) {
      // Notifier Listener : new producer added in this broadcast
      streamingServerWS
        .off(`new-producer-${broadcastId}`)
        .on(`new-producer-${broadcastId}`, async payload => {
          console.log('New Producer Joined');
          const currentPublishers = await onAirPublishers(
            user._id,
            broadcastId,
          );
          setPublishers(currentPublishers.publishers);
          await __joinAsASubscriber(
            user._id,
            broadcastId,
            subscriberId,
            currentPublishers.publishers,
            localData,
          );
        });

      // Notifier Listener : new viewer added in this broadcast
      appServerWS
        .off(`core::new-viewer-joined-${broadcastId}`)
        .on(`core::new-viewer-joined-${broadcastId}`, async payload => {
          setChats(prv => [
            {
              kind: 'text',
              content: payload.data.chatText,
              chatText: payload.data.chatText,
            },
            ...prv,
          ]);
          setLatestFiveViewers(payload.data.lastFives);
          setCurrentViewerCount(payload.data.currentViewerCount);
          setRenderChats(renderChats + 1);
        });

      // Notifier Listener : new comment in this broadcast
      appServerWS
        .off(`core::new-comment-${broadcastId}`)
        .on(`core::new-comment-${broadcastId}`, async payload => {
          console.log(payload, 'p');
          setChats(prv => [
            {
              name: payload.data.name,
              chatText: payload.data.chatText,
              content: payload.data.comment,
              kind: payload.data.kind,
            },
            ...prv,
          ]);
        });

      // Notifier Listener : new comment in this broadcast
      appServerWS
        .off(`core::broadcast-ended-${broadcastId}`)
        .on(`core::broadcast-ended-${broadcastId}`, async payload => {
          console.log('Core Broadcast Ended');
          console.log(payload.data);
        });
    }

    // Listener :: a host request to join as host
    appServerWS
      .off(`req::join-in-seat-to-${user._id}`)
      .on(`req::join-in-seat-to-${user._id}`, async data => {
        const sender = await getUserById(data.data.originId);
        const broadcast = await bsGetBroadcast({broadcastId});

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
                __joinLiveAsHost(
                  user._id,
                  broadcastId,
                  localData,
                  user._id,
                  broadcast.streamKind,
                );
              },
            },
          ],
        );
      });
  }, [broadcastId]);

  const handleCommentPress = useCallback(async () => {
    if (comment != '') {
      await bsSendComment({
        broadcastId,
        userId: user._id,
        subscriberId,
        comment,
        chatText: `${user.name}: ${comment}`,
        name: user.name,
        kind: 'text' || 'sticker',
      });
      setComment('');
    }
  }, [broadcastId, user, comment]);

  const handleStickerPress = async stickerName => {
    await bsSendComment({
      broadcastId,
      userId: user._id,
      subscriberId,
      comment: stickerName,
      chatText: `${user.name}:\n\n ${stickerName}`,
      name: user.name,
      kind: 'sticker',
    });
  };

  if (broadcastEnded) {
    return (
      <View>
        <Text>Broadcast Ended</Text>
      </View>
    );
  }

  return (
    <View style={{flex: 1, position: 'relative'}}>
      {remoteStreams?.map((x, i) => {
        console.log(x);
        return (
          <RTCView
            style={{flex: 1, width: 440, height: 200}}
            mirror
            key={i}
            streamURL={x.toURL()}
          />
        );
      })}
      <View className="absolute bottom-5  w-full">
        {/* Footer overlay */}
        <View className=" w-full ">
          <FlatList
            className="h-96 w-full mx-3 "
            data={chats}
            inverted
            renderItem={({item}) => {
              if (item.kind === 'text') {
                return (
                  <Text className="bg-black/40 text-white px-4 py-2 rounded-xl  mr-auto my-2  ">
                    {item.chatText}
                  </Text>
                );
              } else if (item.kind === 'sticker') {
                return (
                  <View className="bg-black/40 text-white my-2 mr-auto  px-4 py-2 rounded-xl ">
                    <Text className="text-white">{item.name}:</Text>
                    <Image
                      className=" object-cover w-20 h-20"
                      source={stickers[item.content]}
                    />
                  </View>
                );
              }
            }}
          />
          <View className="flex-row space-x-2 mx-3 items-center">
            <TextInput
              className=" bg-black/30 rounded-xl flex-1 px-3 py-2"
              placeholderTextColor={'white'}
              placeholder="Say Hi!"
              onChangeText={setComment}
              value={comment}
            />
            <TouchableOpacity
              className="bg-black/30 px-4 py-3 rounded-xl"
              onPress={handleCommentPress}>
              <Text className="text-white">Send</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={async () => {
                Keyboard.dismiss();
                setStickerPicker(prv => !prv);
              }}>
              <Image
                className="w-10 h-10 rounded-full"
                source={require('../../assets/images/gift-boxes.png')}
              />
            </TouchableOpacity>
          </View>

          {stickerPicker && (
            <FlatList
              className=" my-2"
              numColumns={4}
              data={Object.entries(stickers).map(([sName, sURI]) => ({
                sName,
                sURI,
              }))}
              contentContainerStyle={{
                alignItems: 'center',
              }}
              renderItem={({item}) => {
                return (
                  <TouchableOpacity
                    onPress={() => {
                      handleStickerPress(item.sName);
                    }}>
                    <Image
                      style={{objectFit: 'contain'}}
                      source={item.sURI}
                      className=" object w-16 h-16 mx-2"
                    />
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </View>
      </View>
    </View>
  );
}
