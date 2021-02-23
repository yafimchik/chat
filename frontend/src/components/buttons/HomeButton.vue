<template>
  <button class="avatar-button" @click="onClick">
    <img class="avatar" src="https://icons.iconarchive.com/icons/graphicloads/100-flat/256/home-icon.png"
         alt="avatar">
  </button>
</template>

<script>
export default {
  name: 'HomeButton',
  data() {
    return {};
  },
  methods: {
    async onClick() {
      await this.$router.push({ name: 'home' });
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
