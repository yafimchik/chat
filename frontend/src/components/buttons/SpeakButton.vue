<template>
  <div class="m-2">
    <button class="avatar-button" @click="onClick">
      <img class="avatar"
           :src="imgSource"
           alt="avatar">
    </button>
  </div>
</template>

<script>
export default {
  name: 'SpeakButton',
  data() {
    return {
      muted: this.$store.getters.chatEngine.microphoneMuted,
    };
  },
  computed: {
    imgSource() {
      return this.muted ? '/img/speak.png' : '/img/not-speak.png';
    },
  },
  methods: {
    async onClick() {
      await this.$store.dispatch('switchMicrophone');
      this.muted = this.$store.getters.chatEngine.microphoneMuted;
    },
  },
};
</script>

<style scoped lang="scss">
img {
  background-color: rgba(255, 255, 255, 0.3);
  padding: 5px;
}
</style>
