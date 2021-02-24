export const ACTIONS = {
  text: 'text',
  messageHeader: 'message-header',
  audioInfo: 'audio-info',
  fileInfo: 'file-info',
  binaryOk: 'binary-ok',
  messageFooter: 'message-footer',
  getHistory: 'get-history',
  getChats: 'get-chats',
  getVoiceChannels: 'get-voice-channels',
  createVoiceChannel: 'create-voice-channel',
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

export const VOICE_CHANNEL_USER_ROLES = {
  listener: 'listener',
  speaker: 'speaker',
  candidate: 'candidate',
};

export const ICE_SERVER_URLS = [
  'stun:stun.l.google.com:19302',
];
