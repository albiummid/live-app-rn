import {mediaDevices} from 'react-native-webrtc';

export default {
  getUserMedia: async ({
    audio,
    video,
    options = {
      isFrontCam: true,
    },
  }) => {
    const getVideoConfig = async video => {
      if (!video) {
        return false;
      }

      if (typeof video === 'object') {
        return video;
      } else {
        const sourceInfos = await mediaDevices.enumerateDevices();
        let videoSourceId;
        for (let i = 0; i < sourceInfos.length; i++) {
          const sourceInfo = sourceInfos[i];
          if (
            sourceInfo.kind == 'videoinput' &&
            sourceInfo.facing == (options.isFrontCam ? 'user' : 'environment')
          ) {
            videoSourceId = sourceInfo.deviceId;
          }
        }
        return {
          mandatory: {
            minWidth: 500, // Provide your own width, height and frame rate here
            minHeight: 300,
            minFrameRate: 30,
          },
          facingMode: options.isFrontCam ? 'user' : 'environment',
          optional: videoSourceId ? [{sourceId: videoSourceId}] : [],
        };
      }
    };
    const audioConfig = audio;
    const videoConfig = await getVideoConfig(video);
    return await mediaDevices.getUserMedia({
      audio: audioConfig,
      video: videoConfig,
    });
  },
  switchCamera: stream => {
    stream.getVideoTracks().forEach(track => {
      track._switchCamera();
    });
    return true;
  },
  toggleCamera: stream => {
    let isEnabled;
    stream.getVideoTracks().forEach(track => {
      track.enabled = !track.enabled;
      isEnabled = !track.enabled;
    });

    return {
      isEnabled,
    };
  },
  toggleMic: stream => {
    let isEnabled;
    stream.getAudioTracks().forEach(track => {
      isEnabled = !track.enabled;
      track.enabled = !track.enabled;
    });

    return {
      isEnabled,
    };
  },
};
