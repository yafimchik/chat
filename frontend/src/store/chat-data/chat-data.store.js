import voiceChannelStore from './voice-channel.store';
import statusStore from './status.store';

const DEFAULT_STATE = () => ({
  user: undefined,
  token: undefined,
  virtualServers: {},
  chats: {},
  chatHistory: [],
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
      if (chatId) state.currentChatId = chatId.slice();
      else state.currentChatId = chatId;
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
    addChat(state, { virtualServer, chat }) {
      const newChats = { ...state.chats };
      if (!newChats[virtualServer]) newChats[virtualServer] = [];
      newChats[virtualServer].push(chat);
      state.chats = newChats;
    },
    updateChatHistory(state, chatHistory) {
      state.chatHistory = [...chatHistory];
    },
    addChatHistoryChunk(state, chatHistory) {
      if (chatHistory.length) {
        const newChatHistory = state.chatHistory.concat(chatHistory);
        state.chatHistory = newChatHistory;
      }
    },
    addMessage(state, message) {
      const newHistory = [...state.chatHistory];
      newHistory.unshift(message);
      state.chatHistory = newHistory;
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
      const newState = DEFAULT_STATE();
      Object.entries(newState).forEach(([key, value]) => {
        state[key] = value;
      });
    },
  },
  getters: {
    contactsOnlineOfCurrentServer(state) {
      return state.contactsOnline[state.currentVirtualServerId];
    },
    user(state) {
      return state.user;
    },
    currentVirtualServerId(state) {
      return state.currentVirtualServerId;
    },
    currentChatId(state) {
      return state.currentChatId;
    },
    usersOnline(state) {
      return state.contactsOnline[state.currentVirtualServerId];
    },
    chatsByCurrentVirtualServer(state) {
      if (!state.currentVirtualServerId) return [];
      const result = state.chats[state.currentVirtualServerId];
      if (!result) return [];
      return result;
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
    currentHistorySize(state, getters) {
      return getters.currentChatHistory.length;
    },
    usernameById(state) {
      return (id) => {
        const user = state.contacts.find((contact) => contact._id === id);
        return user ? user.username : '';
      };
    },
    userById(state) {
      return (userId) => state.contacts.find((user) => user._id === userId);
    },
  },
  actions: {
    addMessage({ commit, getters }, message) {
      commit('addMessage', message);
      commit('addUnreadMessage', message.chat);
      if (!getters.isChatOpened && message.chat === getters.currentChatId) {
        commit('postNotification', {
          title: `Room ${getters.currentVoiceChannel.name} : `,
          message: `${getters.userById(message.user).username} : ${message.text}`,
        });
      }
    },

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
    async saveUser({ commit }, loginResult) {
      commit('saveUser', loginResult.user);
      commit('saveToken', loginResult.token);
      commit('setVirtualServers', loginResult.virtualServers);
    },
  },
  modules: {
    voiceChannel: voiceChannelStore,
    status: statusStore,
  },
};
