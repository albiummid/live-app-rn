import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {FlatList, Text, View} from 'react-native';
import {RTCView} from 'react-native-webrtc';
import useBroadcast from '../../hooks/useBroadcast';
import useBroadcastChat from '../../hooks/useBroadcastChat';

export default function SubscriberView({broadcastId}) {
  const navigation = useNavigation();
  const {subscriberId, remoteStreams, endBroadcasting, localStream, isCoHost} =
    useBroadcast(broadcastId, 'Audience');

  const {ChatUI, chats} = useBroadcastChat(broadcastId, subscriberId);

  if (!remoteStreams.length > 0) {
    <View>
      <Text className="text-red-400">Your broadcast isn't pulishing yet</Text>
    </View>;
  }

  console.log(remoteStreams.length);

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
                style={{height: 150, backgroundColor: 'red'}}
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
