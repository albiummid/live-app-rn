import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useState} from 'react';
import {FlatList, Image, Text, TouchableOpacity, View} from 'react-native';
import {bsOngoingBroadcastList} from '../services/live/AppServerService';
export default function HomeScreen({navigation}) {
  const [broadcasts, setBroadcasts] = useState([]);

  const fetchData = () =>
    bsOngoingBroadcastList().then(({ongoingBroadcasts}) => {
      setBroadcasts(ongoingBroadcasts);
    });
  useFocusEffect(
    useCallback(() => {
      bsOngoingBroadcastList().then(({ongoingBroadcasts}) => {
        console.log(ongoingBroadcasts, 'ON');
        setBroadcasts(ongoingBroadcasts);
      });
      return () => {};
    }, []),
  );

  return (
    <View style={{flex: 1}}>
      {broadcasts.length > 0 ? (
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
      ) : (
        <View className="flex-1 justify-center items-center">
          <Text className=" text-base">
            Currently no broadcast is running !
          </Text>
        </View>
      )}
    </View>
  );
}
