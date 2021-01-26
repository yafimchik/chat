import Vue from 'vue';
import Vuex from 'vuex';
// import ChatData from './chat-data';
// import ChatEngine from './chat-engine';
// import UI from './ui';
import ChatEngineClient from '../chat-engine-client/chat-engine.client';

Vue.use(Vuex);

const DEFAULT_STATE = () => ({
  user: undefined,
  token: undefined,
  virtualServers: {},
  chats: {},
  chatHistory: [],
  status: {},
  contacts: [],
  contactsOnline: {},
  chatClient: undefined,
  online: false,
  userStatus: undefined, // chat id where user writes a message or undefined
  draft: {},
  currentChatId: undefined,
  unreadMessages: {},
  currentVirtualServerId: undefined,
});

export default new Vuex.Store({
  state: DEFAULT_STATE(),
  mutations: {
    setCurrentVirtualServer(state, virtualServerId) {
      if (state.currentVirtualServerId === virtualServerId) return;
      state.currentVirtualServerId = virtualServerId.slice(); // set virtual server

      state.currentChatId = state.chats[virtualServerId].length // set first chat
        ? state.chats[virtualServerId][0]._id.slice() : undefined;

      const unreadMessages = { ...state.unreadMessages }; // update unread messages count
      unreadMessages[state.currentChatId] = 0;
      state.unreadMessages = unreadMessages;
    },
    setCurrentChat(state, chatId) {
      state.currentChatId = chatId.slice();

      const unreadMessages = { ...state.unreadMessages };
      unreadMessages[chatId] = 0;
      state.unreadMessages = unreadMessages;
    },
    updateDraft(state, draftText = '') {
      state.draft[state.currentChatId] = draftText.slice();
      state.draft = { ...state.draft };
    },
    deleteDraft(state, chatId) {
      state.draft[chatId] = '';
      state.draft = { ...state.draft };
    },
    updateUserStatus(state, status) {
      state.userStatus = status;
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
      const newChatHistory = state.chatHistory.concat(chatHistory);
      state.chatHistory = newChatHistory;
    },
    addMessage(state, message) {
      const newHistory = [...state.chatHistory];
      newHistory.push(message);
      state.chatHistory = newHistory;

      if (message.chat === state.currentChatId) return;

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
    createChatEngine(state, { apiUrl, onUpdateCallback }) {
      state.chatClient = new ChatEngineClient(apiUrl, onUpdateCallback);
    },
    setToDefaultsAll(state) {
      const newState = DEFAULT_STATE();
      Object.entries(newState).forEach(([key, value]) => {
        state[key] = value;
      });
    },
    updateLinkStatus(state, isOnline) {
      state.online = isOnline;
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
    unreadMessagesByChatId(state) {
      return (chatId) => state.unreadMessages[chatId];
    },
    currentDraft(state) {
      return state.draft[state.currentChatId];
    },
    userById(state) {
      return (userId) => state.contacts.find((user) => user._id === userId);
    },
  },
  actions: {
    async logout({ commit, state }) {
      const result = await state.chatClient.disconnect();
      if (result) commit('setToDefaultsAll');
    },
    async initializeAllChatUI({ commit, state }) {
      const contacts = await state.chatClient.getContacts();
      if (contacts) commit('updateContacts', contacts);

      const chats = await state.chatClient.getAllChats();
      if (chats) {
        commit('updateChats', chats);
        const chatsArray = Object.values(chats).flat();
        const chatHistory = await state.chatClient.getAllHistory(chatsArray);
        if (chatHistory) commit('updateChatHistory', chatHistory);
      }

      if (Object.values(state.virtualServers).length) {
        commit('setCurrentVirtualServer', Object.keys(state.virtualServers)[0]);
      }
    },
    async getHistoryChunk({ commit, state }) {
      const historySize = state.chatHistory
        .filter((message) => message.chat === state.currentChatId).length;
      try {
        const historyChunk = await state.chatClient
          .getHistory(state.currentVirtualServerId, state.currentChatId, historySize);
        if (historyChunk) commit('addChatHistoryChunk', historyChunk);
      } catch (error) {
        // TODO toast error
      }
    },
  },
  modules: {
  },
});
