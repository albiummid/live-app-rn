import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {getUserList} from '../../api/user.api';
import {debounce} from '../../utils/helper';

export default function PeopleScreen({navigation}) {
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState({});

  const handleSearchUser = async t => {
    const data = await getUserList(`_page=1&_limit=10&name_like=${t}`);
    setMeta(data.meta);
    setUsers(data.list);
  };
  const handleLoadUserList = async (page = 1, limit = 20) => {
    const data = await getUserList(`_page=${page}&_limit=${limit}`);
    setMeta(data.meta);
    setUsers(data.list);
  };

  useEffect(() => {
    handleLoadUserList();
  }, []);

  return (
    <View>
      <TextInput
        className="border border-gray-400 p-2 m-2 rounded-md"
        placeholder="Search people for chat"
        placeholderTextColor={'tomato'}
        style={{color: 'gray'}}
        onChangeText={t => {
          const dSearch = debounce(handleSearchUser, 1500);
          if (t.length) {
            dSearch(t);
          } else {
            handleLoadUserList();
          }
        }}
      />

      <Text className="text-center text-lg font-bold my-5">
        {' '}
        Peoples in your location
      </Text>
      {users?.length > 0 ? (
        <FlatList
          numColumns={2}
          data={users}
          contentContainerStyle={{padding: 5}}
          renderItem={({item}) => {
            return (
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate('PublicProfile', {_id: item._id});
                }}
                activeOpacity={0.5}
                className=" m-2 flex-1  h-60 p-4 bg-slate-200 space-y-2 rounded-md">
                <Image
                  className="h-full flex-1  rounded-md w-full"
                  source={{
                    uri: item.photo,
                  }}
                />
                <Text className="text-center">{item.name}</Text>
              </TouchableOpacity>
            );
          }}
        />
      ) : null}
    </View>
  );
}
