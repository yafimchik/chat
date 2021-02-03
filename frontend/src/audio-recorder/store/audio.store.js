import Recorder from '../lib/recorder';

export default {
  state: () => ({
    recorder: undefined,
    currentRecord: undefined,
    isRecording: false,
    isPlaying: false,
    startPlay: '',
    playerSource: '',
    playedTime: '',
    playerDuration: '',
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
      console.log('is playing state ', state.isPlaying);
    },
    setPlayerTime(state, playedTime) {
      state.playedTime = playedTime;
    },
    setPlayerDuration(state, playerDuration) {
      state.playerDuration = playerDuration;
    },
    setPlayerSource(state, source) {
      if (typeof source === 'string') {
        state.playerSource = source.slice();
      } else {
        state.playerSource = source;
      }
    },
    startPlay(state, source) {
      if (typeof source === 'string') {
        state.startPlay = source.slice();
      } else {
        state.startPlay = source;
      }
    },
    stopPlay(state) {
      state.startPlay = undefined;
    },
    startStopPlay(state, source) {
      if (typeof source === 'string') {
        state.startPlay = source.slice();
      } else {
        state.startPlay = source;
      }
    },
  },
  getters: {
    audioSource(state) {
      return state.currentRecord ? state.currentRecord.url : '';
    },
  },
};
