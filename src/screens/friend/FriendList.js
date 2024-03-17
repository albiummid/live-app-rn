import {View, Text, FlatList} from 'react-native';
import React, {useEffect, useState} from 'react';
import {getFriendList, getRequestSendList} from '../../api/friend.api';
import useAuth from '../../hooks/useAuth';
import {ldb} from '../../libs/ldb';
import {ldbKeys} from '../../constants/keys';
import {Avatar, Button, Divider} from 'react-native-paper';
import moment from 'moment';

export default function FriendListScreen({navigation}) {
  const {userId} = useAuth();
  const [list, setList] = useState([]);
  const [meta, setMeta] = useState(null);

  useEffect(() => {
    getFriendList(userId).then(d => {
      setList(d.list);
      setMeta(d.meta);
    });
  }, []);

  console.log(list[0]?.uid_pair);
  return (
    <View>
      <FlatList
        data={list}
        renderItem={({item}) => {
          const friend = item.uid_pair.find(x => x._id !== userId);
          return (
            <View className="p-4  bg-white rounded-md m-2">
              <View className="flex-row space-x-2 ">
                <Avatar.Image source={{uri: friend.photo}} size={40} />
                <Text className="my-auto text-base">{friend.name}</Text>
                <Text className="absolute top-2 right-2">
                  {moment(item.created_at).fromNow()}
                </Text>
              </View>
              <Divider className="my-2" />
              <Button
                onPress={() => {
                  navigation.navigate('PublicProfile', {_id: friend._id});
                }}>
                View Profile
              </Button>
            </View>
          );
        }}
      />
    </View>
  );
}
