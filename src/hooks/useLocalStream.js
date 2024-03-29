import {useEffect, useState} from 'react';
import {mediaDevices} from 'react-native-webrtc';
export default function useLocalStream({
  skip = false,
  options = {
    audio: true,
    video: true,
  },
}) {
  const [localStream, setLocalStream] = useState(null);
  const [isLocalWebcamOn, setIsLocalWebcamOn] = useState(
    Boolean(options.video) || false,
  );
  const [isLocalMicOn, setIsLocalMicOn] = useState(
    Boolean(options.audio) || false,
  );
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFrontCam, setIsFrontCam] = useState(true);

  useEffect(() => {
    (async () => {
      if (skip) {
        console.log('SKIPED __');
        return;
      }

      try {
        if (options.video && options.audio) {
          const sourceInfos = await mediaDevices.enumerateDevices();
          let videoSourceId;
          for (let i = 0; i < sourceInfos.length; i++) {
            const sourceInfo = sourceInfos[i];
            if (
              sourceInfo.kind == 'videoinput' &&
              sourceInfo.facing == (isFrontCam ? 'user' : 'environment')
            ) {
              videoSourceId = sourceInfo.deviceId;
            }
          }
          const mediaStream = await mediaDevices.getUserMedia({
            audio: options.audio,
            video:
              typeof options.video === 'object'
                ? options.video
                : {
                    mandatory: {
                      minWidth: 500, // Provide your own width, height and frame rate here
                      minHeight: 300,
                      minFrameRate: 30,
                    },
                    facingMode: isFrontCam ? 'user' : 'environment',
                    optional: videoSourceId ? [{sourceId: videoSourceId}] : [],
                  },
          });

          setLocalStream(mediaStream); //   console.log('ended', mediaStream);
        } else if (options.audio && !options.video) {
          const mediaStream = await mediaDevices.getUserMedia({
            audio: options.audio,
            video: options.video,
          });
          setLocalStream(mediaStream);
        }

        setIsLoaded(true);
      } catch (err) {
        setIsLoaded(false);
        console.log(err);
      } finally {
        setIsLoading(false);
      }

      // end of async fn
    })();
  }, [skip]);

  function toggleCamera() {
    localStream.value.getVideoTracks().forEach(track => {
      setIsLocalWebcamOn(!track.enabled);
      track.enabled = !track.enabled;
    });
  }

  // Switch Camera
  function switchCamera() {
    localStream.value.getVideoTracks().forEach(track => {
      track._switchCamera();
      setIsFrontCam(prv => !prv);
    });
  }

  // Enable/Disable Mic
  function toggleMic() {
    localStream.value.getAudioTracks().forEach(track => {
      setIsLocalMicOn(!track.enabled);
      track.enabled = !track.enabled;
    });
  }

  return {
    toggleCamera: toggleCamera,
    switchCamera: switchCamera,
    toggleMic: toggleMic,
    localStream: localStream,
    isLoaded: isLoaded,
    isLoading: isLoading,
    isFrontCam: isFrontCam,
    isLocalMicOn: isLocalMicOn,
    isLocalWebcamOn: isLocalWebcamOn,
  };
}
