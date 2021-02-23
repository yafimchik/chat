<template>
  <form class="chat-form" @submit="onSend">
  <input
    class="chat-input"
    type="text"
    placeholder="Send a message"
    v-model="newMessage"
    @input="onInput"
    @change="onBlur"
  >
  </form>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'NewMessage',
  data() {
    return { newMessage: this.draft ? this.draft : '' };
  },
  computed: {
    ...mapGetters({
      chatClient: 'chatEngine',
      chat: 'currentChatId',
      virtualServer: 'currentVirtualServerId',
    }),
    draft() {
      return this.$store.getters.currentDraft;
    },
    userChatStatus() {
      return this.$store.state.ui.userStatus.chat;
    },
  },
  methods: {
    async onBlur() {
      this.$store.commit('updateDraft', this.newMessage);
      await this.$store.dispatch('updateUserChatStatus', undefined);
    },
    async onInput() {
      if (this.userChatStatus !== this.chat) {
        await this.$store.dispatch('updateUserChatStatus', this.chat);
      }
    },
    async onSend(event) {
      event.preventDefault();
      if (!this.newMessage) {
        this.$store.commit('postNotification', {
          message: 'Oops... We have nothing to send!',
        });
        return;
      }
      if (await this.send()) {
        this.newMessage = '';
        await this.$store.dispatch('afterMessageSending');
        this.$store.commit('updateDraft', this.newMessage);
      } else {
        this.$store.commit('postNotification',
          {
            error: true,
            message: 'Message was not sent!',
            title: 'Attention. Error!',
          });
      }
    },
    async send() {
      let result;
      try {
        result = await this.chatClient
          .sendText(this.virtualServer, this.chat, this.newMessage.trim());
      } catch (e) {
        return false;
      }

      if (!result || result.error) {
        return false;
      }
      return true;
    },
  },
};
</script>

<style scoped lang="scss">
.new-message {
  position: absolute;
  background-color: rgb(255, 153, 0);
  border-radius: 50%;
  right: -2px;
  top: -1px;
  width: 10px;
  height: 10px;
}

.chat-form {
  margin-top: 20px;
}

.chat-input {
  display: block;
  width: 100%;
  border: none;
  border-radius: 0.25rem;
  line-height: 1.75rem;
  padding: 0.5rem 1rem;
  background-color: rgba(89,89,89,1);
  color: rgba(166,166,166,1);
  font-size: 16px;
}
</style>
