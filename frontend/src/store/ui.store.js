import { APPLICATION_MAIN_TITLE } from '@/configs/view.config';

const DEFAULT_STATE = () => ({
  mainTitle: APPLICATION_MAIN_TITLE,
  online: false,
  userStatus: {
    chat: undefined,
    voiceChannel: undefined,
    muted: true,
  },
  draft: {},
  unreadMessages: {},
  historyLoaded: {},
  notification: undefined,
  attachedFiles: [],
  footerLinks: {
    home: [],
    room: [],
  },
  currentRoute: undefined,
});

export default {
  state: DEFAULT_STATE,
  mutations: {
    pushRoute(state, route) {
      state.currentRoute = route;
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
    updateUserMutedStatus(state, muted) {
      const newUserStatus = { ...state.userStatus };
      newUserStatus.muted = muted;
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
    isChatOpened(state) {
      if (!state.currentRoute) return false;
      return state.currentRoute.name === 'chat';
    },
    currentRoute(state) {
      return state.currentRoute;
    },
    mainTitle(state) {
      return state.mainTitle;
    },
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
      commit('setUnreadMessagesCount', { chat: getters.currentChatId, count: 0 });
    },
  },
};
