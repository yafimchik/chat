import { APPLICATION_MAIN_TITLE } from '@/configs/view.config';

const DEFAULT_STATE = () => ({
  mainTitle: APPLICATION_MAIN_TITLE,
  online: false,
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
  previousRoute: undefined,
});

export default {
  state: DEFAULT_STATE,
  mutations: {
    pushRoute(state, route) {
      state.previousRoute = { ...state.currentRoute };
      state.currentRoute = { ...route };
    },
    updateDraft(state, draftText = '') {
      state.draft[state.currentChatId] = draftText.slice();
      state.draft = { ...state.draft };
    },
    deleteDraft(state, chatId) {
      state.draft[chatId] = '';
      state.draft = { ...state.draft };
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
    isRoomOpened(state) {
      if (!state.currentRoute) return false;
      return state.currentRoute.name === 'chat' || state.currentRoute.name === 'room';
    },
    currentRoute(state) {
      return !state.currentRoute ? state.currentRoute : { ...state.currentRoute };
    },
    previousRoute(state) {
      return !state.previousRoute ? state.previousRoute : { ...state.previousRoute };
    },
    mainTitle(state) {
      return state.mainTitle;
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
