const DEFAULT_STATE = () => ({
  status: {},
  userStatus: {
    chat: undefined,
    voiceChannel: undefined,
    muted: true,
  },
});

export default {
  state: DEFAULT_STATE,
  mutations: {
    updateStatus(state, { virtualServer, status }) {
      const newStatus = { ...state.status };
      newStatus[virtualServer] = status;
      state.status = { ...newStatus };
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
    setToDefaultsAll(state) {
      const newState = DEFAULT_STATE();
      Object.entries(newState).forEach(([key, value]) => {
        state[key] = value;
      });
    },
  },
  getters: {
    currentChatStatus(state, getters) {
      const status = getters.currentVirtualServerStatus
        .filter((userStatus) => userStatus.value.chat === getters.currentChatId)
        .map((userStatus) => userStatus.user);
      return status;
    },
    currentVirtualServerStatus(state, getters) {
      if (!state.status[getters.currentVirtualServerId]) return [];
      return state.status[getters.currentVirtualServerId];
    },
    userStatus(state) {
      return state.userStatus;
    },
  },
  actions: {
    async updateStatus({ commit, dispatch, getters }, { virtualServer, status }) {
      commit('updateStatus', { virtualServer, status });

      const userStatus = status.find((item) => item.user === getters.user._id);
      if (userStatus && userStatus.value) {
        await dispatch('setCurrentVoiceChannel', userStatus.value.voiceChannel);
      }

      const contactsInVoiceChannel = status
        .filter((item) => item.value.voiceChannel === userStatus.value.voiceChannel)
        .map((item) => item.user);

      await dispatch('updateStreamsByContactsOnline', contactsInVoiceChannel);
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
  },
};
