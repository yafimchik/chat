<template>
  <b-list-group-item button @click="onClick" :active="isActive">
    <p >{{ chat.name }}</p>
    <b-badge
      v-if="!!unreadMessages"
      :variant="isActive ? 'light' : 'primary'"
      pill
    >
      {{ unreadMessages }}
    </b-badge>
  </b-list-group-item>
</template>

<script>
export default {
  name: 'ChatName',
  props: {
    chatObject: Object,
  },
  data() {
    return {
      chat: this.chatObject,
    };
  },
  computed: {
    isActive() {
      return (this.chat._id === this.$store.state.chatData.currentChatId);
    },
    unreadMessages() {
      return this.$store.getters.unreadMessagesByChatId(this.chat._id);
    },
  },
  methods: {
    async onClick() {
      await this.$store.dispatch('setCurrentChat', this.chat._id);
      if (this.$router.currentRoute.name !== 'chat') {
        await this.$router.push({ name: 'chat' });
      }
    },
  },
};
</script>

<style scoped lang="scss">

</style>
