import React, {useCallback, useEffect, useState} from 'react';
import {
  FlatList,
  Image,
  Keyboard,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {stickers} from '../assets';
import VectorIcon, {Icons} from '../components/VectorIcon';
import {getUser} from '../constants/values';
import localAV from '../libs/localAV';
import {bsSendComment} from '../services/live/AppServerService';
import {appServerWS} from '../services/ws';

export default function useBroadcastChat(broadcastId, subscriberId) {
  const user = getUser();
  const [chats, setChats] = useState([]);
  const [renderChats, setRenderChats] = useState(0);

  useEffect(() => {
    appServerWS
      .off(`core::new-viewer-joined-${broadcastId}`)
      .on(`core::new-viewer-joined-${broadcastId}`, async payload => {
        setChats(prv => [
          {
            kind: 'text',
            content: payload.data.chatText,
            chatText: payload.data.chatText,
          },
          ...prv,
        ]);
        setRenderChats(renderChats + 1);
      });

    // Notifier Listener : new comment in this broadcast
    appServerWS
      .off(`core::new-comment-${broadcastId}`)
      .on(`core::new-comment-${broadcastId}`, async payload => {
        setChats(prv => [
          {
            name: payload.data.name,
            chatText: payload.data.chatText,
            content: payload.data.comment,
            kind: payload.data.kind,
          },
          ...prv,
        ]);
      });
  }, []);

  const ChatUI = useCallback(
    ({onPressEnd, chats, localStream, isCoHost, mode}) => {
      const [showStickerPicker, setShowStickerPicker] = useState(false);
      const [comment, setComment] = useState('');
      const [isLocalMicOn, setIsLocalMicOn] = useState(true);

      const handleCommentPress = useCallback(async () => {
        if (comment != '') {
          await bsSendComment({
            broadcastId,
            userId: user._id,
            subscriberId,
            comment,
            chatText: `${user.name}: ${comment}`,
            name: user.name,
            kind: 'text' || 'sticker',
          });
          setComment('');
        }
      }, [subscriberId, broadcastId, comment]);

      const handleStickerPress = useCallback(
        async stickerName => {
          await bsSendComment({
            broadcastId,
            userId: user._id,
            subscriberId,
            comment: stickerName,
            chatText: `${user.name}:\n\n ${stickerName}`,
            name: user.name,
            kind: 'sticker',
          });
        },
        [broadcastId, subscriberId],
      );

      const switchCamera = async () => {
        localAV.switchCamera(localStream);
      };

      const toggleMic = async () => {
        const {isEnabled} = localAV.toggleMic(localStream);
        setIsLocalMicOn(isEnabled);
      };

      return (
        <View>
          <View className=" w-full ">
            <FlatList
              className="h-96 w-full mx-3 "
              data={chats}
              inverted
              renderItem={({item}) => {
                if (item.kind === 'text') {
                  return (
                    <Text className="bg-black/40 text-white px-4 py-2 rounded-xl  mr-auto my-2  ">
                      {item.chatText}
                    </Text>
                  );
                } else if (item.kind === 'sticker') {
                  return (
                    <View className="bg-black/40 text-white my-2 mr-auto  px-4 py-2 rounded-xl ">
                      <Text className="text-white">{item.name}:</Text>
                      <Image
                        className=" object-cover w-20 h-20"
                        source={stickers[item.content]}
                      />
                    </View>
                  );
                }
              }}
            />
            <View className="flex-row space-x-2 mx-3 items-center">
              <TextInput
                className=" bg-black/30 rounded-xl flex-1 px-3 py-2"
                placeholderTextColor={'white'}
                placeholder="Say Hi!"
                onChangeText={setComment}
                value={comment}
              />
              <TouchableOpacity
                className="bg-black/30 px-4 py-3 rounded-xl"
                onPress={handleCommentPress}>
                <Text className="text-white">Send</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={async () => {
                  Keyboard.dismiss();
                  setShowStickerPicker(prv => !prv);
                }}>
                <Image
                  className="w-10 h-10 rounded-full"
                  source={require('../assets/images/gift-boxes.png')}
                />
              </TouchableOpacity>
            </View>

            {showStickerPicker && (
              <FlatList
                className=" my-2"
                numColumns={4}
                data={Object.entries(stickers).map(([sName, sURI]) => ({
                  sName,
                  sURI,
                }))}
                contentContainerStyle={{
                  alignItems: 'center',
                }}
                renderItem={({item}) => {
                  return (
                    <TouchableOpacity
                      onPress={() => {
                        handleStickerPress(item.sName);
                      }}>
                      <Image
                        style={{objectFit: 'contain'}}
                        source={item.sURI}
                        className=" object w-16 h-16 mx-2"
                      />
                    </TouchableOpacity>
                  );
                }}
              />
            )}
          </View>

          {(mode === 'Host' || isCoHost == true) && (
            <View className="  space-x-5 py-2  flex-row  items-center justify-center bg-transparent ">
              <TouchableOpacity activeOpacity={0.5} onPress={switchCamera}>
                <VectorIcon
                  type={Icons.MaterialIcons}
                  name={'cameraswitch'}
                  size={30}
                  className="bg-cyan-400 bg p-2 rounded-full"
                />
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={0.5} onPress={toggleMic}>
                <VectorIcon
                  type={Icons.MaterialCommunityIcons}
                  name={!isLocalMicOn ? 'microphone-off' : 'microphone'}
                  size={30}
                  className={`${
                    !isLocalMicOn ? 'bg-red-400' : 'bg-green-400'
                  } p-2 rounded-full`}
                />
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={0.5} onPress={onPressEnd}>
                <VectorIcon
                  type={Icons.MaterialCommunityIcons}
                  name={'phone'}
                  size={30}
                  className={`bg-red-400 p-2 rounded-full`}
                />
              </TouchableOpacity>
            </View>
          )}
        </View>
      );
    },
    [],
  );

  return {
    chats,
    renderChats,
    ChatUI,
  };
}

export {};
