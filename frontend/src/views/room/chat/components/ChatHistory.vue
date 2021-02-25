<template>
  <div id="chat-history">
    <div
      class="chat-history__wrapper h-100 w-100 p-3 d-flex flex-column align-items-start"
      ref="chatHistory"
      :scrolltop="scrollTop"
      @scroll="onScroll"
      @wheel="onUserInput"
      @keydown="onUserInput"
      @mousedown="onUserInput"
    >
      <app-message
        v-for="message in chatHistory"
        :message="message"
        :key="message._id"
      ></app-message>
    </div>
  </div>
</template>

<script>
import Message from '@/views/room/chat/components/Message.vue';
import { scrollingDelay } from '@/configs/chat-connection.config';
import { mapGetters } from 'vuex';

export default {
  name: 'ChatHistory',
  components: {
    appMessage: Message,
  },
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
    ...mapGetters({
      currentChat: 'currentChatId',
      chatHistory: 'currentChatHistory',
      isHistoryFull: 'isHistoryFull',

    }),
    historyHeight() {
      return this.historyElement.scrollHeight + 10000;
    },
    historySize() {
      return this.chatHistory.length;
    },
    historyElement() {
      return this.$refs.chatHistory;
    },
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
  mounted() {
    this.scrollHistoryToEnd();
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
