import React from 'react';
import {FlatList, Text, View} from 'react-native';
import {RTCView} from 'react-native-webrtc';

import useBroadcast from '../../hooks/useBroadcast';
import useBroadcastChat from '../../hooks/useBroadcastChat';

export default function HostOTMAV({route, navigation}) {
  const {broadcastId} = route.params;
  const {subscriberId, remoteStreams, endBroadcasting, localStream, isCoHost} =
    useBroadcast(broadcastId, 'Host');

  const {ChatUI, chats} = useBroadcastChat(broadcastId, subscriberId, 'HOST');
  if (!remoteStreams.length > 0) {
    <View>
      <Text>Your broadcast isn't pulishing yet</Text>
    </View>;
  }
  return (
    <View style={{position: 'relative', flex: 1}}>
      <FlatList
        data={remoteStreams}
        renderItem={({item}) => {
          return (
            <RTCView
              // mirror={isFrontCam ? true : false}
              mirror
              objectFit={'contain'}
              className="h-[800px] flex-1"
              streamURL={item.stream.toURL()}
            />
          );
        }}
      />
      <View className="absolute bottom-5  w-full">
        {/* Footer overlay */}
        <ChatUI
          localStream={localStream}
          chats={chats}
          mode={'Host'}
          isCoHost={isCoHost}
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
