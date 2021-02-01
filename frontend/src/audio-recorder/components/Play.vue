<template>
  <b-button class="play" variant="outline-info" @click="playback" :disabled="!isPlayerReady">
    <b-icon icon="play-fill" scale="1"></b-icon>
    <p>{{ playedTime }}</p>
    <p v-if="!!duration">{{ `/ ${duration}` }}</p>
    <audio
      ref="player"
      :src="audioSource"
      @loadstart="onPlayerLoadStart"
      @ended="onPlayerEnded"
      @loadeddata="onPlayerLoadedData"
      @timeupdate="onPlayerTimeUpdate"
    ></audio>
  </b-button>
</template>

<script>
import { convertTimeMMSS } from '../lib/utils';

export default {
  props: {
    src: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      duration: convertTimeMMSS(0),
      playedTime: convertTimeMMSS(0),
      isPlayerReady: false,
    };
  },
  mounted() {
  },
  beforeDestroy() {
    this.stop();
  },
  computed: {
    audioSource() {
      if (this.src) return this.src;
      const url = this.$store.getters.audioSource;
      if (url) {
        return url;
      }
      this._resetProgress();
      return '';
    },
    isPlaying() {
      return this.$store.state.audio.isPlaying;
    },
  },
  methods: {
    onPlayerLoadStart() {
      this.isPlayerReady = false;
    },
    onPlayerEnded() {
      this.$store.commit('setPlayerState', false);
    },
    onPlayerLoadedData() {
      this.isPlayerReady = true;
      this._resetProgress();
      this.duration = convertTimeMMSS(this.$refs.player.duration);
    },
    onPlayerTimeUpdate() {
      this.playedTime = convertTimeMMSS(this.$refs.player.currentTime);
    },
    playback() {
      if (!this.audioSource) {
        return;
      }

      if (this.isPlaying) {
        this.stop();
      } else {
        setTimeout(() => {
          this.play();
        }, 0);
      }
    },
    play() {
      this.$refs.player.load();
      this.$store.commit('setPlayerState', false);
    },
    stop() {
      this.$store.commit('setPlayerState', true);
      this.$refs.player.play();
    },
    _resetProgress() {
      if (this.isPlaying) {
        this.$refs.player.load();
      }

      this.duration = convertTimeMMSS(0);
      this.playedTime = convertTimeMMSS(0);
      this.$store.commit('setPlayerState', false);
    },
  },
};
</script>

<style scoped>
button > p {
  margin-bottom: 0;
}
</style>
