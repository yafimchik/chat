<template>
  <section class="chat d-flex flex-column h-100">
    <app-history></app-history>
    <app-status></app-status>
    <app-new-message></app-new-message>
  </section>
</template>

<script>
import ChatHistory from '@/components/chat/history/ChatHistory.vue';
import NewMessage from '@/components/chat/new-message/NewMessage.vue';
import Status from '@/components/chat/Status.vue';

export default {
  name: 'Chat',
  components: {
    appHistory: ChatHistory,
    appNewMessage: NewMessage,
    appStatus: Status,
  },
};
</script>

<style scoped lang="scss">

</style>
