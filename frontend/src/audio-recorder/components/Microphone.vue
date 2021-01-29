<template>
  <b-button class="mic" variant="outline-info" @click="toggleRecorder">
    <b-icon icon="mic-fill" scale="1" :animation="buttonEffect"></b-icon>
    <p>{{ recordedTime }}</p>
    <p v-if="!!formattedLimitTime">{{ '/ ' + formattedLimitTime }}</p>
  </b-button>
</template>

<script>
import { convertTimeMMSS } from '../lib/utils';

export default {
  props: {
    format: { type: String, default: 'mp3' },
    timeLimit: { type: Number, default: 2 },
    bitRate: { type: Number, default: 128 },
    sampleRate: { type: Number, default: 44100 },
    micFailed: { type: Function },
  },
  data() {
    return {
      isUploading: false,
      currentRecord: null,
    };
  },
  beforeMount() {
    this.initRecorder();
  },
  beforeDestroy() {
    this.stopRecorder();
  },
  methods: {
    toggleRecorder() {
      if (this.isRecording) {
        this.stopRecorder();
      } else {
        this.startRecorder();
      }
    },
    startRecorder() {
      if (this.isRecording) return;
      this.$store.commit('saveRecord', null);
      this.recorder.start();
      this.$store.commit('setRecorderState', this.isRecording);
    },
    stopRecorder() {
      if (!this.isRecording) {
        return;
      }
      this.recorder.stop();
      this.$store.commit('saveRecord', this.recorder.record);
      this.$store.commit('setRecorderState', this.isRecording);
    },
    removeRecord() {
      this.record = undefined;
    },
    initRecorder() {
      this.$store.commit('initRecorder', {
        micFailed: this.micFailed,
        bitRate: this.bitRate,
        sampleRate: this.sampleRate,
        format: this.format,
      });
    },
  },
  computed: {
    recorder() {
      return this.$store.state.audio.recorder;
    },
    isPause() {
      return this.recorder.isPause;
    },
    buttonEffect() {
      return this.isRecording ? 'fade' : '';
    },
    isRecording() {
      return this.recorder.isRecording;
    },
    duration() {
      return this.recorder.duration;
    },
    recordedTime() {
      if (this.timeLimit && this.duration >= this.timeLimit * 60) {
        this.stopRecorder();
      }
      return convertTimeMMSS(this.duration);
    },
    formattedLimitTime() {
      if (!this.timeLimit) {
        return '';
      }
      return convertTimeMMSS(this.timeLimit * 60);
    },
  },
};
</script>

<style scoped>
button > p {
  margin-bottom: 0;
}
</style>
