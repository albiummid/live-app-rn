import {View, Text, TextInput, FlatList, TouchableOpacity} from 'react-native';
import React, {useEffect, useState} from 'react';
import {getFriendList} from '../../api/friend.api';
import useAuth from '../../hooks/useAuth';
import {Avatar, TouchableRipple} from 'react-native-paper';
import {getUserList} from '../../api/user.api';
import {debounce} from '../../utils/helper';
import {
  createConversation,
  getConvesationByUIDs,
} from '../../api/conversation.api';

export default function ConversationSearchScreen({navigation}) {
  const {userId} = useAuth();
  const [friendList, setFriendList] = useState([]);
  const [searchList, setSearchList] = useState([]);
  const [loadingState, setLoadingState] = useState({
    page: false,
    search: false,
  });

  const handleNavigateToChat = async (uid1, uid2) => {
    let conversation = await getConvesationByUIDs(uid1, uid2);
    if (conversation == null) {
      await createConversation(uid1, uid2);
      conversation = await getConvesationByUIDs(uid1, uid2);
    }
    console.log(conversation);
    navigation.navigate('Chat', {conversation});
  };

  const searchUser = async t => {
    const data = await getUserList(`_page=1&_limit=20&name_like=${t}`);
    setSearchList(data.list);
  };

  useEffect(() => {
    getFriendList(userId).then(d => setFriendList(d.list));
  }, []);
  return (
    <View>
      <TextInput
        onChangeText={t => {
          const fetch = debounce(searchUser, 1500);
          fetch(t);
        }}
        className="border border-gray-400 p-2 m-2 rounded-md active:border-red-400"
      />
      <FlatList
        horizontal
        data={friendList}
        renderItem={({item}) => {
          const friend = item.uid_pair.find(x => x._id !== userId);
          return (
            <TouchableOpacity
              className="p-5"
              activeOpacity={0.5}
              onPress={() => {
                handleNavigateToChat(friend._id, userId);
              }}>
              <Avatar.Image
                className="mx-auto"
                source={{uri: friend.photo}}
                size={50}
              />
              <Text>{friend.name}</Text>
            </TouchableOpacity>
          );
        }}
      />
      {searchList?.length ? (
        <View>
          <Text className="">Search Resuls</Text>

          <FlatList
            data={friendList}
            renderItem={({item}) => {
              const friend = item.uid_pair.find(x => x._id !== userId);
              return (
                <TouchableOpacity
                  className="m-2"
                  activeOpacity={0.5}
                  onPress={() => {
                    handleNavigateToChat(friend._id, userId);
                  }}>
                  <View className="p-4  bg-white rounded-md">
                    <View className="flex-row space-x-2 ">
                      <Avatar.Image source={{uri: friend.photo}} size={40} />
                      <Text className="my-auto text-base">{friend.name}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      ) : null}
    </View>
  );
}
