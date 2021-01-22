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
      return (this.chat._id === this.$store.state.currentChatId);
    },
    unreadMessages() {
      return this.$store.getters.unreadMessagesByChatId(this.chat._id);
    },
  },
  methods: {
    onClick() {
      this.$store.commit('setCurrentChat', this.chat._id);
      // TODO active status (from $store)
    },
  },
};
</script>

<style scoped lang="scss">

</style>
