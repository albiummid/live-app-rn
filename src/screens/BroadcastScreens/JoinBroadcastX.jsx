import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  StyleSheet,
  Platform,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import {ldbGetJSON} from '../../utils/LocalDB';
import {streamingServerWS} from '../../services/ws';

function JoinBroadcast({route}) {
  const navigation = useNavigation();
  const [broadcastId, setBroadcastId] = useEffect(
    route.params?.broadcastId ? route.params.broadcastId : null,
  );
  const [broadcastInfo, setBroadcastInfo] = useEffect({
    kind: '',
    seats: 0,
  });

  useEffect(() => {
    if (!broadcastId) {
      // navigate to initiate broadcast
      console.log('Broadcast is null');
    }

    console.log('Broadcast ID ');
    console.log(broadcastId);

    streamingServerWS.emit(
      'core::broadcast-room-join',
      {
        broadcastId,
      },
      data => {
        console.log('Current Broadcast');
        console.log(data);
      },
    );
  }, []);

  return <div>JoinBroadcast</div>;
}

export default JoinBroadcast;
