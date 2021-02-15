<template>
  <div class="contact">
    <app-user-name
      :user="user"
      :key="index"
    ></app-user-name>
    <audio ref="audio" autoplay></audio>
  </div>
</template>

<script>
import UserName from '@/components/user-list/UserName.vue';

export default {
  name: 'ChatName',
  components: {
    appUserName: UserName,
  },
  props: {
    user: Object,
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

<style scoped lang="scss">

</style>
