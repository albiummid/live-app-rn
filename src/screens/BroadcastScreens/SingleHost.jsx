import React, {useState, useEffect, useRef} from 'react';
import {useNavigation} from '@react-navigation/native';
import {
  ScrollView,
  Text,
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  BackHandler,
} from 'react-native';
import {Device} from 'mediasoup-client';
import {registerGlobals} from 'react-native-webrtc';
registerGlobals();
import {
  inquireBroadcast,
  joinBroadcast,
  initiateBroadcast,
  subscribe,
  createServerTransportToPublish,
  sendTransportOnConnect,
  sendTransportOnProduce,
  onAirProducers,
  rtpCaps,
  createServerTransportToConsume,
  deviceRecvTransportConnect,
  deviceRecvTransportConsume,
  resumeConsumer,
  endBroadcasting,
  onAirPublishers,
} from '../../services/live/StreamingServerService';
import {
  bsGetBroadcast,
  bsJoinBroadcast,
  bsJoinAsBroadcaster,
  bsSendComment,
  bsStopBroadcasting,
} from '../../services/live/AppServerService';
import {LIVE_APP_ID, LIVE_APP_KEY, LIVE_APP_SECRET} from '../../../settings.js';

import {RTCPeerConnection, RTCView, mediaDevices} from 'react-native-webrtc';
import SingleHostRemoteStream from './SingleHostRemoteStream';
import {getUserById} from '../../api/user.api';
import {ldb} from '../../libs/ldb';
import {ldbKeys} from '../../constants/keys';
import {streamingServerWS, appServerWS} from '../../services/ws';

let device;
let deviceSendTransport;

