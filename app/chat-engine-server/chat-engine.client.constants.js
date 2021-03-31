const ACTIONS = {
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
  deleteVoiceChannel: 'delete-voice-channel',
  getContacts: 'get-contacts',
  getContactsOnline: 'get-contacts-online',
  status: 'status',
  userInfo: 'user-info',
  voiceChannelServiceMessage: 'voice-channel-service-message',
  webrtcServiceMessage: 'webrtc-service-message',
};

const BROADCAST_ANSWERS = [
  ACTIONS.text,
  ACTIONS.messageFooter,
  ACTIONS.status,
  ACTIONS.getContactsOnline,
  ACTIONS.createVoiceChannel,
  ACTIONS.deleteVoiceChannel,
];

module.exports = {
  ACTIONS,
  BROADCAST_ANSWERS,
};


