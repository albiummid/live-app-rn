import React, { useEffect, useState, useRef } from 'react'
import { View, Text, TouchableOpacity, Image, Dimensions, StyleSheet, Platform } from 'react-native'
import { RTCPeerConnection, RTCView, mediaDevices } from 'react-native-webrtc';
import { useNavigation } from '@react-navigation/native';
import { Device } from 'mediasoup-client';
import axios from 'axios';
// Call registerGlobals() to register WebRTC classes in the global scope
import { registerGlobals } from 'react-native-webrtc';
import { getUserById } from '../../api/user.api';
import { getUserId } from '../../constants/values';
import { streamingServerWS } from '../../services/ws';
registerGlobals();

const device = new Device();


function BroadcastRoom() {
  const navigation = useNavigation();
  const [thisUser, setThisUser] = useState({});

  const [thisBroadcast, setThisBroadcast] = useState({});

  const [broadcastStatus, setBroadcastStatus] = useState('idle'); // idle, starting, started, stopping, stopped
  const [streamKind, setStreamKind] = useState('OTMAV'); // video, audio, both
  const [seats, setSeats] = useState(1);
  const [readyToBroadcast, setReadyToBroadcast] = useState(false);

  const [stream, setStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const peerConnectionRef = useRef(null);
  
  

  useEffect(() => {
    const initialize = async () => {
      const user = await getUserById(getUserId());
      setThisUser(user);
      const localStream = await mediaDevices.getUserMedia({ audio: true, video: true });
      setStream(localStream);
    };

    initialize();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => {
          track.stop();
        });
      }
      if (remoteStream) {
        remoteStream.getTracks().forEach((track) => {
          track.stop();
        });
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
  }, []);


  async function initBroadcast(){

    /* streamingServerWS.emit('broadcast-initiate', { 
      originId: thisUser._id
    }, (data) => {
      console.log('broadcast-initiate-callback', data.data.broadcast)
      setThisBroadcast(data.data.broadcast);
      ENGINE_SOCKET.emit('core::broadcast-initiate', {
        userId: thisUser._id,
        hostId: thisUser._id,
        broadcastId: data.data.broadcast.uuid,
        streamKind: streamKind,
        seats: seats,
        initiatedAt: data.data.broadcast.timeBook.startedAt
      }, async (data) => {
        console.log('core::broadcast-initiate-callback', data)
        setReadyToBroadcast(true);
        await publish(data.data.broadcast.uuid);
      });
    }); */
    

    

  }


  async function publish(broadcastId){
    try {
      console.log('publishing');
      streamingServerWS.emit('broadcast-publish', { 
        originId: thisUser._id,
        broadcastId: broadcastId
      }, async (data) => {
        console.log('broadcast-publish-callback', data)
        console.log('trid1', data.data.transportOptions.id);

        const crtlr = await controller();
        console.log('controller', crtlr);
        const RtpCaps = crtlr.rtpCapabilities;
        console.log('RtpCaps', RtpCaps);
        await device.load({ routerRtpCapabilities: RtpCaps });
        const transport = device.createSendTransport(data.data.transportOptions);
        const stream = await mediaDevices.getUserMedia({ audio: true, video: true });
        console.log('stream', stream);
        console.log('trid2', transport.id);
        
        


        transport.on('connect', async({ dtlsParameters }, callback, errback) => {
          streamingServerWS.emit('transport-connect', {
            originId: thisUser._id,
            broadcastId: broadcastId,
            transportId: transport.id,
            dtlsParameters: dtlsParameters
          }, async (data) => {
            console.log('transport-connect-callback', data);
            callback(data);
          });
        });
        
        transport.on('produce', async ({ kind, rtpParameters, appData }, callback, errback) => {
          try {
            console.log('transport-produce', kind, rtpParameters, appData);
            streamingServerWS.emit('transport-produce', {
              kind: kind,
              broadcastId: broadcastId,
              transportId: transport.id,
              rtpParameters: rtpParameters
            }, async (data) => {
              console.log('transport-produce-callback', data);
              
              // data object.
              const { id } = data.data;
              // Tell the transport that parameters were transmitted and provide it with the
              // server side producer's id.
              //await subscribe(broadcastId)
              callback({ id });
              // Wait for the server to emit a 'producer-added' event, letting us know that
              // the server-side producer has been created and can begin to accept data.
            });
          } catch (err) {
            errback(err);
          }
        });

        transport.on('connectionstatechange', (state) => {
          switch (state) {
            case 'connecting':
              console.log("Transport CSC Connecting to publish")
            break; 
      
      
            case 'connected':
              console.log("Transport CSC  Connected")
            break;
      
            case 'failed':
              transport.close();
              console.log("Transport CSC Failed connection")
            break;
      
            default: break;
          }
        });

        

        // Choose video and audio tracks based on streamKind
        const videoTrack = stream.getVideoTracks()[0];
        const audioTrack = stream.getAudioTracks()[0];

        const videoProducer = await transport.produce({ track: videoTrack });
        const audioProducer = await transport.produce({ track: audioTrack });

      });


    } catch (error) {
      console.log('Publish Caught Error');
      console.log(error);
    }

    
  }

  async function subscribe(broadcastId){
    
    try {
  
      const deviceRtpCaps =  device.rtpCapabilities;





      streamingServerWS.emit('broadcast-subscribe', {
        originId: thisUser._id,
        broadcastId: broadcastId,
        rtpCapabilities: deviceRtpCaps
      }, async (data) => {
        console.log('broadcast-subscribe-callback', data);
        if(data.kind === 'success'){
          console.log('subscribing success');
          console.log(data);
          /* console.log('total consumers', data.data.consumers.length);
          for(let i = 0; i < data.data.consumers.length; i++){
            console.log('subscribing to consumer', data.data.consumers[i].consumerOptions);
          } */
        }
        
      });


    } catch (error) {
      console.log('Subscribe Caught Error');
      console.log(error);
    }

  }





  async function controller() {
    try {
      console.log('controller');
      const response = await axios.get(`${LIVE_STREAMING_SERVER_API_URL}/controller`);
      console.log('controller body', response.data);
      return response.data.router;
    } catch (error) {
      console.log('RtpCaps error', error);
    }
  }

  return (
    <View style={{ flex: 1, height: '100%' }}>
      {stream && <RTCView streamURL={stream.toURL()} style={{ flex: 1, height: '100%' }} />}
      {remoteStream && <RTCView streamURL={remoteStream.toURL()} style={{ flex: 1, height: '100%' }} />}
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 100, backgroundColor: 'black', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => initBroadcast()} style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: 'red', justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: 'black' }}>Initiate</Text>
        </TouchableOpacity>
        
      </View>
    </View>
  )
}

export default BroadcastRoom