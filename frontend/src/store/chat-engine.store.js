import ChatEngineClient from '@/chat-engine-client/chat-engine.client';

const DEFAULT_STATE = () => ({
  chatClient: undefined,
  voiceChannelOnline: false,
  isChatDataInitialized: false,
});

export default {
  state: DEFAULT_STATE,
  mutations: {
    setChatDataInitialized(state, value) {
      state.isChatDataInitialized = value;
    },
    createChatEngine(state, {
      apiUrl,
      onUpdateCallback,
      onInputStreamCallback,
      onCloseConnectionCallback,
      onVoiceDetectionEventCallback,
    }) {
      state.chatClient = new ChatEngineClient(apiUrl, onUpdateCallback,
        onInputStreamCallback, onCloseConnectionCallback, onVoiceDetectionEventCallback);
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
    chatEngine(state) {
      return state.chatClient;
    },
    microphoneMuted(state) {
      return state.chatClient.microphoneMuted;
    },
    isChatEngineInitialized(state) {
      return !!state.chatClient;
    },
  },
  actions: {
    async switchMicrophone({ state, getters }, value) {
      if (state.chatClient) {
        const newValue = value === undefined ? !getters.currentUserMutedStatus : value;
        state.chatClient.switchMicrophone(getters.isSpeaker && newValue);
      }
    },
    async sendUserStatus({ state, getters, dispatch }) {
      await dispatch('switchMicrophone');
      state.chatClient.chatInterface
        .sendStatus(getters.currentVirtualServerId, getters.userStatus);
    },
    async sendTextMessage({ state, getters }, text) {
      await state.chatClient.chatInterface
        .sendText(getters.currentVirtualServerId, getters.currentChatId, text);
    },
    async initChatClient({ state, commit }, {
      apiUrl,
      onUpdateCallback,
      onInputStreamCallback,
      onCloseConnectionCallback,
      onVoiceDetectionEventCallback,
    }) {
      if (state.chatClient) return;
      commit('createChatEngine', {
        apiUrl,
        onUpdateCallback,
        onInputStreamCallback,
        onCloseConnectionCallback,
        onVoiceDetectionEventCallback,
      });
    },
    async login({ state, commit, dispatch }, { user, password, noNotification }) {
      if (!state.chatClient) return;

      try {
        const loginResult = await state.chatClient.login(user, password);
        if (!loginResult && !noNotification) {
          commit('postNotification', { error: true, message: 'Wrong username or password!' });
          return;
        }
        await dispatch('saveUser', loginResult);
      } catch (e) {
        if (!noNotification) commit('postNotification', { error: true });
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
    async register({ state, commit, dispatch }, { user, password, noNotification }) {
      if (!state.chatClient) return;

      try {
        const registerResult = await state.chatClient.register(user, password);
        if (!registerResult && !noNotification) {
          commit('postNotification', { error: true, message: 'Wrong username or password!' });
          return;
        }
        await dispatch('saveUser', registerResult);
      } catch (e) {
        if (!noNotification) commit('postNotification', { error: true });
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
      },
      voiceChannel,
    ) {
      if (state.voiceChannelOnline) {
        const voiceChannelId = getters.currentVoiceChannelId;
        await dispatch('disconnectFromVoiceChannel');
        await dispatch('updateUserVoiceChannelStatus', undefined);
        if (voiceChannelId === voiceChannel) return;
      }
      const contacts = getters.getVoiceChannelContacts(voiceChannel)
        .map((user) => user._id);

      const result = await getters.chatEngine
        .connectToVoiceChannel(getters.currentVirtualServerId, voiceChannel, contacts);
      const status = result ? voiceChannel : undefined;

      await dispatch('updateUserVoiceChannelStatus', status);
      commit('setVoiceChannelState', result);
    },
    async disconnectFromVoiceChannel({ state, commit, dispatch }) {
      await state.chatClient.disconnectFromVoiceChannel();
      await dispatch('setUserRoleToDefault');
      await dispatch('updateUserVoiceChannelStatus', undefined);
      commit('setVoiceChannelState', false);
    },
    async createVoiceChannelOnServer({ state, getters, dispatch }, title) {
      await state.chatClient.chatInterface
        .createVoiceChannel(getters.currentVirtualServerId, title);
    },
    async deleteVoiceChannelOnServer({ state, getters, dispatch }, id) {
      if (getters.currentVoiceChannelId === id) await dispatch('disconnectFromVoiceChannel');
      await state.chatClient.chatInterface.deleteVoiceChannel(getters.currentVirtualServerId, id);
    },
    async initializeAllChatUI(
      {
        commit,
        state,
        dispatch,
        rootState,
      },
    ) {
      if (state.isChatDataInitialized) return;
      const contacts = await state.chatClient.chatInterface.getContacts();
      if (contacts) commit('updateContacts', contacts);

      const chats = await state.chatClient.chatInterface.getAllChats();

      if (chats) {
        commit('updateChats', chats);
        const chatsArray = Object.values(chats).flat();
        const chatHistory = await state.chatClient.chatInterface.getAllHistory(chatsArray);
        if (chatHistory) commit('updateChatHistory', chatHistory);
      }

      const voiceChannels = await state.chatClient.chatInterface.getAllVoiceChannels();
      if (voiceChannels) commit('updateVoiceChannels', voiceChannels);

      const { virtualServers } = rootState.chatData;
      if (Object.values(virtualServers).length) {
        await dispatch('setCurrentVirtualServer', Object.keys(virtualServers)[0]);
      }

      await dispatch('sendUserStatus');
      await dispatch('switchMicrophone');
      commit('setChatDataInitialized', true);
    },
    disconnectContact({ state }, contact) {
      state.chatClient.onContactDisconnect(contact);
    },
    async getHistoryChunk({ commit, state, getters }) {
      const curChat = getters.currentChatId;
      const curServer = getters.currentVirtualServerId;
      const historySize = getters.currentHistorySize;
      try {
        const historyChunk = await state.chatClient.chatInterface
          .getHistory(curServer, curChat, historySize);
        if (!historyChunk || !historyChunk.length) {
          commit('setHistoryLoaded', curChat);
        }
        if (historyChunk) commit('addChatHistoryChunk', historyChunk);
      } catch (e) {
        console.debug('history chunk error ', e);
      }
    },
  },
};
