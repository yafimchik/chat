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
import Message from '@/components/chat/history/message/Message.vue';
import { scrollingDelay } from '@/configs/chat-connection.config';

export default {
  name: 'ChatHistory',
  data() {
    return {
      scrollTop: this.historyHeight,
      userScrolling: false,
      userScrollingTimeout: undefined,
      fullHistoryLoaded: false,
      previousHistorySize: null,
      autoScroll: false,
    };
  },
  computed: {
    historyHeight() {
      return this.historyElement.scrollHeight + 10000;
    },
    currentChat() {
      return this.$store.state.chatData.currentChatId;
    },
    chatHistory() {
      return this.$store.getters.currentChatHistory;
    },
    isHistoryFull() {
      return this.$store.getters.isHistoryFull;
    },
    historySize() {
      return this.chatHistory.length;
    },
    historyElement() {
      return document.querySelector('div.chat-history__wrapper');
    },
  },
  components: {
    appMessage: Message,
  },
  methods: {
    isScrolledToEnd() {
      const unScrolledSize = this.historyElement.scrollHeight - this.historyElement.scrollTop;
      return unScrolledSize <= this.historyElement.clientHeight;
    },
    scrollHistoryToEnd() {
      if (this.userScrolling) return;
      this.historyElement.children[this.historySize - 1].scrollIntoView();
      this.autoScroll = true;
    },
    async onScroll() {
      if (this.isScrolledToEnd()) {
        this.$store.commit('clearUnreadMessagesCount');
      }

      if (!this.autoScroll) {
        this.userScrolling = true;
        if (this.userScrollingTimeout) clearTimeout(this.userScrollingTimeout);
        this.userScrollingTimeout = setTimeout(() => {
          this.userScrolling = false;
        }, scrollingDelay);

        if (this.historyElement.scrollTop === 0 && !this.isHistoryFull) {
          this.previousHistorySize = this.chatHistory.length;
          await this.$store.dispatch('getHistoryChunk');
        }
      } else if (this.isScrolledToEnd()) {
        this.autoScroll = false;
      }
    },
  },
  updated() {
    if (this.isScrolledToEnd()) {
      this.$store.commit('clearUnreadMessagesCount');
    }
    if (this.previousHistorySize !== null) {
      this.historyElement.children[this.historySize - this.previousHistorySize].scrollIntoView();
      this.previousHistorySize = null;
    } else {
      this.scrollHistoryToEnd();
    }
  },
  destroyed() {
    if (this.userScrollingTimeout) clearTimeout(this.userScrollingTimeout);
  },
};
</script>

<style scoped lang="scss">
  #chat-history {
    position: relative;

    .chat-history__wrapper {
      padding: 10px;
      position: absolute;
      scroll-behavior: smooth;
      overflow-y: scroll;
    }
  }
</style>
