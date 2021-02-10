<template>
  <section class="status my-2">
    <b-alert :show="isActive" variant="info">{{ statusString }}</b-alert>
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
    chat() {
      return this.$store.state.chatData.currentChatId;
    },
    userId() {
      return this.$store.state.chatData.user._id;
    },
  },
};
</script>
