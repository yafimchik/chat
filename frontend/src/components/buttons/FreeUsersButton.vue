<template>
  <button class="avatar-button" @click="onClick">
    <img class="avatar"
         src="https://simg.nicepng.com/png/small/128-1280406_view-user-icon-png-user-circle-icon-png.png"
         alt="avatar">
  </button>
</template>

<script>
export default {
  name: 'FreeUsersButton',
  data() {
    return {};
  },
  methods: {
    async onClick() {
      await this.$router.push({ name: 'freeUsers' });
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
