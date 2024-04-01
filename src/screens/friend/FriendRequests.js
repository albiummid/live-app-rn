import moment from 'moment';
import React, {useEffect, useState} from 'react';
import {FlatList, Text, View} from 'react-native';
import {Avatar, Button, Divider} from 'react-native-paper';
import {
  acceptFriendRequest,
  getRequestReceiveList,
  rejectFriendRequest,
} from '../../api/friend.api';
import {getUserId} from '../../constants/values';
export default function FriendRequestsScreen() {
  const userId = getUserId();
  const [list, setList] = useState([]);
  const [meta, setMeta] = useState(null);

  useEffect(() => {
    getRequestReceiveList(userId).then(d => {
      console.log(d);
      setList(d.list);
      setMeta(d.meta);
    });
  }, []);

  console.log(list);
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
                <Button
                  onPress={() => {
                    rejectFriendRequest(item._id, getUserId()).then(() => {
                      setList(l => l.filter(x => x._id !== item._id));
                    });
                  }}
                  mode="contained"
                  buttonColor="red">
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
