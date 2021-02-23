const DEFAULT_STATE = () => ({
  voiceChannels: {},
  currentVoiceChannelId: undefined,
  inputStreams: [],
  contactVoiceStates: {},
});

export default {
  state: DEFAULT_STATE,
  mutations: {
    setContactVoiceState(state, { contact, value }) {
      const newVoiceStates = { ...state.contactVoiceStates };
      newVoiceStates[contact] = value;
      state.contactVoiceStates = newVoiceStates;
    },
    setCurrentVoiceChannel(state, voiceChannelId) {
      if (voiceChannelId) state.currentVoiceChannelId = voiceChannelId.slice();
      state.currentVoiceChannelId = voiceChannelId;
    },
    updateVoiceChannels(state, voiceChannels) {
      state.voiceChannels = { ...voiceChannels };
    },
    addVoiceChannel(state, { virtualServer, voiceChannel }) {
      const newVoiceChannels = { ...state.voiceChannels };
      if (!newVoiceChannels[virtualServer]) newVoiceChannels[virtualServer] = [];
      newVoiceChannels[virtualServer].push(voiceChannel);
      state.voiceChannels = newVoiceChannels;
    },
    setToDefaultsAll(state) {
      const newState = DEFAULT_STATE();
      Object.entries(newState).forEach(([key, value]) => {
        state[key] = value;
      });
    },
    setContactStream(state, { contact, stream }) {
      const newStreams = [...state.inputStreams];
      const currentStream = newStreams.find((inputStream) => inputStream.contact === contact);
      if (currentStream) {
        currentStream.stream = stream;
      } else {
        newStreams.push({ contact, stream });
      }
      state.inputStreams = newStreams;
      console.log('input streams ', state.inputStreams);
    },
    deleteContactStream(state, contact) {
      const newStreams = [...state.inputStreams];
      const contactStreamIndex = newStreams
        .findIndex((inputStream) => inputStream.contact === contact);
      if (contactStreamIndex !== -1) newStreams.splice(contactStreamIndex, 1);
      state.inputStreams = newStreams;
    },
  },
  getters: {
    speakers(state, getters) {
      return getters.currentVirtualServerStatus
        .filter(
          (userStatus) => userStatus.value
            && userStatus.value.voiceChannel === getters.currentVoiceChannelId,
        )
        .filter(
          (userStatus) => !userStatus.value.muted,
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
          (userStatus) => userStatus.value.muted,
        )
        .map((userStatus) => userStatus.user)
        .map((id) => getters.userById(id));
    },
    freeUsers(state, getters) {
      const notFreeUsers = getters.currentVirtualServerStatus
        .filter((status) => status.value && status.value.voiceChannel)
        .map((status) => status.user);
      const allUsers = getters.contactsOnlineOfCurrentServer;
      if (!allUsers) return [];
      return allUsers.filter((user) => !notFreeUsers.some((id) => id === user._id));
    },
    getContactVoiceState(state) {
      return (contact) => !!state.contactVoiceStates[contact];
    },
    currentVoiceChannelId(state) {
      return state.currentVoiceChannelId;
    },
    contactsWithStreams(state) {
      return state.inputStreams;
    },
    activeStreams(state) {
      return state.inputStreams.map((inputStream) => inputStream.stream);
    },
    voiceChannelsByCurrentVirtualServer(state, getters) {
      const virtualServerId = getters.currentVirtualServerId;
      if (!virtualServerId) return [];
      const result = state.voiceChannels[virtualServerId];
      if (!result) return [];
      return result;
    },
    currentVoiceChannel(state, getters) {
      const curVC = state.voiceChannels[getters.currentVirtualServerId]
        .find((voiceChannel) => voiceChannel._id === state.currentVoiceChannelId);
      if (!curVC) return curVC;
      return { ...curVC };
    },
    voiceChannelStatus(state, getters) {
      return (voiceChannelId) => {
        let status = getters.currentVirtualServerStatus;
        if (!status) return [];
        status = status
          .filter((userStatus) => userStatus.value.voiceChannel === voiceChannelId)
          .map((userStatus) => userStatus.user);
        return status;
      };
    },
    currentVoiceChannelStatus(state, getters) {
      return getters.voiceChannelStatus(getters.currentVirtualServerId);
    },
    getVoiceChannelContacts(state, getters) {
      return (voiceChannel) => getters.currentVirtualServerStatus
        .filter(
          (userStatus) => userStatus.value && userStatus.value.voiceChannel === voiceChannel,
        )
        .map((userStatus) => userStatus.user)
        .map((id) => getters.userById(id));
    },
  },
  actions: {
    async setCurrentVoiceChannel({ commit }, voiceChannelId) {
      commit('setCurrentVoiceChannel', voiceChannelId);
    },
    async updateStreamsByContactsOnline({ state, dispatch }, contactsOnline) {
      if (!state.inputStreams.length) return;
      const disconnectedStreams = state.inputStreams
        .filter((inputStream) => !contactsOnline.includes(inputStream.contact));

      state.inputStreams = state.inputStreams
        .filter((inputStream) => contactsOnline.includes(inputStream.contact));

      await Promise.all(disconnectedStreams.map(
        (disconnectedStream) => dispatch('disconnectContact', disconnectedStream.contact),
      ));
    },
  },
};
