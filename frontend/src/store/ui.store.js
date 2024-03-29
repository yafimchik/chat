const DEFAULT_STATE = () => ({
  online: false,
  userStatus: undefined, // chat id where user writes a message or undefined
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
      state.userStatus = status;
    },
    clearUnreadMessagesCount(state) {
      const unreadMessages = { ...state.unreadMessages };
      unreadMessages[state.currentChatId] = 0;
      state.unreadMessages = unreadMessages;
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
    postNotification(state, notification) {
      state.notification = { ...notification };
    },
    setAttachedFiles(state, files) {
      if (!(files instanceof Array)) state.attachedFiles = [];
      else state.attachedFiles = [...files];
    },
  },
  getters: {
    unreadMessagesByChatId(state) {
      return (chatId) => state.unreadMessages[chatId];
    },
    currentDraft(state, getters, rootState) {
      return state.draft[rootState.chatData.currentChatId];
    },
    isHistoryFull(state, getters, rootState) {
      return !!state.historyLoaded[rootState.chatData.currentChatId];
    },
  },
};
