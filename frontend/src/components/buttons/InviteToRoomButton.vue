<template>
  <button title="Invite users to room" @click="onClick">
    <img src="img/invite.svg" width="24" height="24">
    <div>Invite</div>
  </button>
</template>

<script>
export default {
  name: 'InviteToRoomButton',
  data() {
    return {};
  },
  methods: {
    async onClick() {
      await this.$router.push({ name: 'inviteToRoom' });
    },
  },
};
</script>

<style scoped lang="scss">
.avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
}

.avatar-button {
  background-color: transparent;
  background-image: none;
  padding-left: 9px;
  padding-right: 9px;
  border: none;
}

</style>
