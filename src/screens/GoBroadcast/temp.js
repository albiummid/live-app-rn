import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  Alert,
  FlatList,
  Image,
  Keyboard,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import useLocalStream from '../../hooks/useLocalStream';
import useBroadcastChat from '../../hooks/useBroadcastChat';
import useBroadcast from '../../hooks/useBroadcast';

export default function HostOTMAV({route, navigation}) {
  const {broadcastId, mode, broadcastDetails} = route.params;
  const {localStream, isLocalMicOn, switchCamera, toggleMic, isFrontCam} =
    useLocalStream({
      options: {
        audio: true,
        video: false,
      },
    });
  const {
    subscriberId,
    remoteStreams,
    endBroadcasting,
    currentViewerCount,
    latestFiveViewers,
  } = useBroadcast(broadcastId, 'Host', localStream);

  const {ChatUI, chats} = useBroadcastChat(broadcastId, subscriberId);

  if (!remoteStreams.length) {
    <View>
      <Text>Your broadcast isn't pulishing yet</Text>
    </View>;
  }

  return (
    <View style={{flex: 1, position: 'relative'}}>
      <Text>Viewers: {currentViewerCount}</Text>
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
      {latestFiveViewers?.length > 0 && (
        <View className=" p-10 space-y-5">
          <Text>Ask one viewer for join as co-host</Text>
          <View className="flex-row flex-wrap ">
            {latestFiveViewers.map((x, i) => {
              const xUser = x.viewerId;
              return (
                <Pressable
                  key={i}
                  onPress={() => {
                    console.log('ALBI');
                    appServerWS.emit(
                      'req::join-in-seat',
                      {
                        broadcastId,
                        originId: user._id,
                        destinationId: xUser._id,
                      },
                      res => {
                        appServerWS
                          .off(`res::join-in-seat-to-${user._id}`)
                          .on(`res::join-in-seat-to-${user._id}`, res => {
                            console.log('GOT_RESPONSE_FROM_DESTINATION');
                          });
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
      <View className="absolute bottom-5  w-full">
        {/* Footer overlay */}
        <ChatUI
          isLocalMicOn={isLocalMicOn}
          toggleMic={toggleMic}
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
