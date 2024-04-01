import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useState} from 'react';
import {FlatList, Image, Text, TouchableOpacity, View} from 'react-native';
import {getUsersConvesationList} from '../../api/conversation.api';
import {getUserId} from '../../constants/values';
export default function ConversationScreen({navigation}) {
  const [list, setList] = useState([]);
  const [meta, setMeta] = useState(null);
  const userId = getUserId();

  useFocusEffect(
    useCallback(() => {
      getUsersConvesationList(userId).then(d => {
        setList(d.list);
      });
    }, []),
  );

  return (
    <View>
      <TouchableOpacity
        onPress={() => {
          navigation.navigate('ConversationSearch');
        }}>
        <Text className="border border-gray-400 p-5 m-2 rounded-md">
          Search
        </Text>
      </TouchableOpacity>
      <FlatList
        data={list}
        renderItem={({item}) => {
          const otherUser = item.uid_pair.filter(x => x._id !== userId)[0];
          return (
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('Chat', {
                  conversation: item,
                });
              }}>
              <View className="flex-row items-center space-x-3 px-4 py-2 bg-zinc-50 ">
                <Image
                  height={40}
                  width={40}
                  className="rounded-full"
                  source={{
                    uri:
                      otherUser?.photo ??
                      'https://media.gettyimages.com/id/1300845620/vector/user-icon-flat-isolated-on-white-background-user-symbol-vector-illustration.jpg?s=612x612&w=0&k=20&c=yBeyba0hUkh14_jgv1OKqIH0CCSWU_4ckRkAoy2p73o=',
                  }}
                />
                <Text>{otherUser.name}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}
