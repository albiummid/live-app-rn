import { appServerWS } from "../ws";

export async function bsInitiateBroadcast(payload){
  return new Promise((resolve, reject) => {
    const { userId, broadcastId, hostId, title, streamKind, seats, initiatedAt } = payload
    appServerWS.emit('core::broadcast-initiate', { 
      userId, broadcastId, hostId, title, streamKind, seats, initiatedAt
    },
    async (data)=> {
      if(data.error){
        reject(data.error)
      }
      resolve(data.data);
    })
  })
}


export async function bsGetBroadcast(payload){
  return new Promise((resolve, reject) => {
    const { broadcastId } = payload
    console.log('bsGetBroadcast Params', broadcastId);

    appServerWS.emit('core::broadcast-details', { 
      broadcastId
    },
    async (data)=> {
      if(data.error){
        reject(data.error)
      }
      resolve(data.data);
    })
  })
}

export async function bsJoinBroadcast(payload){
  return new Promise((resolve, reject) => {
    const { broadcastId, userId, subscriberId } = payload
    console.log('bsJoinBrodcast Params', payload);

    appServerWS.emit('core::broadcast-room-join', { 
      broadcastId,
      userId,
      subscriberId
    },
    async (data)=> {
      console.log('New Viewer Join Data', data);
      if(data.error){
        reject(data.error)
      }
      resolve(data.data);
    })
  })
}

export async function bsJoinAsBroadcaster(payload){
  return new Promise((resolve, reject) => {
    const { broadcastId, userId, publisherId, kind } = payload
    console.log('bsJoinBrodcastAsBroadcaster Params', payload);

    appServerWS.emit('core::broadcast-room-join-as-broadcaster', { 
      broadcastId,
      userId,
      publisherId,
      kind
    },
    async (data)=> {
      console.log('New Broadcaster Join Data', data);
      if(data.error){
        reject(data.error)
      }
      resolve(data.data);
    })
  })
}

export async function bsSendComment(payload){
  return new Promise((resolve, reject) => {
    const { broadcastId, userId, subscriberId, comment, chatText } = payload
    console.log('bsSendComment Params', payload);

    appServerWS.emit('core::broadcast-room-send-comment', { 
      broadcastId,
      userId,
      subscriberId,
      comment,
      chatText
    },
    async (data)=> {
      console.log('Send Comment Data', data);
      if(data.error){
        reject(data.error)
      }
      resolve(data.data);
    })
  })
}

export async function bsStopBroadcasting(payload){
  return new Promise((resolve, reject) => {
    const { broadcastId, userId } = payload
    console.log('bsStopBroadcasting Params', payload);

    appServerWS.emit('core::broadcast-room-stop-broadcasting', { 
      broadcastId,
      userId
    },
    async (data)=> {
      console.log('Stop Broadcasting Data', data);
      if(data.error){
        reject(data.error)
      }
      resolve(data.data);
    })
  })
}



