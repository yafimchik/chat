<template>
  <section
    class="flex-grow-1"
    id="chat-history"
  >
    <div class="chat-history__wrapper h-100 w-100" :scrolltop="scrollTop" @scroll="onScroll">
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
import { scrollingDelay } from '@/configs/chat-connection.config';

export default {
  name: 'ChatHistory',
  data() {
    return {
      scrollTop: this.historyHeight,
      userScrolling: false,
      userScrollingTimeout: undefined,
      lazyUploadingDelay: false,
      lazyUploadingTimeout: undefined,
    };
  },
  computed: {
    historyHeight() {
      const history = document.querySelector('div.chat-history__wrapper');
      return history.scrollHeight + 10000;
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
      if (this.userScrolling) return;
      console.log('history update scroll');
      const history = document.querySelector('div.chat-history__wrapper');
      history.scrollTop = this.historyHeight + 10000;
    },
    async onScroll() {
      this.userScrolling = true;
      if (this.userScrollingTimeout) clearTimeout(this.userScrollingTimeout);
      this.userScrollingTimeout = setTimeout(() => {
        this.userScrolling = false;
      }, scrollingDelay);

      const history = document.querySelector('div.chat-history__wrapper');
      if (history.scrollTop === 0) {
        await this.lazyUploadHistory();
      }
    },
    async lazyUploadHistory() {
      if (this.lazyUploadingDelay) return;
      this.lazyUploadingDelay = true;
      this.lazyUploadingTimeout = setTimeout(() => {
        this.lazyUploadingDelay = false;
      }, scrollingDelay);
      await this.$store.dispatch('getHistoryChunk');
    },
  },
  updated() {
    this.scrollHistoryToEnd();
  },
  destroyed() {
    if (this.userScrollingTimeout) clearTimeout(this.userScrollingTimeout);
    if (this.lazyUploadingTimeout) clearTimeout(this.lazyUploadingTimeout);
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
