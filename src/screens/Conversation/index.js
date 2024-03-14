import {View, Text, TextInput, TouchableOpacity} from 'react-native';
import React, {useEffect, useState} from 'react';
import {getUsersConvesationList} from '../../api/conversation.api';
import useAuth from '../../hooks/useAuth';
import {Button} from 'react-native-paper';

export default function ConversationScreen({navigation}) {
  const [list, setList] = useState([]);
  const [meta, setMeta] = useState(null);
  const {userId} = useAuth();

  useEffect(() => {
    getUsersConvesationList(userId).then(d => {
      console.log(d);
    });
  }, []);
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
    </View>
  );
}
