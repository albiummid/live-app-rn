export const ldbKeys = {
  device_token: '@device_token',
  user_id: '@user_id',
  access_token: '@access_token',
  user_info:'@UsEr__info',
};

export const wsEvents = {
  receive_conversation_message: conversationId =>
    `receive_conversation_message/${conversationId}`,
  receiver_seen_message: conversationId =>
    `receiver_seen_message/${conversationId}`,
  seen_message: () => 'seen_message',
};
