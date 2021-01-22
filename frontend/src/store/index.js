import Vue from 'vue';
import Vuex from 'vuex';
// import ChatData from './chat-data';
// import ChatEngine from './chat-engine';
// import UI from './ui';
import ChatEngineClient from '../../chat-engine-client/chat-engine.client';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
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
  },
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
        // eslint-disable-next-line
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
      newContacts = newContacts
        .filter((user, index) => newContacts.indexOf(user) === index);

      newContacts = newContacts // eslint-disable-next-line
        .filter((userOnline) => !state.contacts.some((user) => user._id === userOnline._id));
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
    deleteChatEngine(state) {
      state.chatClient = undefined;
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
      return [...curChatHistory];
    },
    usernameById(state) {
      return (id) => { // eslint-disable-next-line
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
    userById(state) { // eslint-disable-next-line
      return (userId) => state.contacts.find(user => user._id === userId);
    },
  },
  actions: {
    async initializeAllChatUI({ commit, state }) {
      const contacts = await state.chatClient.getContacts();
      if (contacts) commit('updateContacts', contacts);

      // const contactsOnline = await state.chatClient.getContactsOnline();
      // if (contactsOnline) commit('updateContactsOnline', contactsOnline);

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
  },
  modules: {
  },
});
