import {View, Text, FlatList} from 'react-native';
import React, {useEffect, useState} from 'react';
import useAuth from '../../hooks/useAuth';
import {
  acceptFriendRequest,
  getRequestReceiveList,
  getRequestSendList,
} from '../../api/friend.api';
import {Avatar, Button, Divider} from 'react-native-paper';
import moment from 'moment';
export default function FriendRequestsScreen() {
  const {userId} = useAuth();
  const [list, setList] = useState([]);
  const [meta, setMeta] = useState(null);

  useEffect(() => {
    getRequestReceiveList(userId).then(d => {
      setList(d.list);
      setMeta(d.meta);
    });
  }, []);
  return (
    <View>
      <FlatList
        data={list}
        renderItem={({item}) => {
          const sender = item.request_sender;
          return (
            <View className="p-4  bg-white rounded-md m-2">
              <View className="flex-row space-x-2 ">
                <Avatar.Image source={{uri: sender.photo}} size={40} />
                <Text className="my-auto text-base">{sender.name}</Text>
                <Text className="absolute top-2 right-2">
                  {moment(item.created_at).fromNow()}
                </Text>
              </View>
              <Divider className="my-2" />
              <View className="flex-row justify-between">
                <Button onPress={() => {}} mode="contained" buttonColor="red">
                  Reject
                </Button>
                <Button
                  onPress={() => {
                    acceptFriendRequest(item._id, userId).then(r => {
                      console.log(r);
                      setList(l => l.filter(x => x._id !== item._id));
                    });
                  }}
                  mode="contained"
                  buttonColor="green">
                  Accept
                </Button>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}
