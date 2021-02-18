<template>
  <b-button variant="info" @click="onClick">
    <b-icon v-if="muted" icon="mic-mute-fill" aria-hidden="true"></b-icon>
    <b-icon v-else icon="mic-fill" aria-hidden="true"></b-icon>
  </b-button>
</template>

<script>
export default {
  name: 'MicrophoneSwitchButton',
  props: {
    user: Object,
  },
  data() {
    return {
      muted: this.$store.getters.chatEngine.microphoneMuted,
    };
  },
  methods: {
    async onClick() {
      await this.$store.dispatch('switchMicrophone');
      this.muted = this.$store.getters.chatEngine.microphoneMuted;
    },
  },
};
</script>
