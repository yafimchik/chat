<template>
  <div class="row">
    <p>{{ size }}</p>
    <b-button class="mx-1" variant="info" :disabled="!downloadLink" @click="download">
      <p class="mr-1">Download</p>
      <b-icon icon="soundwave" scale="1"></b-icon>
    </b-button>
    <app-play v-if="!!downloadLink" :src="downloadLink"></app-play>
  </div>
</template>

<script>
import Play from '@/audio-recorder/components/Play.vue';
import { apiUrl } from '@/configs/chat-connection.config';

export default {
  name: 'Audio',
  components: {
    appPlay: Play,
  },
  props: {
    audio: { type: Object },
  },
  data() {
    return {
      downloadLink: undefined,
    };
  },
  methods: {
    download() {
      this.downloadLink = `${apiUrl}/audios/${this.audio._id}`;
    },
  },
  computed: {
    size() {
      return `size: ${Math.round(this.audio.size * 10 / 1024 / 1024) / 10} Mb` ;
    },
  },
};
</script>
