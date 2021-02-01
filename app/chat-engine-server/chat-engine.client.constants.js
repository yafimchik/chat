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
};

const BROADCAST_ANSWERS = [
  ACTIONS.text,
  ACTIONS.status,
  ACTIONS.getContactsOnline,
];

module.exports = {
  ACTIONS,
  BROADCAST_ANSWERS,
};


