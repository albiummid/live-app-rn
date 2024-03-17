import React, {useState, useEffect} from 'react'
import { useNavigation } from '@react-navigation/native';

import SingleHost from './SingleHost';
import { View, Text } from 'react-native';
import { getUserById } from '../../api/user.api';
import { ldb } from '../../libs/ldb';
import { ldbKeys } from '../../constants/keys';
import { bsGetBroadcast } from '../../services/live/AppServerService';
import { inquireBroadcast } from '../../services/live/StreamingServerService';
import Layout12 from '../layouts/Layout12';
export default function JoinBroadcast({route}) {
  const navigation = useNavigation();
  const [broadcastId, setBroadcastId] = useState(route.params?.broadcastId|| null);
  const [streamKind, setStreamKind] = useState('');
  const [seats, setSeats] = useState(0);
  const [mode, setMode] = useState(route.params?.mode||'Watch');
  const [originId, setOriginId] = useState(route.params?.user._id||'NoOrigin');
  const [user, setUser] = useState(null);
  const [broadcastEnded, setBroadcastEnded] = useState(false);
  const [renderCount, setRenderCount] = useState(1);

  useEffect(() => {
    console.log("Initial Broadcast Id: ", broadcastId);
    (async () => {
      const localUser = await getUserById(ldb.get(ldbKeys.user_id));
      setUser(localUser);
    })();
    if(!broadcastId){
      console.log('Broadcast is null');
    }

    console.log(broadcastId)


    async function __inquire(broadcastId){
      try{
        const broadcastInquire = await inquireBroadcast(originId, broadcastId, {}); 
        if(broadcastInquire.timeBook.endedAt !== null){
          setBroadcastEnded(true);
        }
        const bsBroadcast = await bsGetBroadcast({broadcastId}); 
        setStreamKind(bsBroadcast.broadcast.hostCount == 1 ? 'OTMAV':'FTMA');
        // setSeats(bsBroadcast.broadcast.seats);
      }
      catch(error){
        console.log('Join Broadcast Inquire Error');
        console.log(error);
      }
    }
    console.log('Inquiring');
    __inquire(broadcastId)
    
  }, []);

  // useEffect to do broadcastEnded true

  function onSwipe(payload){
    console.log(payload);
  }

  console.log(streamKind)

  if(!user  &&  streamKind === '')null;

  if(streamKind == "OTMAV"){
    return (
      <SingleHost 
        broadcastId={broadcastId} 
        mode={mode}
        user={user}
      />
    )
  }
  else if(streamKind == "FTMA"){
    return(
      <Layout12
        broadcastId={broadcastId} 
        mode={mode}
        user={user}
      />
    )
  }
}