function SingleHost(props) {
  const navigation = useNavigation();
  const scrollViewRef = useRef();
  const [broadcastId, setBroadcastId] = useState(
    props?.broadcastId ? props.broadcastId : null,
  );
  const [streamKind, setStreamKind] = useState('');
  const [seats, setSeats] = useState(0);
  const [mode, setMode] = useState(props?.mode ? props.mode : 'Watch');
  const [originId, setOriginId] = useState(
    props?.user ? props.user._id : 'NoOrigin',
  );
  const [user, setUser] = useState(props?.user ? props.user : {});
  const [localData, setLocalData] = useState({});
  const [broadcastEnded, setBroadcastEnded] = useState(false);
  const [renderCount, setRenderCount] = useState(1);
  const [broadcastHost, setBroadcastHost] = useState({});

  const [publishers, setPublishers] = useState([]);
  const [producers, setProducers] = useState([]);
  const [subscriberId, setSubscriberId] = useState('');
  const [consuming, setConsuming] = useState(false);
  const [remoteVideoTrack, setRemoteVideoTrack] = useState(null);
  const [gotRemoteStream, setGotRemoteStream] = useState(false);

  const [waitForPublisher, setWaitForPublisher] = useState(false);

  const [currentViewerCount, setCurrentViewerCount] = useState(0);
  const [latestFiveViewers, setLatestFiveViewers] = useState([]);
  const [chats, setChats] = useState([]);
  const [renderChats, setRenderChats] = useState(0);
  const [comment, setComment] = useState('');

  useEffect(() => {
    const unsubscribe = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackButton,
    );
    (async () => {
      const localUser = await getUserById(ldb.get(ldbKeys.user_id));
      setUser(localUser);
      const lData = {
        app: {
          appId: LIVE_APP_ID,
          auth: {
            key: LIVE_APP_KEY,
            secret: LIVE_APP_SECRET,
          },
        },
        native: {
          user: {
            id: localUser._id,
            name: localUser.name,
            image: localUser.profileImage,
          },
        },
      };

      setLocalData(lData);
    })();

    if (!broadcastId) {
      console.log('Broadcast is null');
    }

    async function __inquire(broadcastId) {
      try {
        console.log('User');
        console.log(user);
        console.log('SingleHost BroadcastId', broadcastId);
        const broadcast = await inquireBroadcast(originId, broadcastId, {});

        if (broadcast.timeBook.endedAt !== null) {
          setBroadcastEnded(true);
          // render broadcast ended screen
        } else {
          const bsBroadcast = await bsGetBroadcast({broadcastId});
          setStreamKind(bsBroadcast.broadcast.streamKind);
          setSeats(bsBroadcast.broadcast.seats);
          console.log('BS Broadcast  --> ', bsBroadcast);
          setBroadcastHost(bsBroadcast.broadcast.host);

          // create new subscriber
          const subscribeToBroadcast = await subscribe(
            originId,
            broadcast.broadcastId,
            {},
          );
          console.log(
            'Subscribe to Broadcast',
            subscribeToBroadcast.subscriber.subscriberId,
          );
          setSubscriberId(subscribeToBroadcast.subscriber.subscriberId);
          // create & load device
          device = new Device();
          const routerRtpCaps = await rtpCaps(originId, broadcast.broadcastId);
          console.log(routerRtpCaps);
          const deviceLoaded = await device.load({
            routerRtpCapabilities: routerRtpCaps,
          });
          console.log(deviceLoaded);
          // self join the new broadcast
          const joinedBroadcast = await joinBroadcast(
            originId,
            broadcast.broadcastId,
            localData,
          );

          console.log('LS Joined Broadcast', joinedBroadcast);

          const bsJoinedBroadcast = await bsJoinBroadcast({
            broadcastId,
            userId: user._id,
            subscriberId: subscribeToBroadcast.subscriber.subscriberId,
          });
          console.log(
            'Joined Broadcast Producers',
            joinedBroadcast.producers.length,
          );
          if (joinedBroadcast.producers.length > 0) {
            __setPublishers(originId, broadcastId);
          } else {
            console.log('Time to publish');
            // publish
            if (mode == 'Host') {
              // go Live
              await goLive(originId, broadcastId, localData, user._id, 'Host');
            } else {
              setWaitForPublisher(true);
            }
          }
        }
      } catch (error) {
        console.log('Join Broadcast Inquire Error');
        console.log(error);
        setBroadcastEnded(true);
      }
    }
    console.log('Inquiring');
    __inquire(broadcastId);

    // Notifier Listener : new producer added in this broadcast
    streamingServerWS.on(`new-producer-${broadcastId}`, async payload => {
      console.log('New Producer Joined');
      await __setPublishers(originId, broadcastId);
    });

    // Notifier Listener : new viewer added in this broadcast
    appServerWS.on(`core::new-viewer-joined-${broadcastId}`, async payload => {
      console.log('Core New Viewer Joined');
      console.log(payload.data);
      chats.push(payload.data.chatText);
      setChats(chats);
      setLatestFiveViewers(payload.data.lastFives);
      setCurrentViewerCount(payload.data.currentViewerCount);
      setRenderChats(renderChats + 1);
    });

    // Notifier Listener : new comment in this broadcast
    appServerWS.on(`core::new-comment-${broadcastId}`, async payload => {
      console.log('Core New Comment');
      console.log(payload.data);
      chats.push(payload.data.chatText);
      setChats(chats);
      setRenderChats(renderChats + 1);
    });

    // Notifier Listener : new comment in this broadcast
    appServerWS.on(`core::broadcast-ended-${broadcastId}`, async payload => {
      console.log('Core Broadcast Ended');
      console.log(payload.data);
      setBroadcastId(payload.data.broadcastId);
    });
  }, []);

  // what happens after publishers changes
  useEffect(() => {
    console.log('Publishers updated');
    console.log(publishers);
    console.log(publishers.length);
    async function __loadBroadcast() {
      console.log('___ Loading Broadcast');
      await loadBroadcast(
        originId,
        broadcastId,
        subscriberId,
        publishers,
        localData,
      );
    }
    if (publishers.length > 0) {
      __loadBroadcast();
    }
  }, [publishers]);

  const handleBackButton = () => {
    console.log('BackButton Pressed');
    return true;
  };

  async function __setProducers(originId, broadcastId) {
    const currentProducers = await onAirProducers(originId, broadcastId);
    setProducers(currentProducers.producers);
  }

  async function __setPublishers(originId, broadcastId) {
    const currentPublishers = await onAirPublishers(originId, broadcastId);
    console.log('Set Publishers', currentPublishers);
    setPublishers(currentPublishers.publishers);
  }

  async function goLive(originId, broadcastId, localData, userId, kind) {
    // request server to create a webRtcTransport
    const serverWebRtcTransport = await createServerTransportToPublish(
      originId,
      broadcastId,
      localData,
    );
    console.log(serverWebRtcTransport);
    const joinAsBroadcaster = await bsJoinAsBroadcaster({
      broadcastId,
      userId,
      publisherId: serverWebRtcTransport.publisher.transportId,
      kind,
    });
    // create sendTransport in client side
    deviceSendTransport = await device.createSendTransport(
      serverWebRtcTransport.transportOptions,
    );
    // define sendTransport event listeners
    deviceSendTransport.on(
      'connect',
      async ({dtlsParameters}, callback, errback) => {
        try {
          console.log('Send Transport Connect Called');
          const sendTransportConnected = await sendTransportOnConnect(
            originId,
            broadcastId,
            deviceSendTransport.id,
            dtlsParameters,
          );
          callback(sendTransportConnected);
        } catch (error) {
          throw new Error(error);
        }
      },
    );
    deviceSendTransport.on(
      'produce',
      async ({kind, rtpParameters, appData}, callback, errback) => {
        try {
          console.log('User is Producing');
          const sendTransportProduced = await sendTransportOnProduce(
            originId,
            broadcastId,
            deviceSendTransport.id,
            kind,
            rtpParameters,
          );
          callback(sendTransportProduced);
        } catch (error) {
          throw new Error(error);
        }
      },
    );

    // get mediatrack
    // Produce our webcam video.
    const localStream = await mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    const videoTrack = localStream.getVideoTracks()[0];
    const audioTrack = localStream.getAudioTracks()[0];
    const videoTrackProducer = await deviceSendTransport.produce({
      track: videoTrack,
    });
    const audioTrackProducer = await deviceSendTransport.produce({
      track: audioTrack,
    });
    // get producers

    console.log('Track Sent for Producing');
  }

  // loadBroadcast
  async function loadBroadcast(
    originId,
    broadcastId,
    subscriberId,
    publishers,
    localData,
  ) {
    try {
      if (publishers.length > 0) {
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
          // create device receive transport
          const deviceRecvTransport = await device.createRecvTransport(
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
              device.rtpCapabilities,
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
          console.log('CONSUMERS');
          console.log(consumers[0]);

          const videoConsumer = consumers[0];
          const audioConsumer = consumers[1];

          const stream = new MediaStream();
          stream.addTrack(videoConsumer.track);
          stream.addTrack(audioConsumer.track);
          console.log('Remote consumer Stream', stream);

          setRemoteVideoTrack(stream);
          setGotRemoteStream(true);

          await resumeConsumer(originId, broadcastId, audioConsumer.id);
          await resumeConsumer(originId, broadcastId, videoConsumer.id);

          if (!audioConsumer.paused) {
            console.log('Audio is being consumed');
          } else {
            console.log('Audio is not being consumed');
          }

          /* 
          // command transport to consume
          const recvTransportConsume = await deviceRecvTransportConsume(
            originId, 
            broadcastId,
            deviceRecvTransport.id,
            currentProducerId,
            device.rtpCapabilities
          );

          
          
          let consumer = await deviceRecvTransport.consume({
            id: recvTransportConsume.id,
            producerId: recvTransportConsume.producerId,
            kind: recvTransportConsume.kind,
            rtpParameters: recvTransportConsume.rtpParameters
          })

          

          const { track } = consumer;
          
          
          const stream = new MediaStream();
          stream.addTrack(track);
          console.log('Remote consumer Stream', stream);

          setRemoteVideoTrack(stream);
          setGotRemoteStream(true);
          


          const resumeTrack = await resumeConsumer(originId, broadcastId, consumer.id);

          console.log("We are consuming", resumeTrack); */
        } // looping through producers
      } else {
        console.log('No Producer is Producing Now.');
      }
    } catch (error) {
      console.log('Caught Error in loadBroadcast');
      console.log(error);
    }
  }

  async function handleCommentPress() {
    if (comment != '') {
      await bsSendComment({
        broadcastId,
        userId: user._id,
        subscriberId,
        comment,
        chatText: `${user.name}: ${comment}`,
      });
      setComment('');
    }
  }

  async function handleClosePress() {
    console.log('handleClosePress');
    try {
      if (mode == 'Host') {
        // stop broadcasting in bs
        const endInLiveServer = await endBroadcasting(
          originId,
          broadcastId,
          localData,
        );
        console.log('endBroadcasting');
        console.log(endInLiveServer);
        if (endInLiveServer) {
          const bsStoppedBroadcast = await bsStopBroadcasting({
            broadcastId,
            userId: user._id,
          });
          setBroadcastEnded(true);
          navigation.navigate('BottomTabs', {screen: 'Home'});
        }
      } else {
        // navigate to home
        navigation.navigate('BottomTabs', {screen: 'Home'});
      }
    } catch (error) {
      console.log('Handle Close Press Error');
      console.log(error);
    }
  }

  async function handleGoHome() {
    navigation.navigate('BottomTabs', {screen: 'Home'});
  }

  if (broadcastEnded) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text>This Stream Has Ended</Text>
        <TouchableOpacity onPress={handleGoHome}>
          <Text>Go Home</Text>
        </TouchableOpacity>
      </View>
    );
  } else {
    if (!gotRemoteStream) {
      return (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Text>Loading ....</Text>
          <TouchableOpacity onPress={handleGoHome}>
            <Text>Go Home</Text>
          </TouchableOpacity>
        </View>
      );
    } else {
      return (
        <View style={styles.container}>
          <SingleHostRemoteStream stream={remoteVideoTrack} />

          <View style={styles.overlayContainer}>
            <View style={styles.boxContainer}>
              <View style={styles.commonHeader}>
                {/* Broadcaster Info Starts Here */}
                <View style={styles.broadcasterInfo}>
                  <Image
                    style={styles.hostImage}
                    source={{uri: broadcastHost?.profileImage ?? ''}}
                  />
                  <View style={styles.headerLeftTitleId}>
                    <Text style={styles.hostName}>{broadcastHost?.name}</Text>
                    <Text style={styles.hostId}>#{broadcastHost?.uid}</Text>
                  </View>
                </View>
                {/* Broadcaster Info Ends Here */}
                {/* Broadcaster Close Starts Here */}
                <View style={styles.broadcastClose}>
                  <View style={styles.closeButton}>
                    <TouchableOpacity onPress={handleClosePress}>
                      <Image
                        source={require('../../assets/images/close.png')}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                {/* Broadcaster Close Ends Here */}
              </View>

              <View style={styles.commonHeader}>
                <View style={styles.headerRight}>
                  {latestFiveViewers.map(function (item, i) {
                    return (
                      <View key={`vks-${i}`}>
                        <Image
                          style={styles.seeMoreUsers}
                          source={{uri: item.viewerId.profileImage}}
                        />
                      </View>
                    );
                  })}

                  <View style={styles.seeMoreNumberOfPeople}>
                    <Text style={styles.seeMoreNumberOfPeopleText}>
                      {currentViewerCount}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.commonFooter}>
            <View style={styles.alignSpaceBetween2}>
              {renderChats !== 0 ? (
                <ScrollView
                  style={styles.comments}
                  ref={scrollViewRef}
                  onContentSizeChange={() =>
                    scrollViewRef.current.scrollToEnd({animated: true})
                  }>
                  {chats.map(function (item, i) {
                    return (
                      <View style={styles.commentsWrapper} key={`chats-${i}`}>
                        <Text style={styles.commentText}>{item}</Text>
                      </View>
                    );
                  })}
                </ScrollView>
              ) : (
                ''
              )}

              <View style={styles.Footer}>
                <View style={styles.footerLeft}>
                  <View style={styles.footerLeftItems}>
                    <View>
                      <TextInput
                        style={styles.mainComment}
                        placeholderTextColor={'white'}
                        placeholder="Say Hi!"
                        onChangeText={setComment}
                        value={comment}
                      />
                    </View>

                    <TouchableOpacity
                      onPress={handleCommentPress}
                      style={styles.Join}>
                      <Text style={styles.joinText}>Send</Text>
                    </TouchableOpacity>

                    <View style={styles.comment}>
                      <Image
                        source={require('../../assets/images/gift-boxes.png')}
                      />
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
      );
    }
  }

  /* return (

    <>
    {remoteVideoTrack? (

      <View style={{flex: 1}}>
        <VideoStream stream={remoteVideoTrack}/>
      </View>
      
      
    ) : <Text>Nice</Text>}
    </>
  ) */
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  background: {
    flex: 1,
    backgroundColor: 'black',
  },
  overlayContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  boxContainer: {
    justifyContent: 'space-between',
    position: 'absolute',
    left: 20,
    right: 20,
  },
  commonHeader: {
    flex: 1,
    flexDirection: 'row',
    marginTop: 10,
    marginBottom: 10,
  },

  commonFooter: {
    flex: 1,
    position: 'absolute',
    bottom: 20,
  },

  broadcasterInfo: {
    display: 'flex',
    flex: 2,
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#000000',
    opacity: 0.6,
    padding: 5,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  hostImage: {
    height: 40,
    width: 40,
    borderRadius: 8,
  },
  hostName: {
    color: 'white',
    fontWeight: 700,
    fontSize: 14,
    left: 10,
  },
  hostId: {
    color: '#f5f5f5',
    fontSize: 12,
    left: 10,
  },
  broadcastClose: {
    display: 'flex',
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  closeButton: {
    padding: 8,
    borderRadius: 100,
    marginRight: 8,
  },
  headerRight: {
    flex: 1,
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    flexDirection: 'row',
  },

  Room: {
    backgroundColor: 'black',
    flex: 1,
    position: 'relative',
  },
  Container: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  theTopBox: {
    marginLeft: 15,
    marginRight: 15,
  },
  alignSpaceBetween2: {
    paddingTop: 58,
  },
  headerleftUserImage: {
    height: 40,
    width: 40,
    borderRadius: 8,
  },
  header: {
    display: 'flex',
    flex: 1,
    flexDirection: 'row',
    marginBottom: 10,
    paddingRight: 5,
    marginTop: 40,
  },
  headerLeft: {
    display: 'flex',
    flex: 2,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-around',
    backgroundColor: '#a7a49a63',
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    paddingVertical: 3,
    paddingHorizontal: 3,
  },
  roomCreatorName: {
    color: 'white',
    fontWeight: 700,
    fontSize: 12,
  },
  roomCreatorId: {
    color: '#f5f5f5',
    fontSize: 10,
  },

  close: {
    padding: 8,
    borderRadius: 100,
    marginRight: 8,
  },
  SecondHeaderLeft: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    height: 25,
    width: 55,
    backgroundColor: '#a7a49a63',
    borderRadius: 12,
  },
  seeMoreUsers: {
    height: 25,
    width: 25,
    borderRadius: 100,
    marginRight: 8,
  },
  seeMoreNumberOfPeople: {
    height: 25,
    width: 25,
    backgroundColor: '#a7a49a63',
    borderRadius: 100,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  seeMoreNumberOfPeopleText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 500,
  },
  user: {
    height: 45,
    width: 45,
    backgroundColor: '#a7a49a63',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
  },
  userName: {
    color: 'white',
    fontSize: 10,
  },
  Users: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  userWrapper: {
    width: '20%',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  /* hostImage:{
        height:'100%',
        width:'100%',
        display:'flex',
        justifyContent:'flex-end'

    }, */
  host: {
    color: 'pink',
    fontSize: 10,
    textAlign: 'center',
    fontWeight: 700,
  },
  comment: {
    height: 40,
    width: 40,
    backgroundColor: '#a7a49a63',
    borderRadius: 100,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  Join: {
    height: 40,
    width: 60,
    backgroundColor: '#a7a49a63',
    borderRadius: 100,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  joinText: {
    color: 'white',
  },
  mainComment: {
    height: 40,
    width: 240,
    backgroundColor: '#000000',
    opacity: 0.4,
    borderRadius: 10,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: 'white',
    paddingLeft: 10,
    marginRight: 5,
  },
  footerLeftItems: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  Footer: {
    flex: 7,
    flexDirection: 'row',
    marginTop: 10,
    paddingLeft: 5,
    paddingRight: 5,
  },
  footerLeft: {
    flex: 7,
  },
  footerRight: {
    backgroundColor: '#a7a49ab8',
    flex: 2,
    borderRadius: 25,
    marginLeft: 90,
  },
  comments: {
    height: 200,
    width: '75%',
    paddingLeft: 5,
    paddingRight: 5,
  },
  commentsWrapper: {
    backgroundColor: '#000000',
    opacity: 0.7,
    padding: 10,
    borderRadius: 8,
    marginBottom: 4,
  },
  commentText: {
    color: 'white',
  },

  contentWrapper: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100%',
  },
  userWrapper: {
    display: 'flex',
    flex: 1,
    flexDirection: 'row',
    marginVertical: 0,
    height: 255,
  },
  hostBox: {
    flex: 0.8,
    backgroundColor: 'red',
    height: '100%',
  },
  viewerBox: {
    flex: 0.2,
    backgroundColor: 'green',
  },
  innerViewerBox: {
    display: 'flex',
    flex: 4,
    flexDirection: 'column',
  },
  innerBoxItem: {
    flex: 2,
    height: '100%',
    width: '100%',
    borderColor: '#cccccc',
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    backgroundColor: '#4949ff',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIconWrapper: {
    textAlign: 'right',
    paddingRight: 5,
    paddingTop: 5,
  },
});

export default SingleHost;
