import {View, Text, TouchableOpacity} from 'react-native';
import React from 'react';
import {useEffect, useState} from 'react';
import {ldb} from '../libs/ldb';
import {ldbKeys} from '../constants/keys';
import {getFriendCount} from '../api/friend.api';
import {getFollowCount} from '../api/follow.api';
import {getFanCount} from '../api/fan.api';
import {getUserId} from '../constants/values';
export default function ProfileScreen({navigation}) {
  const [friendCount, setFriendCount] = React.useState(0);
  const [fanCount, setFanCount] = React.useState(0);
  const [followerCount, setFollowerCount] = React.useState(0);
  const userId = ldb.get(ldbKeys.user_id);

  useEffect(() => {
    getFanCount(getUserId()).then(d => setFanCount(d));
    getFollowCount(getUserId()).then(d => setFollowerCount(d));
    getFriendCount(getUserId()).then(d => setFriendCount(d));
  }, []);

  return (
    <View>
      <Text>ProfileScreen</Text>
      <View className="flex-row justify-around my-5">
        <Text>Friend: {friendCount}</Text>
        <Text>Follower: {followerCount}</Text>
        <Text>Fan: {fanCount}</Text>
      </View>
      <View>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('Wallet');
          }}
          className="bg-red-400 ">
          <Text className="p-5">Wallet</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('Friends');
          }}
          className="bg-red-400 ">
          <Text className="p-5">Friends</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            ldb.delete(ldbKeys.access_token);
            ldb.delete(ldbKeys.user_id);
            navigation.navigate('Login');
          }}
          className="bg-red-400 my-1 ">
          <Text className="p-5">SignOUt</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
