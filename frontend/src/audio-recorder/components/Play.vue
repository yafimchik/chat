<template>
  <b-button class="play" variant="outline-info" @click="onPlay" :disabled="!downloadLink">
    <b-icon :icon="icon" scale="1"></b-icon>
    <p v-if="downloadLink">{{ playedTime }}</p>
    <p v-if="downloadLink">{{ `/ ${duration}` }}</p>
  </b-button>
</template>

<script>
import { convertTimeMMSS } from '../lib/utils';

export default {
  props: {
    icon: {
      type: String,
      default: 'play-fill',
    },
  },
  data() {
    return {
    };
  },
  async beforeDestroy() {
    if (this.isOnPlayer) {
      this.$store.commit('stopPlay');
    }
  },
  computed: {
    playerSource() {
      return this.$store.state.audio.playerSource;
    },
    isOnPlayer() {
      if (!this.downloadLink) return false;
      return (this.downloadLink === this.playerSource);
    },
    downloadLink() {
      if (!this.$store.state.audio.currentRecord) return undefined;
      return this.$store.state.audio.currentRecord.url;
    },
    playedTime() {
      if (!this.isOnPlayer) return convertTimeMMSS(0);
      return this.$store.state.audio.playedTime;
    },
    duration() {
      if (this.downloadLink) return this.$store.state.audio.currentRecord.duration;
      return convertTimeMMSS(0);
    },
  },
  methods: {
    onPlay() {
      if (!this.downloadLink) return;
      this.$store.commit('startStopPlay', this.downloadLink);
    },
  },
};
</script>

<style scoped>
button > p {
  margin-bottom: 0;
}
</style>
