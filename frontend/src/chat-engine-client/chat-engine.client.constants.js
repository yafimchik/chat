export const ACTIONS = {
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

export const VOICE_CHANNEL_SERVICE_ACTIONS = [
  ACTIONS.voiceChannelIce,
  ACTIONS.voiceChannelOffer,
  ACTIONS.voiceChannelAnswer,
];

export const CONNECTION_STATUSES = {
  CLOSED: 'closed',
  OPENING: 'opening',
  OPENED: 'opened',
  CLOSING: 'CLOSING',
};

export const ICE_SERVER_URLS = [
  'stun:stun.l.google.com:19302',
];
