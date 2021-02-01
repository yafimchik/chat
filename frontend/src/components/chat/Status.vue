<template>
  <section class="status">
    <b-alert :show="isActive" variant="warning">{{ statusString }}</b-alert>
  </section>
</template>

<script>
export default {
  name: 'Status',
  data() {
    return {
    };
  },
  computed: {
    isActive() {
      return !!this.statusArray.length;
    },
    statusArray() {
      const statusArray = this.$store.getters.currentVirtualServerStatus;
      if (!statusArray) return [];
      return statusArray
        .filter((status) => status.value === this.chat && status.user !== this.user);
    },
    statusString() {
      if (!this.statusArray.length) return '';
      const names = this.statusArray
        .map((status) => this.$store.getters.usernameById(status.user))
        .filter((name) => name);

      if (!names) return '';
      const many = names.length > 1;
      return `${names.join(', ')} ${many ? 'are writing' : 'is writing'} now. . .`;
    },
    chat() {
      return this.$store.state.chatData.currentChatId;
    },
    user() { // eslint-disable-next-line
      return this.$store.state.chatData.user._id;
    },
  },
};
</script>

<style scoped lang="scss">
section.status {
  margin: 10px;
}
</style>
