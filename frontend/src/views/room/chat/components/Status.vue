<template>
  <section class="status my-2">
    <p class="text-bright">{{ statusString }}</p>
<!--    <b-alert :show="isActive" variant="info">{{ statusString }}</b-alert>-->
  </section>
</template>

<script>
export default {
  name: 'Status',
  computed: {
    isActive() {
      return !!this.statusArray.length;
    },
    statusArray() {
      return this.$store.getters.currentChatStatus.filter((userId) => userId !== this.userId);
    },
    statusString() {
      if (!this.statusArray.length) return '';
      const names = this.statusArray
        .map((userId) => this.$store.getters.usernameById(userId))
        .filter((name) => name);

      if (!names || !names.length) return '';
      const many = names.length > 1;
      return `${names.join(', ')} ${many ? 'are writing' : 'is writing'} now. . .`;
    },
    userId() {
      return this.$store.getters.user._id;
    },
  },
};
</script>

<style scoped lang="scss">
.status {
  p {
    height: 20px;
  }
}
</style>
