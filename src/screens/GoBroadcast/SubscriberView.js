import {useNavigation} from '@react-navigation/native';
import React, {useEffect} from 'react';
import {FlatList, Text, View} from 'react-native';
import {RTCView} from 'react-native-webrtc';
import useBroadcast from '../../hooks/useBroadcast';
import useBroadcastChat from '../../hooks/useBroadcastChat';

export default function SubscriberView({broadcastId}) {
  const navigation = useNavigation();
  const {
    subscriberId,
    remoteStreams,
    endBroadcasting,
    localStream,
    isCoHost,
    isBroadcastEnded,
  } = useBroadcast(broadcastId, 'Audience');

  const {ChatUI, chats} = useBroadcastChat(broadcastId, subscriberId);

  useEffect(() => {
    let timer;
    if (isBroadcastEnded) {
      timer = setTimeout(() => {
        clearImmediate(timer);
        navigation.goBack();
      }, 3000);
    }
  }, [isBroadcastEnded]);

  if (isBroadcastEnded) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Broadcast Ended...</Text>
      </View>
    );
  }

  if (!remoteStreams.length > 0) {
    <View>
      <Text className="text-red-400">Your broadcast isn't pulishing yet</Text>
    </View>;
  }

  console.log(isBroadcastEnded, 'BEND');

  return (
    <View style={{flex: 1, position: 'relative'}}>
      <FlatList
        data={remoteStreams}
        numColumns={2}
        renderItem={({item}) => {
          return (
            <View className="m-2 flex-1 bg-green-400 p-3 rounded-md">
              <RTCView
                objectFit={'cover'}
                style={{height: 600, backgroundColor: 'red'}}
                streamURL={item.stream.toURL()}
              />
              <Text className="text-black text-center my-2">
                {item.user.name}
              </Text>
            </View>
          );
        }}
      />
      <View className="absolute bottom-5  w-full">
        {/* Footer overlay */}
        <ChatUI
          localStream={localStream}
          chats={chats}
          onPressEnd={() => {
            endBroadcasting().finally(() => {
              navigation.goBack();
            });
          }}
        />
      </View>
    </View>
  );
}
