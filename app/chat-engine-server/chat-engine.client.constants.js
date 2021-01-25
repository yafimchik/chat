const ACTIONS = {
  // checkLink: 'check-link',
  // broadcast: 'broadcast',
  text: 'text',
  getHistory: 'get-history',
  getChats: 'get-chats',
  getContacts: 'get-contacts',
  getContactsOnline: 'get-contacts-online',
  // invite: 'invite',
  // friendshipInvite: 'friendship-invite',
  // confirmInvite: 'confirmInvite',
  // leaveServer: 'leave-server',
  status: 'status',
  userInfo: 'user-info'
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


