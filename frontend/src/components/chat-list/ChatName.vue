<template>
  <b-list-group-item button @click="onClick" :active="isActive"
                     class="d-flex flex-row justify-content-center align-items-center"
  >
    <p class="m-0">{{ chat.name }}</p>
    <b-badge
      v-if="!!unreadMessages"
      :variant="isActive ? 'light' : 'primary'"
      pill
      class="ml-2"
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
      if (this.$route.name !== 'chat') {
        await this.$router.push({ name: 'chat' });
      }
    },
  },
};
</script>

<style scoped lang="scss">

</style>
