import ChatEngineClient from '../chat-engine-client/chat-engine.client';

const DEFAULT_STATE = () => ({
  chatClient: undefined,
});

export default {
  state: DEFAULT_STATE,
  mutations: {
    createChatEngine(state, { apiUrl, onUpdateCallback }) {
      state.chatClient = new ChatEngineClient(apiUrl, onUpdateCallback);
    },
    setToDefaultsAll(state) {
      const newState = DEFAULT_STATE();
      Object.entries(newState).forEach(([key, value]) => {
        state[key] = value;
      });
    },
  },
  actions: {
    async updateUserChatStatus({ commit, state, rootState }, chatId) {
      commit('updateUserChatStatus', chatId);
      state.chatClient.sendStatus(
        rootState.chatData.currentVirtualServerId,
        rootState.ui.userStatus,
      );
    },
    async updateUserVoiceChannelStatus({ commit, state, rootState }, voiceChannelId) {
      commit('updateUserVoiceChannelStatus', voiceChannelId);
      state.chatClient.sendStatus(
        rootState.chatData.currentVirtualServerId,
        rootState.ui.userStatus,
      );
    },
    async updateUserStatus({ commit, state, rootState }, newStatus) {
      commit('updateUserStatus', newStatus);
      state.chatClient.sendStatus(
        rootState.chatData.currentVirtualServerId,
        rootState.ui.userStatus,
      );
    },
    async logout({ commit, state }) {
      const result = await state.chatClient.disconnect();
      if (result) {
        commit('setToDefaultsAll');
      }
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

      const { virtualServers } = rootState.chatData;
      if (Object.values(virtualServers).length) {
        dispatch('setCurrentVirtualServer', Object.keys(virtualServers)[0]);
      }
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
