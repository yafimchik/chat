<template>
  <main class="flex-grow-1 row">
    <div class="col-3 p-2 list-column">
      <app-chat-list class="chat-list-block"></app-chat-list>
      <app-voice-channel-list class="voice-channel-list-block"></app-voice-channel-list>
    </div>
    <div class="col-7 p-2">
      <router-view/>
    </div>
    <div class="col-2 p-2">
      <app-user-list></app-user-list>
    </div>
  </main>
</template>

<script>
import ChatList from '@/components/chat-list/ChatList.vue';
import UserList from '@/components/user-list/UserList.vue';
import VoiceChannelList from '@/components/voice-channel-list/VoiceChannelList.vue';

export default {
  name: 'Home',
  components: {
    appChatList: ChatList,
    appUserList: UserList,
    appVoiceChannelList: VoiceChannelList,
  },
  async beforeMount() {
    await this.$store.dispatch('initializeAllChatUI');
  },
};
</script>

<style scoped lang="scss">
div.list-column {
  .chat-list-block,
  .voice-channel-list-block {
    height: 50%;
    width: 100%;
  }
}
</style>
