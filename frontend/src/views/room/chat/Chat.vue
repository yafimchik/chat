<template>
  <section class="mt-4">
    <div class="group-title">Chat</div>
    <div class="chat-wrapper d-flex flex-column align-items-stretch flex-nowrap">
      <app-history class="flex-grow-1 mt-1"></app-history>
      <app-new-message class="mx-1"></app-new-message>
      <app-status class="my-1"></app-status>
    </div>
  </section>
</template>

<script>
import ChatHistory from '@/views/room/chat/components/ChatHistory.vue';
import NewMessageForm from '@/views/room/chat/components/NewMessageForm.vue';
import Status from '@/views/room/chat/components/Status.vue';

export default {
  name: 'Chat',
  components: {
    appHistory: ChatHistory,
    appNewMessage: NewMessageForm,
    appStatus: Status,
  },
};
</script>

<style scoped lang="scss">
.chat-wrapper {
  background-color: rgb(38, 38, 38);
  height: 400px;
  padding: 10px 20px;
  margin-top: 10px;
}
</style>
