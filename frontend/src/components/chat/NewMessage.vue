<template>
  <section class="new-message">
    <b-input-group>
      <template #prepend>
        <b-input-group-text>new message</b-input-group-text>
      </template>
      <b-form-textarea
        v-model="newMessage"
        @keyup.enter="send"
        @input="onInput"
        @change="onBlur"
      ></b-form-textarea>

      <template #append>
        <b-button variant="info" @click="onSend">send</b-button>
      </template>
    </b-input-group>
  </section>
</template>

<script>
export default {
  name: 'NewMessage',
  data() {
    return {
      newMessage: this.draft ? this.draft : '',
    };
  },
  computed: {
    chatHistory() {
      return this.$store.getters.currentChatHistory;
    },
    draft() {
      return this.$store.getters.currentDraft;
    },
    virtualServer() {
      return this.$store.state.currentVirtualServerId;
    },
    chat() {
      return this.$store.state.currentChatId;
    },
  },
  methods: {
    onBlur() {
      this.$store.commit('updateDraft', this.newMessage);
      this.$store.commit('updateUserStatus', null);
      this.$store.state.chatClient.sendStatus(this.virtualServer, undefined);
    },
    onInput() {
      if (this.$store.state.userStatus !== this.$store.state.currentChatId) {
        this.$store.commit('updateUserStatus', this.chat);
        this.$store.state.chatClient.sendStatus(this.virtualServer, this.chat);
      }
    },
    onSend() {
      if (this.newMessage) this.send();
    },
    async send() {
      const currentChat = this.chat.slice();
      const result = await this.$store.state.chatClient
        .sendText(this.virtualServer, currentChat, this.newMessage);
      if (!result) return;
      if (result.error) return;

      this.newMessage = '';
      this.$store.commit('updateUserStatus', undefined);
      this.$store.state.chatClient.sendStatus(this.virtualServer, undefined);
      this.$store.commit('updateDraft', this.newMessage);
    },
  },
};
</script>

<style scoped lang="scss">
section.new-message {
  margin: 10px;
}
</style>
