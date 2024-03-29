import {View, Text, FlatList, Image, TouchableOpacity} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import SubscriberView from './GoBroadcast/SubscriberView';
import {appServerWS} from '../services/ws';
import {bsOngoingBroadcastList} from '../services/live/AppServerService';
import {useFocusEffect} from '@react-navigation/native';
export default function HomeScreen({navigation}) {
  const [broadcasts, setBroadcasts] = useState([]);

  useFocusEffect(
    useCallback(() => {
      bsOngoingBroadcastList().then(({ongoingBroadcasts}) => {
        setBroadcasts(ongoingBroadcasts);
      });

      return () => {};
    }, []),
  );

  console.log(JSON.stringify(broadcasts, null, 2));

  return (
    <View style={{flex: 1}}>
      <FlatList
        numColumns={2}
        data={broadcasts}
        renderItem={({item}) => {
          return (
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('Reels', {broadcastId: item.uuid});
              }}
              className="flex-1 w-1/2 ">
              <View className=" flex-1 bg-red-400 m-2 p-2 rounded-md justify-center items-center  space-y-2">
                <Image
                  style={{
                    objectFit: 'contain',
                    width: 100,
                    height: 100,
                  }}
                  source={{uri: item.host.photo}}
                />
                <Text>{item.host.name}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}
