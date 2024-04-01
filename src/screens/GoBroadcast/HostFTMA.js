import React from 'react';
import {FlatList, Image, Pressable, Text, View} from 'react-native';
import {RTCView} from 'react-native-webrtc';
import {getUser} from '../../constants/values';
import useBroadcast from '../../hooks/useBroadcast';
import useBroadcastChat from '../../hooks/useBroadcastChat';
import {appServerWS} from '../../services/ws';

export default function HostOTMAV({route, navigation}) {
  const user = getUser();
  const {broadcastId} = route.params;

  const {
    subscriberId,
    remoteStreams,
    endBroadcasting,
    currentViewerCount,
    latestFiveViewers,
    localStream,
    hostList,
    isCoHost,
  } = useBroadcast(broadcastId, 'Host');

  const {ChatUI, chats} = useBroadcastChat(broadcastId, subscriberId);
  const hostIds = hostList.map(x => x._id);

  if (!remoteStreams.length) {
    <View>
      <Text>Your broadcast isn't pulishing yet</Text>
    </View>;
  }

  return (
    <View style={{flex: 1, position: 'relative'}}>
      <View style={{flex: 1}}>
        {latestFiveViewers?.length > 0 && (
          <View className=" p-10 space-y-5">
            <Text>Ask one viewer for join as co-host</Text>
            <View className="flex-row flex-wrap ">
              {latestFiveViewers.map((x, i) => {
                const xUser = x.viewerId;
                if (xUser._id === user._id || hostIds.includes(xUser)) {
                  return null;
                }

                return (
                  <Pressable
                    key={i}
                    onPress={async () => {
                      appServerWS.emit(
                        'req::join-in-seat',
                        {
                          broadcastId,
                          originId: user._id,
                          destinationId: xUser._id,
                        },
                        res => {
                          // appServerWS
                          //   .off(`res::join-in-seat-to-${user._id}`)
                          //   .on(`res::join-in-seat-to-${user._id}`, res => {
                          //     console.log('GOT_RESPONSE_FROM_DESTINATION');
                          //   });
                        },
                      );
                    }}
                    className="border border-red-200 p-2  mr-auto rounded-md  ">
                    <>
                      <Image
                        source={{uri: xUser.photo}}
                        className="rounded-full object-contain h-20 w-20"
                      />
                      <Text>{xUser.name}</Text>
                    </>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}
      </View>
      <FlatList
        className="p-5"
        data={remoteStreams}
        renderItem={({item}) => {
          return (
            <View className="m-2 p-2 bg-green-500 mr-auto">
              <RTCView
                objectFit={'cover'}
                style={{height: 100, width: 100, backgroundColor: 'red'}}
                streamURL={item.stream?.toURL()}
              />
              <Text className="text-red-500">{item.user.name}</Text>
            </View>
          );
        }}
      />

      <View className="absolute bottom-5  w-full">
        {/* Footer overlay */}
        <ChatUI
          localStream={localStream}
          chats={chats}
          isCoHost={isCoHost}
          mode={'Host'}
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
