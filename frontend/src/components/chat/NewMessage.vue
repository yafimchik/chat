<template>
  <section class="new-message">
    <b-input-group>
      <template #prepend>
        <b-input-group-text>new message</b-input-group-text>
      </template>
      <b-form-textarea
        v-model="newMessage"
        @keyup.enter="onSend"
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
      console.log('ON SEND');
      if (this.newMessage) this.send();
      else {
        console.log('nothing to send');
      }
    },
    async send() {
      console.log('sending');
      const currentChat = this.chat.slice();
      let result;
      console.log('try to send');
      try {
        result = await this.$store.state.chatClient
          .sendText(this.virtualServer, currentChat, this.newMessage);
      } catch (e) {
        console.log(e);
        return;
      }

      if (!result) {
        console.log('no result from server');
        return;
      }
      if (result.error) {
        console.log('error result from server');
        return;
      }

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
