<template>
  <div class="row">
    <app-mic :mic-failed="callback"></app-mic>
    <app-play></app-play>
  </div>
</template>

<script>
import Microphone from '@/audio-recorder/components/Microphone.vue';
import Play from '@/audio-recorder/components/Play.vue';

export default {
  name: 'Audio',
  components: {
    appMic: Microphone,
    appPlay: Play,
  },
  data() {
    return {};
  },
  methods: {
    callback(msg) {
      console.debug('debug error: ', msg);
    },
  },
};
</script>
