const DEFAULT_STATE = () => ({
  user: undefined,
  token: undefined,
  virtualServers: {},
  chats: {},
  chatHistory: [],
  status: {},
  contacts: [],
  contactsOnline: {},
  currentVirtualServerId: undefined,
  currentChatId: undefined,
});

export default {
  state: DEFAULT_STATE,
  mutations: {
    setCurrentVirtualServer(state, virtualServerId) {
      if (state.currentVirtualServerId === virtualServerId) return;
      state.currentVirtualServerId = virtualServerId.slice(); // set virtual server

      state.currentChatId = state.chats[virtualServerId].length // set first chat
        ? state.chats[virtualServerId][0]._id.slice() : undefined;
    },
    setCurrentChat(state, chatId) {
      state.currentChatId = chatId.slice();
    },
    setVirtualServers(state, virtualServersArray) {
      const virtualServers = {};
      virtualServersArray.forEach((vs) => {
        virtualServers[vs._id] = { ...vs };
      });
      state.virtualServers = virtualServers;
    },
    setChats(state, chats) {
      state.chats = { ...chats };
    },
    saveUser(state, user) {
      state.user = { ...user };
    },
    saveToken(state, token) {
      if (typeof token === 'string') state.token = token.slice();
    },
    updateChats(state, chats) {
      state.chats = { ...chats };
    },
    updateChatHistory(state, chatHistory) {
      state.chatHistory = [...chatHistory];
    },
    addChatHistoryChunk(state, chatHistory) {
      if (!chatHistory.length) {
        const historyLoaded = { ...state.historyLoaded };
        historyLoaded[state.currentChatId] = true;
        state.historyLoaded = historyLoaded;
      } else {
        const newChatHistory = state.chatHistory.concat(chatHistory);
        state.chatHistory = newChatHistory;
      }
    },
    addMessage(state, message) {
      const newHistory = [...state.chatHistory];
      newHistory.unshift(message);
      state.chatHistory = newHistory;

      const unreadMessages = { ...state.unreadMessages };
      unreadMessages[message.chat] += 1;
      state.unreadMessages = unreadMessages;
    },
    updateStatus(state, { virtualServer, status }) {
      const newStatus = { ...state.status };
      newStatus[virtualServer] = status;
      state.status = { ...newStatus };
    },
    updateContactsOnline(state, { virtualServer, contactsOnline }) {
      const newContactsOnline = { ...state.contactsOnline };
      newContactsOnline[virtualServer] = contactsOnline;
      state.contactsOnline = newContactsOnline;

      let newContacts = Object.values(newContactsOnline).flat();
      newContacts = newContacts.filter(
        (user, index) => newContacts.indexOf(user) === index,
      );

      newContacts = newContacts.filter(
        (userOnline) => !state.contacts.some((user) => user._id === userOnline._id),
      );
      if (newContacts.length) {
        newContacts = state.contacts.concat(newContacts);
        state.contacts = [...newContacts];
      }
    },
    updateContacts(state, contacts) {
      state.contacts = [...contacts];
    },
    setToDefaultsAll(state) {
      console.log('set to def');
      const newState = DEFAULT_STATE();
      Object.entries(newState).forEach(([key, value]) => {
        console.log('key ', key);
        console.log('val ', value);
        state[key] = value;
      });
    },
  },
  getters: {
    usersOnline(state) {
      return state.contactsOnline[state.currentVirtualServerId];
    },
    chatsByCurrentVirtualServer(state) {
      if (!state.currentVirtualServerId) return [];
      return state.chats[state.currentVirtualServerId];
    },
    isLoggedIn(state) {
      return !!state.user;
    },
    currentChat(state) {
      const chat = state.chats[state.currentChatId];
      return { ...chat };
    },
    currentVirtualServer(state) {
      return state.virtualServers[state.currentVirtualServerId];
    },
    currentChatHistory(state) {
      const curChatHistory = state.chatHistory
        .filter((message) => message.chat === state.currentChatId);
      if (!curChatHistory) return [];
      return curChatHistory.reverse();
    },
    usernameById(state) {
      return (id) => {
        const user = state.contacts.find((contact) => contact._id === id);
        return user ? user.username : '';
      };
    },
    currentVirtualServerStatus(state) {
      return state.status[state.currentVirtualServerId];
    },
    userById(state) {
      return (userId) => state.contacts.find((user) => user._id === userId);
    },
  },
  actions: {
    setCurrentVirtualServer({ commit }, serverId) {
      commit('setCurrentVirtualServer', serverId);
      commit('setAttachedFiles', []);
      commit('saveRecord', undefined);
    },
    setCurrentChat({ commit }, chatId) {
      commit('setCurrentChat', chatId);
      commit('setAttachedFiles', []);
      commit('saveRecord', undefined);
    },
  },
};
