<template>
  <section
    class="flex-grow-1"
    id="chat-history"
  >
    <div
      ref="chatHistory"
      class="chat-history__wrapper h-100 w-100 p-4"
      :scrolltop="scrollTop"
      @scroll="onScroll"
      @wheel="onUserInput"
      @keydown="onUserInput"
      @mousedown="onUserInput"
    >
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
      previousStartMessageId: undefined,
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
      return this.$refs.chatHistory;
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
      if (!this.historyElement) return;
      if (!this.historyElement.children.length) return;
      this.historyElement.children[this.historySize - 1].scrollIntoView();
      this.autoScroll = true;
    },
    scrollToPreviousStart() {
      if (!this.historyElement) return;
      if (!this.historyElement.children.length) return;
      if (this.previousHistorySize !== null) {
        this.autoScroll = true;
        this.userScrolling = false;
        this.previousStartMessageId = null;
        this.historyElement.children[this.historySize - this.previousHistorySize].scrollIntoView();
        this.previousHistorySize = null;
      }
    },
    onUserInput() {
      this.userScrolling = true;
    },
    async onScroll() {
      if (this.isScrolledToEnd()) {
        await this.$store.dispatch('clearUnreadMessagesCount');
      }

      if (this.autoScroll) {
        this.autoScroll = false;
      }

      if (this.userScrolling) {
        if (this.historyElement.scrollTop <= 0 && !this.isHistoryFull) {
          if (this.historySize) {
            this.previousStartMessageId = this.chatHistory[0]._id;
            this.previousHistorySize = this.historySize;
            await this.$store.dispatch('getHistoryChunk');
          }
        }
        if (this.userScrollingTimeout) clearTimeout(this.userScrollingTimeout);
        this.userScrollingTimeout = setTimeout(() => {
          this.userScrolling = false;
        }, scrollingDelay);
      }
    },
  },
  destroyed() {
    if (this.userScrollingTimeout) clearTimeout(this.userScrollingTimeout);
  },
  async updated() {
    if (this.isScrolledToEnd()) {
      await this.$store.dispatch('clearUnreadMessagesCount');
    }

    const toGoToPreviousStart = this.chatHistory.length && this.previousStartMessageId
      && this.previousStartMessageId !== this.chatHistory[0]._id;
    if (toGoToPreviousStart) {
      this.scrollToPreviousStart();
    } else {
      this.scrollHistoryToEnd();
    }
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
