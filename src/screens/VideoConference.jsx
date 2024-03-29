import React, {useEffect, useState} from 'react';
import {TouchableOpacity, View} from 'react-native';
import {mediaDevices, RTCView} from 'react-native-webrtc';
import VectorIcon, {Icons} from '../components/VectorIcon';

export default function VideoConference() {
  const [isFront, setIsFront] = useState(true);
  const [localStream, setLocalStream] = useState(null);
  // Handling Mic status
  const [localMicOn, setlocalMicOn] = useState(true);

  // Handling Camera status
  const [localWebcamOn, setlocalWebcamOn] = useState(true);

  // Switch Camera
  function switchCamera() {
    localStream.getVideoTracks().forEach(track => {
      track._switchCamera();
      setIsFront(prv => !prv);
    });
  }

  // Enable/Disable Camera
  function toggleCamera() {
    localStream.getVideoTracks().forEach(track => {
      setlocalWebcamOn(!track.enabled);
      track.enabled = !track.enabled;
    });
  }

  function stopCamera() {
    localStream.getVideoTracks().forEach(track => {
      track.enabled = false;
    });
  }
  function stopMic() {
    localStream.getAudioTracks().forEach(track => {
      track.enabled = false;
    });
  }

  // Enable/Disable Mic
  function toggleMic() {
    localStream.getAudioTracks().forEach(track => {
      setlocalMicOn(!track.enabled);
      track.enabled = !track.enabled;
    });
  }
  useEffect(() => {
    const loadMediaStream = () => {
      mediaDevices.enumerateDevices().then(sourceInfos => {
        let videoSourceId;
        for (let i = 0; i < sourceInfos.length; i++) {
          const sourceInfo = sourceInfos[i];
          if (
            sourceInfo.kind == 'videoinput' &&
            sourceInfo.facing == (isFront ? 'user' : 'environment')
          ) {
            videoSourceId = sourceInfo.deviceId;
          }
        }

        /*The MediaDevices interface allows you
        to access connected media inputs such as
        cameras and microphones. We ask the user
        for permission to access those media inputs
        by invoking the mediaDevices.getUserMedia()
            method. */
        mediaDevices
          .getUserMedia({
            audio: true,
            video: {
              mandatory: {
                minWidth: 500, // Provide your own width, height and frame rate here
                minHeight: 300,
                minFrameRate: 30,
              },
              facingMode: isFront ? 'user' : 'environment',
              optional: videoSourceId ? [{sourceId: videoSourceId}] : [],
            },
          })
          .then(stream => {
            // Get local stream!
            setLocalStream(stream);
          })
          .catch(error => {
            // Log error
          });
      });
    };

    if (!localStream) {
      loadMediaStream();
    }

    return () => {};
  }, []);

  return (
    <View style={{flex: 1}}>
      {localStream ? (
        <RTCView
          objectFit={'cover'}
          style={{flex: 1, backgroundColor: '#FF4'}}
          streamURL={localStream?.toURL()}
        />
      ) : null}

      <View className=" absolute bottom-5 space-x-5 py-2 w-full flex-row  items-center justify-center bg-transparent ">
        <TouchableOpacity activeOpacity={0.5} onPress={switchCamera}>
          <VectorIcon
            type={Icons.MaterialIcons}
            name={'cameraswitch'}
            size={30}
            className="bg-red-400 bg p-2 rounded-full"
          />
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.5} onPress={toggleCamera}>
          <VectorIcon
            type={Icons.MaterialCommunityIcons}
            name={!localWebcamOn ? 'camera-off-outline' : 'camera-outline'}
            size={30}
            className={`${
              !localWebcamOn ? 'bg-red-400' : 'bg-green-400'
            } p-2 rounded-full`}
          />
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.5} onPress={toggleMic}>
          <VectorIcon
            type={Icons.MaterialCommunityIcons}
            name={!localMicOn ? 'microphone-off' : 'microphone'}
            size={30}
            className={`${
              !localMicOn ? 'bg-red-400' : 'bg-green-400'
            } p-2 rounded-full`}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}
