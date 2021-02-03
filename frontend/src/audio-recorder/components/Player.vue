<template>
  <audio
    ref="player"
    @ended="onPlayerEnded"
    @loadeddata="onPlayerLoadedData"
    @timeupdate="onPlayerTimeUpdate"
    @play="onPlayerPlay"
  ></audio>
</template>

<script>
import { convertTimeMMSS } from '../lib/utils';

export default {
  data() {
    return {
      subscribes: [],
      isPlaying: false,
      duration: convertTimeMMSS(0),
      playedTime: convertTimeMMSS(0),
    };
  },
  mounted() {
    this.subscribes.push(this.$store.subscribe((mutation) => {
      if (mutation.type === 'startStopPlay') {
        this.onStartStop();
      } else if (mutation.type === 'startPlay') {
        this.onStart();
      } else if (mutation.type === 'stopPlay') {
        this.onStop();
      } else {
        return;
      }
      console.log(mutation.type);
    }));
  },
  beforeDestroy() {
    if (this.isPlaying) {
      this.stop();
    }
    this.resetProgress();
    this.subscribes.forEach((unsubscribe) => {
      unsubscribe();
    });
  },
  computed: {
    newSource() {
      return this.$store.state.audio.startPlay;
    },
  },
  methods: {
    getSource() {
      if (this.$refs.player) return this.$refs.player.src;
      return undefined;
    },
    setSource(value) {
      if (this.$refs.player) this.$refs.player.src = value;
    },
    onStartStop() {
      console.log('on start stop ', this.newSource);
      if (!this.newSource) {
        this.onStop();
        return;
      }
      if (this.newSource !== this.getSource()) {
        this.onStart();
        return;
      }
      if (this.isPlaying) {
        this.onStop();
      } else {
        this.onStart();
      }
    },
    onStart() {
      if (!this.getSource() && !this.newSource) return;
      console.log('on start ', this.newSource);

      if (this.newSource !== this.getSource()) {
        this.setSource(this.newSource);
        console.log('source', this.$refs.player.src);
        this.$store.commit('setPlayerSource', this.getSource());
        this.play();
      } else if (!this.isPlaying) {
        this.play();
      }
    },
    onStop() {
      console.log('on stop ', this.newSource);
      this.stop();
    },
    onPlayerPlay() {
      console.log('on play ');
      if (this.isPlaying) return;
      this.isPlaying = true;
      this.$store.commit('setPlayerState', this.isPlaying);
    },
    onPlayerEnded() {
      console.log('on end');
      this.isPlaying = false;
      this.$store.commit('setPlayerState', this.isPlaying);
      this.playedTime = convertTimeMMSS(0);
      this.$store.commit('setPlayerTime', this.playedTime);
    },
    onPlayerLoadedData() {
      console.log('on loaded');
      if (!this.$refs.player) return;
      this.resetProgress();
      this.duration = convertTimeMMSS(this.$refs.player.duration);
      this.$store.commit('setPlayerDuration', this.duration);
    },
    onPlayerTimeUpdate() {
      if (!this.$refs.player) return;
      this.playedTime = convertTimeMMSS(this.$refs.player.currentTime);
      this.$store.commit('setPlayerTime', this.playedTime);
    },
    stop() {
      console.log('stop');
      this.setSource(undefined);
      this.$store.commit('setPlayerState', false);
      // this.$refs.player.load();
    },
    play() {
      console.log('play ', this.$refs.player.src);
      if (this.getSource()) this.$refs.player.play();
    },
    resetProgress() {
      this.duration = convertTimeMMSS(0);
      this.playedTime = convertTimeMMSS(0);
      this.$store.commit('setPlayerDuration', this.duration);
      this.$store.commit('setPlayerTime', this.playedTime);
    },
  },
};
</script>
