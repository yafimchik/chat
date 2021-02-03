<template>
  <div class="d-flex flex-row-reverse">
    <b-button
      class="mt-1 d-flex flex-row align-items-center justify-content-center"
      variant="info"
      @click="download"
    >
      <p class="mb-0" v-if="!isOnPlayer">{{ size }} Mb</p>
      <p class="mb-0" v-if="isOnPlayer">{{ playedTime }} / {{ audio.duration }}</p>
      <b-icon class="ml-2" icon="soundwave" scale="2"></b-icon>
    </b-button>
  </div>
</template>

<script>
import { apiUrl } from '@/configs/chat-connection.config';
import mime from 'mime-types';

export default {
  name: 'Audio',
  props: {
    audio: { type: Object },
  },
  data() {
    return {
      downloadLink: undefined,
    };
  },
  methods: {
    async download() {
      console.log('audio', this.$store.state.audio);
      if (this.downloadLink) {
        this.$store.commit('startStopPlay', this.downloadLink);
        return;
      }
      try {
        const response = await fetch(`${apiUrl}/audios/${this.audio._id}`, {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        });
        let buffer;
        if (response.ok) buffer = await response.arrayBuffer();
        if (buffer) {
          const dataView = new DataView(buffer);
          const blob = new Blob([dataView], { type: mime.lookup(this.audio.type) });
          this.downloadLink = URL.createObjectURL(blob);
        }
        this.$store.commit('startPlay', this.downloadLink);
      } catch (e) {
        this.$store.commit('postNotification', {
          error: true,
          message: 'Audio download error!',
        });
      }
    },
  },
  beforeDestroy() {
    if (this.isOnPlayer) {
      this.$store.commit('stopPlay');
    }
    window.URL.revokeObjectURL(this.downloadLink);
  },
  computed: {
    playerSource() {
      return this.$store.state.audio.playerSource;
    },
    isOnPlayer() {
      if (!this.downloadLink) return false;
      return (this.downloadLink === this.playerSource);
    },
    playedTime() {
      return this.$store.state.audio.playedTime;
    },
    token() {
      return this.$store.state.chatData.token;
    },
    size() {
      return Math.round((this.audio.size * 100) / 1024 / 1024) / 100;
    },
  },
};
</script>
