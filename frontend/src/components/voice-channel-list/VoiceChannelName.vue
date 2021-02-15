<template>
  <b-list-group-item button @click="onClick" :active="isActive">
    <p >{{ voiceChannel.name }}</p>
    <audio ref="inputStream" autoplay></audio>
  </b-list-group-item>
</template>

<script>
export default {
  name: 'VoiceChannelName',
  props: {
    voiceChannel: Object,
  },
  data() {
    return {};
  },
  computed: {
    isActive() {
      return (this.voiceChannel._id === this.$store.getters.currentVoiceChannelId);
    },
    stream() {
      console.log('audio stream ', this.$store.getters.firstStream);
      return this.$store.getters.firstStream;
    },
  },
  watch: {
    stream(value) {
      this.$refs.inputStream.srcObject = value;
    },
  },
  methods: {
    onClick() {
      this.$store.dispatch('connectToVoiceChannel', this.voiceChannel._id);
    },
  },
};
</script>

<style scoped lang="scss">

</style>
