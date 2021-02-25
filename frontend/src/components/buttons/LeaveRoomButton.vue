<template>
  <button title="Leave current room" @click="onClick">
    <img src="/img/leave.svg" width="24" height="24">
    <div>Leave</div>
  </button>
</template>

<script>
export default {
  name: 'LeaveRoomButton',
  data() {
    return {};
  },
  methods: {
    async onClick() {
      await this.$store.dispatch('disconnectFromVoiceChannel');
      await this.$router.push({ name: 'home' });
    },
  },
};
</script>
