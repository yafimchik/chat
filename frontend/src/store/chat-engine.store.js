import ChatEngineClient from '../chat-engine-client/chat-engine.client';

const DEFAULT_STATE = () => ({
  chatClient: undefined,
  voiceChannelOnline: false,
});

export default {
  state: DEFAULT_STATE,
  mutations: {
    createChatEngine(state, { apiUrl, onUpdateCallback, onInputStreamCallback }) {
      state.chatClient = new ChatEngineClient(apiUrl, onUpdateCallback, onInputStreamCallback);
    },
    setToDefaultsAll(state) {
      const newState = DEFAULT_STATE();
      Object.entries(newState).forEach(([key, value]) => {
        state[key] = value;
      });
    },
    setVoiceChannelState(state, value = false) {
      state.voiceChannelOnline = value;
    },
  },
  getters: {
    isChatEngineInitialized(state) {
      return !!state.chatClient;
    },
  },
  actions: {
    async sendUserStatus({ state, getters }) {
      state.chatClient.sendStatus(getters.currentVirtualServerId, getters.userStatus);
    },
    async updateUserChatStatus({ commit, dispatch }, chatId) {
      commit('updateUserChatStatus', chatId);
      await dispatch('sendUserStatus');
    },
    async updateUserVoiceChannelStatus({ commit, dispatch }, voiceChannelId) {
      commit('updateUserVoiceChannelStatus', voiceChannelId);
      await dispatch('sendUserStatus');
    },
    async updateUserStatus({ commit, dispatch }, newStatus) {
      commit('updateUserStatus', newStatus);
      await dispatch('sendUserStatus');
    },
    async initChatClient({ state, commit }, { apiUrl, onUpdateCallback, onInputStreamCallback }) {
      if (state.chatClient) return;
      commit('createChatEngine', { apiUrl, onUpdateCallback, onInputStreamCallback });
    },
    async login({ state, commit, dispatch }, { user, password }) {
      if (!state.chatClient) return;

      try {
        const loginResult = await state.chatClient.login(user, password);
        if (!loginResult) {
          commit('postNotification', { error: true, message: 'Wrong username or password!' });
          return;
        }
        await dispatch('saveUser', loginResult);
      } catch (e) {
        commit('postNotification', { error: true });
      }
    },
    async connectToServer({ state, getters, commit }) {
      if (!getters.isLoggedIn) return;

      try {
        const connected = await state.chatClient.connect();

        if (!connected) commit('postNotification', { error: true });
        commit('updateLinkStatus', connected);
      } catch (e) {
        commit('postNotification', { error: true });
      }
    },
    async register({ state, commit, dispatch }, { user, password }) {
      if (!state.chatClient) return;

      try {
        const registerResult = await state.chatClient.register(user, password);
        if (!registerResult) {
          commit('postNotification', { error: true, message: 'Wrong username or password!' });
          return;
        }
        await dispatch('saveUser', registerResult);
      } catch (e) {
        console.error(e);
        commit('postNotification', { error: true });
      }
    },
    async logout({ state, commit }) {
      const result = await state.chatClient.disconnect();
      if (result) {
        commit('setToDefaultsAll');
      }
    },
    async connectToVoiceChannel(
      {
        state,
        getters,
        commit,
        dispatch,
        rootState,
      },
      voiceChannel,
    ) {
      if (state.voiceChannelOnline) {
        const voiceChannelId = getters.currentVoiceChannelId;
        await dispatch('disconnectFromVoiceChannel');
        await dispatch('updateUserVoiceChannelStatus', undefined);
        if (voiceChannelId === voiceChannel) return;
      }
      const contacts = getters.getVoiceChannelContacts(voiceChannel);

      const result = await state.chatClient.connectToVoiceChannel(
        rootState.chatData.currentVirtualServerId,
        voiceChannel,
        contacts,
      );
      const status = result ? voiceChannel : undefined;

      await dispatch('updateUserVoiceChannelStatus', status);
      commit('setVoiceChannelState', result);
    },
    async disconnectFromVoiceChannel({ state, commit, dispatch }) {
      await state.chatClient.disconnectFromVoiceChannel();
      await dispatch('updateUserVoiceChannelStatus', undefined);
      commit('setVoiceChannelState', false);
    },
    async initializeAllChatUI(
      {
        commit,
        state,
        dispatch,
        rootState,
      },
    ) {
      const contacts = await state.chatClient.getContacts();
      if (contacts) commit('updateContacts', contacts);

      const chats = await state.chatClient.getAllChats();

      if (chats) {
        commit('updateChats', chats);
        const chatsArray = Object.values(chats).flat();
        const chatHistory = await state.chatClient.getAllHistory(chatsArray);
        if (chatHistory) commit('updateChatHistory', chatHistory);
      }

      const voiceChannels = await state.chatClient.getAllVoiceChannels();
      if (voiceChannels) commit('updateVoiceChannels', voiceChannels);

      const { virtualServers } = rootState.chatData;
      if (Object.values(virtualServers).length) {
        dispatch('setCurrentVirtualServer', Object.keys(virtualServers)[0]);
      }
    },
    disconnectContact({ state }, contact) {
      state.chatClient.onContactDisconnect(contact);
    },
    async getHistoryChunk({ commit, state, rootState }) {
      const curChat = rootState.chatData.currentChatId;
      const curServer = rootState.chatData.currentVirtualServerId;
      const historySize = rootState.chatData.chatHistory
        .filter((message) => message.chat === curChat).length;
      try {
        const historyChunk = await state.chatClient
          .getHistory(curServer, curChat, historySize);
        if (historyChunk) commit('addChatHistoryChunk', historyChunk);
      } catch (e) {
        console.debug('history chunk error ', e);
      }
    },
  },
};
