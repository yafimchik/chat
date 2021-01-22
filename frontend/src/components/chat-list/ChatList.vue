<template>
  <div class="chat-list">
    <b-list-group>
      <app-chat-name v-for="chat in chats" :chatObject="chat" :key="chat._id"></app-chat-name>
    </b-list-group>
  </div>
</template>

<script>
import ChatName from '@/components/chat-list/ChatName.vue';

export default {
  name: 'ChatList',
  data() {
    return {
    };
  },
  computed: {
    chats() {
      return this.$store.getters.chatsByCurrentVirtualServer;
    },
  },
  components: {
    appChatName: ChatName,
  },
};
</script>

<style scoped lang="scss">

</style>
