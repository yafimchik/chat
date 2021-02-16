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
    this.$refs.audio.srcObject = this.stream;
  },
  beforeDestroy() {
    this.$refs.audio.srcObject = undefined;
  },
};
</script>
