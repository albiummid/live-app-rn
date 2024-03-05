import {api, apiOptions} from '../services/api';

export const getUsersConvesationList = async userId => {
  const {data} = await api.get(
    `/conversation/user/${userId}/list`,
    apiOptions(),
  );
  return data.result;
};

export const getConvesationMessageList = async conversationId => {
  const {data} = await api.get(
    `/conversation/conversation-message/${conversationId}/list`,
    apiOptions(),
  );
  return data.result;
};

export const createConversation = async ({uid1, uid2}) => {
  const {data} = await api.post(
    `/conversation/create`,
    {uid1, uid2},
    apiOptions(),
  );
  return data.result;
};

export const deleteConversation = async conversationId => {
  const {data} = await api.delete(`/conversation/destroy/${conversationId}`);
  return data.result;
};

export const deleteConversatinoMessage = async conversationMessageId => {
  const {data} = await api.delete(
    `/conversation/message/destroy/${conversationMessageId}`,
  );
  return data.result;
};
