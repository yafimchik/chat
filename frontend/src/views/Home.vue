<template>
  <main class="flex-grow-1 row">
    <div class="col-3">
      <app-chat-list></app-chat-list>
    </div>
    <div class="col-6">
      <app-chat></app-chat>
    </div>
    <div class="col-3">
      <app-user-list></app-user-list>
    </div>
  </main>
</template>

<script>
// @ is an alias to /src
import ChatList from '@/components/chat-list/ChatList.vue';
import Chat from '@/components/chat/Chat.vue';
import UserList from '@/components/user-list/UserList.vue';

export default {
  name: 'Home',
  computed: {
    currentChat() {
      return this.$store.getters.currentChat;
    },
    currentChatHistory() {
      return this.$store.getters.currentChatHistory;
    },
  },
  components: {
    appChatList: ChatList,
    appChat: Chat,
    appUserList: UserList,
  },
  async beforeMount() {
    await this.$store.dispatch('initializeAllChatUI');
  },
};
</script>

<style>
</style>
