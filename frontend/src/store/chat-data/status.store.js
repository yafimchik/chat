import { VOICE_CHANNEL_USER_ROLES } from '@/chat-engine-client/chat-engine.client.constants';

const DEFAULT_STATE = () => ({
  status: {},
  userStatus: {
    chat: undefined,
    voiceChannel: undefined,
    muted: false,
    role: VOICE_CHANNEL_USER_ROLES.listener,
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
    updateUserRoleStatus(state, role) {
      const newUserStatus = { ...state.userStatus };
      newUserStatus.role = role;
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
    currentUserMutedStatus(state) {
      return state.userStatus.muted;
    },
    userRole(state) {
      if (!state.userStatus.role) return VOICE_CHANNEL_USER_ROLES.listener;
      return state.userStatus.role;
    },
    isSpeaker(state, getters) {
      return getters.userRole === VOICE_CHANNEL_USER_ROLES.speaker;
    },
    getMutedByUserId(state, getters) {
      return (userId) => {
        const status = getters.currentVirtualServerStatus.find((item) => item.user === userId);
        if (!status || !status.value || status.value.muted === undefined) return true;
        return status.value.muted;
      };
    },
    getRoleByUserId(state, getters) {
      return (userId) => {
        const status = getters.currentVirtualServerStatus.find((item) => item.user === userId);
        if (!status || !status.value || !status.value.role) {
          return VOICE_CHANNEL_USER_ROLES.listener;
        }
        return status.value.role;
      };
    },
    speakers(state, getters) {
      return getters.currentVirtualServerStatus
        .filter(
          (userStatus) => userStatus.value
            && userStatus.value.voiceChannel === getters.currentVoiceChannelId,
        )
        .filter(
          (userStatus) => userStatus.value.role === VOICE_CHANNEL_USER_ROLES.speaker,
        )
        .map((userStatus) => userStatus.user)
        .map((id) => getters.userById(id));
    },
    listeners(state, getters) {
      return getters.currentVirtualServerStatus
        .filter(
          (userStatus) => userStatus.value
            && userStatus.value.voiceChannel === getters.currentVoiceChannelId,
        )
        .filter(
          (userStatus) => userStatus.value.role === VOICE_CHANNEL_USER_ROLES.listener,
        )
        .map((userStatus) => userStatus.user)
        .map((id) => getters.userById(id));
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
    async updateUserMutedStatus({ commit, dispatch }, muted) {
      commit('updateUserMutedStatus', muted);
      await dispatch('sendUserStatus');
    },
    async updateUserStatus({ commit, dispatch }, newStatus) {
      commit('updateUserStatus', newStatus);
      await dispatch('sendUserStatus');
    },
    async updateUserRole({ commit, dispatch }, role) {
      commit('updateUserRoleStatus', role);
      await dispatch('sendUserStatus');
    },
    async setUserRoleToDefault({ commit, dispatch }) {
      commit('updateUserRoleStatus', VOICE_CHANNEL_USER_ROLES.listener);
      await dispatch('sendUserStatus');
    },
  },
};
