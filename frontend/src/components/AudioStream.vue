<template>
    <audio ref="audio" autoplay></audio>
</template>

<script>
export default {
  name: 'AudioStream',
  props: {
    stream: MediaStream,
  },
  data() {
    return {};
  },
  mounted() {
    console.log('stream ', this.stream);
    this.$refs.audio.srcObject = this.stream;
  },
  beforeDestroy() {
    this.$refs.audio.srcObject = undefined;
  },
};
</script>
