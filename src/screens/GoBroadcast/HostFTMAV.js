import React from 'react';
import {FlatList, Text, View} from 'react-native';
import {RTCView} from 'react-native-webrtc';
import useBroadcast from '../../hooks/useBroadcast';
import useBroadcastChat from '../../hooks/useBroadcastChat';

export default function HostFTMAV({route, navigation}) {
  const {broadcastId} = route.params;
  const {subscriberId, remoteStreams, endBroadcasting, localStream} =
    useBroadcast(broadcastId, 'Host');
  const {ChatUI} = useBroadcastChat(broadcastId, subscriberId);

  if (!remoteStreams.length > 0) {
    <View>
      <Text>Your broadcast isn't pulishing yet</Text>
    </View>;
  }

  console.log(remoteStreams[0]?.stream);

  return (
    <View style={{flex: 1, position: 'relative'}}>
      <FlatList
        data={remoteStreams}
        renderItem={({item}) => {
          return (
            <View>
              <RTCView
                objectFit={'cover'}
                style={{height: 400, backgroundColor: 'red'}}
                streamURL={item.stream?.toURL()}
              />
              <Text className="text-red-500">{item.user.name}</Text>
            </View>
          );
        }}
      />
      <View className=" absolute bottom-5 w-full ">
        <ChatUI
          localStream={localStream}
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
