import {View, Text, FlatList, Image} from 'react-native';
import React, {useEffect, useState} from 'react';
import {bsOngoingBroadcastList} from '../../services/live/AppServerService';
import SubscriberView from '../GoBroadcast/SubscriberView';
// import SubscriberView from './GoBroadcast/SubscriberView';
// import {appServerWS} from '../services/ws';
// import {bsOngoingBroadcastList} from '../services/live/AppServerService';

export default function Reels({route}) {
  const [broadcasts, setBroadcasts] = useState([]);

  useEffect(() => {
    bsOngoingBroadcastList().then(({ongoingBroadcasts}) => {
      setBroadcasts(ongoingBroadcasts);
    });
  }, []);

  console.log(JSON.stringify(broadcasts, null, 2));

  return (
    <View style={{flex: 1}}>
      {/* <FlatList
        data={broadcasts}
        renderItem={({item}) => {
          return (
            <View>
              <Image
                style={{objectFit: 'contain', width: '40'}}
                source={{uri: item.host.photo}}
              />
              <Text>{item.host.name}</Text>
            </View>
          );
        }}
      /> */}
      <SubscriberView broadcastId={route.params.broadcastId} />
    </View>
  );
}
