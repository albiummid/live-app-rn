import {api, apiOptions} from '../services/api';

export const getUsersConvesationList = async userId => {
  const {data} = await api.get(
    `/conversation/user/${userId}/list`,
    apiOptions(),
  );
  return data.result;
};

export const getConvesationMessageList = async (conversationId, query = '') => {
  const {data} = await api.get(
    `/conversation/conversation-message/${conversationId}/list?${query}`,
    apiOptions(),
  );
  return data.result;
};
export const getConvesationByUIDs = async (uid1, uid2) => {
  const {data} = await api.get(
    `/conversation/uids/${uid1}/${uid2}`,
    apiOptions(),
  );
  return data.result;
};

export const createConversation = async (uid1, uid2) => {
  const {data} = await api.post(
    `/conversation/create`,
    {uid1, uid2},
    apiOptions(),
  );
  return data.result;
};
export const sendMessage = async (
  content,
  content_type,
  conversation_id,
  owner,
) => {
  const {data} = await api.post(
    `/conversation/message/send`,
    {content, content_type, conversation_id, owner},
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
