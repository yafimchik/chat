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
    currentVoiceChannel(state) {
      const voiceChannel = state.voiceChannels[state.currentVoiceChannelId];
      return { ...voiceChannel };
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
        .map((userStatus) => userStatus.user);
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
