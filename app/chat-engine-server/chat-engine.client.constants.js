const ACTIONS = {
  text: 'text',
  messageHeader: 'message-header',
  audioInfo: 'audio-info',
  fileInfo: 'file-info',
  binaryOk: 'binary-ok',
  messageFooter: 'message-footer',
  getHistory: 'get-history',
  getChats: 'get-chats',
  getContacts: 'get-contacts',
  getContactsOnline: 'get-contacts-online',
  status: 'status',
  userInfo: 'user-info',
  voiceChannelIce: 'voice-channel-ice',
  voiceChannelOffer: 'voice-channel-offer',
  voiceChannelAnswer: 'voice-channel-answer',
  callRequest: 'call-request',
  callResponse: 'call-response',
};

const BROADCAST_ANSWERS = [
  ACTIONS.text,
  ACTIONS.status,
  ACTIONS.getContactsOnline,
  ACTIONS.voiceChannelIce,
  ACTIONS.voiceChannelOffer,
  ACTIONS.voiceChannelAnswer,
  ACTIONS.callRequest,
  ACTIONS.callResponse,
];

module.exports = {
  ACTIONS,
  BROADCAST_ANSWERS,
};


