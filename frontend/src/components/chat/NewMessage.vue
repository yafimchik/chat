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
      <b-input-group-append>
        <b-button variant="outline-info" @click="onSend">send</b-button>
        <app-mic></app-mic>
        <app-play></app-play>
      </b-input-group-append>
    </b-input-group>
  </section>
</template>

<script>
import Microphone from '@/audio-recorder/components/Microphone.vue';
import Play from '@/audio-recorder/components/Play.vue';

export default {
  name: 'NewMessage',
  components: {
    appMic: Microphone,
    appPlay: Play,
  },
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
      else {
        console.log('nothing to send');
      }
    },
    async send() {
      const currentChat = this.chat.slice();
      let result;
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
