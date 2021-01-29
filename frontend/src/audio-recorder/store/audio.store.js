import Recorder from '../lib/recorder';

export default {
  state: () => ({
    recorder: undefined,
    currentRecord: undefined,
    isRecording: false,
    isPlaying: false,
  }),
  mutations: {
    initRecorder(state, options) {
      state.recorder = new Recorder(options);
    },
    saveRecord(state, record) {
      state.currentRecord = record;
    },
    setRecorderState(state, isRecording) {
      state.isRecording = isRecording;
    },
    setPlayerState(state, isPlaying) {
      state.isPlaying = isPlaying;
    },
  },
  actions: {},
  getters: {
    audioSource(state) {
      return state.currentRecord ? state.currentRecord.url : '';
    },
  },
};
