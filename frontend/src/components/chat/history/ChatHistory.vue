<template>
  <section
    class="flex-grow-1"
    id="chat-history"
  >
    <div class="chat-history__wrapper h-100 w-100" :scrolltop="scrollTop">
      <app-message
        v-for="(message, index) in chatHistory"
        :message="message"
        :key="index"
      ></app-message>
    </div>
  </section>
</template>

<script>
import Message from '@/components/chat/history/Message.vue';

export default {
  name: 'ChatHistory',
  data() {
    return {
      scrollTop: this.historyHeight,
    };
  },
  computed: {
    historyHeight() {
      const history = document.querySelector('div.chat-history__wrapper');
      return history.scrollHeight;
    },
    currentChat() {
      return this.$store.state.currentChatId;
    },
    chatHistory() {
      return this.$store.getters.currentChatHistory;
    },
  },
  components: {
    appMessage: Message,
  },
  methods: {
    scrollHistoryToEnd() {
      const history = document.querySelector('div.chat-history__wrapper');
      history.scrollTop = this.historyHeight + 10000;
    },
  },
  updated() {
    this.scrollHistoryToEnd();
  },
};
</script>

<style scoped lang="scss">
  #chat-history {
    position: relative;

    .chat-history__wrapper {
      padding: 10px;
      position: absolute;
      overflow-y:scroll;
    }
  }
</style>
