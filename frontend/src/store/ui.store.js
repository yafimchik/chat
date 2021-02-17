const DEFAULT_STATE = () => ({
  online: false,
  userStatus: {
    chat: undefined,
    voiceChannel: undefined,
  },
  draft: {},
  unreadMessages: {},
  historyLoaded: {},
  notification: undefined,
  attachedFiles: [],
});

export default {
  state: DEFAULT_STATE,
  mutations: {
    updateDraft(state, draftText = '') {
      state.draft[state.currentChatId] = draftText.slice();
      state.draft = { ...state.draft };
    },
    deleteDraft(state, chatId) {
      state.draft[chatId] = '';
      state.draft = { ...state.draft };
    },
    updateUserStatus(state, status) {
      if (status) state.userStatus = { ...status };
      else state.userStatus = status;
    },
    updateUserChatStatus(state, chatId) {
      const newUserStatus = { ...state.userStatus };
      newUserStatus.chat = chatId;
      state.userStatus = newUserStatus;
    },
    updateUserVoiceChannelStatus(state, voiceChannelId) {
      const newUserStatus = { ...state.userStatus };
      newUserStatus.voiceChannel = voiceChannelId;
      state.userStatus = newUserStatus;
    },
    setUnreadMessagesCount(state, { count, chat }) {
      const unreadMessages = { ...state.unreadMessages };
      unreadMessages[chat] = count;
      state.unreadMessages = unreadMessages;
    },
    addUnreadMessage(state, chat) {
      const unreadMessages = { ...state.unreadMessages };
      if (unreadMessages[chat]) unreadMessages[chat] += 1;
      else unreadMessages[chat] = 1;
      state.unreadMessages = unreadMessages;
    },
    setToDefaultsAll(state) {
      const newState = DEFAULT_STATE();
      Object.entries(newState).forEach(([key, value]) => {
        state[key] = value;
      });
    },
    setHistoryLoaded(state, chat) {
      const newHistoryLoaded = { ...state.historyLoaded };
      newHistoryLoaded[chat] = true;
      state.historyLoaded = newHistoryLoaded;
    },
    updateLinkStatus(state, isOnline) {
      state.online = isOnline;
    },
    postNotification(state, notification) {
      state.notification = { ...notification };
    },
    setAttachedFiles(state, files) {
      if (!(files instanceof Array)) state.attachedFiles = [];
      else state.attachedFiles = [...files];
    },
  },
  getters: {
    userStatus(state) {
      return state.userStatus;
    },
    isSystemOnline(state) {
      return state.online;
    },
    unreadMessagesByChatId(state) {
      return (chatId) => state.unreadMessages[chatId];
    },
    currentDraft(state, getters) {
      return state.draft[getters.currentChatId];
    },
    isHistoryFull(state, getters) {
      return !!state.historyLoaded[getters.currentChatId];
    },
  },
  actions: {
    clearUnreadMessagesCount({ commit, getters }) {
      const chat = getters.currentChatId;
      const count = 0;
      commit('setUnreadMessagesCount', {
        chat,
        count,
      });
    },
  },
};
