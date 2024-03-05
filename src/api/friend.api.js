import {getAuth} from '../libs/appInit';
import {api, apiOptions} from '../services/api';
import {catchAsyncErrors} from '../utils/helper';

export const getFriendCount = async userId => {
  const {data} = await api.get(`/friend/count/${userId}`, apiOptions());
  return data.result.count;
};

export const getFriendList = async userId => {
  const {data} = await api.get(`/friend/list/${userId}`, apiOptions());
  return data.result;
};
export const getRequestReceiveList = async () => {
  const {data} = await api.get(
    `/request-receive/list/${getAuth().userId}`,
    apiOptions(),
  );
  return data.result;
};
export const getRequestSendList = async () => {
  const {data} = await api.get(
    `/request-send/list/${getAuth().userId}`,
    apiOptions(),
  );
  return data.result;
};
export const sendFriendRequest = async ({senderId, receiverId}) => {
  const {data} = await api.post(
    `/request/send`,
    {senderId, receiverId},
    apiOptions(),
  );
  return data.result;
};
export const acceptFriendRequest = async ({requestId, acceptorId}) => {
  const {data} = await api.post(
    `/request/send`,
    {requestId, acceptorId},
    apiOptions(),
  );
  return data.result;
};
export const rejectFriendRequest = async ({requestId, acceptorId}) => {
  const {data} = await api.post(
    `/request/send`,
    {requestId, acceptorId},
    apiOptions(),
  );
  return data.result;
};
export const cancelFriendRequest = async ({requestId, senderId}) => {
  const {data} = await api.post(
    `/request/send`,
    {requestId, senderId},
    apiOptions(),
  );
  return data.result;
};

export const getFriendshipStatus = async ({uid1, uid2}) => {
  const {data} = await api.post(`/friend/status`, {uid1, uid2}, apiOptions());
  return data.result.count;
};
