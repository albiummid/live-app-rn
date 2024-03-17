import React, {useState, useEffect, useRef} from 'react'
import { RTCView } from 'react-native-webrtc';
const SingleHostRemoteStream = ({ stream }) => {
  const rtcViewRef = useRef(null);

  const handleStreamError = (event) => {
    console.error('Stream error:', event.nativeEvent);
  };

  useEffect(() => {
    console.log('Stream');
    console.log(rtcViewRef);
    console.log(stream);
    if (rtcViewRef && stream) {
      console.log('Got Stream inside If');
      rtcViewRef.current.srcObject = stream;
    }
    else{
      console.log("Eikhanei Problem");
    }
  }, [stream]);

  return (
      <RTCView
        streamURL={stream ? stream.toURL() : ''}
        style={{ 
          flex: 1,
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
        }}
        onError={handleStreamError}
        ref={rtcViewRef}
        objectFit='cover'
        mirror
      />
  );
};

export default SingleHostRemoteStream;