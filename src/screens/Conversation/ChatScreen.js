import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  TouchableHighlight,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import VectorIcon, {Icons} from '../../components/VectorIcon';
import {FAB} from 'react-native-paper';
import {
  createConversation,
  getConvesationByUIDs,
  getConvesationMessageList,
  sendMessage,
} from '../../api/conversation.api';
import useAuth from '../../hooks/useAuth';
import {ws} from '../../services/ws';
import {wsEvents} from '../../constants/keys';
import moment from 'moment';

export default function ChatScreen({route, navigation}) {
  const {conversation} = route.params;
  const {userId} = useAuth();
  const [messageList, setMessageList] = useState([]);
  const [meta, setMeta] = useState({});
  const [messageStr, setMessageStr] = useState('');
  const [otherPerson, setOtherPerson] = useState(
    conversation?.uid_pair?.find(x => x._id !== userId),
  );

  const socketRef = useRef(ws);
  const listRef = useRef(null);

  useEffect(() => {
    if (otherPerson) {
      navigation.setOptions({
        headerTitle: otherPerson.name,
        headerTitleStyle: {
          fontSize: 16,
        },
      });
    }
  }, [otherPerson]);

  const getList = async (page = 1) => {
    return await getConvesationMessageList(
      conversation._id,
      `_page=${page}&_limit=${15}&_sort=created_at&_order=dsc`,
    );
  };

  useEffect(() => {
    if (conversation) {
      // Listening for incoming and outgoing messages
      socketRef.current.on(
        wsEvents.receive_conversation_message(conversation._id),
        ({message}) => {
          setMessageList(prv => [message, ...prv]);
          listRef.current.scrollToOffset({animated: true});
        },
      );

      // fetchMessageList
      getConvesationMessageList(
        conversation._id,
        `_page=${meta?.page ?? 1}&_limit=${
          meta?.limit ?? 15
        }&_sort=created_at&_order=dsc`,
      ).then(l => {
        setMessageList(l.list);
        setMeta(l.meta);
      });
    }

    // Listen for message seen
    socketRef.current.on(
      wsEvents.receiver_seen_message(conversation._id),
      ({message}) => {
        setMessageList(prv => {
          let i = prv.findIndex(x => x._id === message._id);
          let temp = prv.splice(i, 1, message);
          setMessageList(temp);
        });
      },
    );

    return () => {
      socketRef.current.off(
        wsEvents.receive_conversation_message(conversation._id),
      );
    };
  }, [conversation]);

  return (
    <View className="flex-1">
      <View className=" mt-auto">
        <FlatList
          inverted
          ref={listRef}
          data={messageList}
          onEndReachedThreshold={2}
          onEndReached={async () => {
            console.log('ON_END_REACH');
            if (meta.page != meta.pages) {
              const data = await getList(meta.page + 1);
              setMessageList(prv => prv.concat(data.list));
              setMeta(data.meta);
            }
          }}
          ListFooterComponent={() => <View className="h-20" />}
          renderItem={({item}) => {
            const isOwnMessage = item.owner === userId;
            if (item.content_type == 'text') {
              return <MessageThread item={item} isOwnMessage={isOwnMessage} />;
            }
          }}
        />
      </View>
      <View className="flex-row m-3 space-x-3 ">
        <TouchableOpacity>
          <VectorIcon
            type={Icons.Ionicons}
            name="add-circle-outline"
            className="my-auto"
            size={30}
          />
        </TouchableOpacity>
        <TextInput
          multiline
          onChangeText={t => {
            setMessageStr(t);
          }}
          value={messageStr}
          className="border mt-auto border-gray-300  flex-1 rounded-md p-2 px-3 text-black"
        />
        <TouchableOpacity
          onPress={() => {
            sendMessage(messageStr, 'text', conversation._id, userId)
              .then(res => {
                console.log('Message sent');
                setMessageStr('');
              })
              .catch(e => {
                console.log(e);
              });
          }}
          disabled={messageStr.length == 0}>
          <VectorIcon type={Icons.Ionicons} name="send" className="my-auto" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const MessageThread = ({item, isOwnMessage}) => {
  const {userId} = useAuth();
  const [tapped, setTapped] = useState(false);
  const socketRef = useRef(ws);
  return (
    <View
      onLayout={() => {
        if (!item.seen && item.owner !== userId) {
          // receiver will seen the message
          socketRef.current.emit(wsEvents.seen_message, {_id: item._id});
        }
      }}
      className={`w-3/2 `}>
      {tapped && (
        <Text className="text-xs text-center mt-2">
          {moment(item.created_at)
            .format('DD MMM - hh:MM A')
            .replace('-', 'AT')}
        </Text>
      )}
      <View className={`flex-row ${isOwnMessage ? `ml-auto` : 'mr-auto'}`}>
        <View>
          <Text
            onPress={() => {
              setTapped(prv => !prv);
            }}
            className={` p-2 bg-red-200 m-2 text-lg px-5 rounded-xl `}>
            {item.content}
          </Text>
          {tapped && (
            <Text className="text-right mr-2">
              {item.seen ? 'Seen' : 'Not seen'}
            </Text>
          )}
        </View>

        <VectorIcon
          className="mt-auto"
          type={Icons.Ionicons}
          size={20}
          name={
            item.seen ? 'checkmark-cirle-sharp' : 'checkmark-circle-outline'
          }
        />
      </View>
    </View>
  );
};
