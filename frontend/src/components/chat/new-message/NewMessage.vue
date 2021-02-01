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
        <b-button v-b-toggle.collapse-plus variant="outline-info">
          <b-icon icon="plus-circle" sacle="2"></b-icon>
        </b-button>
      </b-input-group-append>
    </b-input-group>
    <b-collapse id="collapse-plus">
      <app-audio class="mt-2"></app-audio>
      <app-files class="mt-2"></app-files>
    </b-collapse>
  </section>
</template>

<script>
import AttachingAudio from '@/components/chat/new-message/AttachingAudio.vue';
import AttachingFiles from '@/components/chat/new-message/attaching-files/AttachingFiles.vue';

export default {
  name: 'NewMessage',
  components: {
    appAudio: AttachingAudio,
    appFiles: AttachingFiles,
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
      return this.$store.state.chatData.currentVirtualServerId;
    },
    userStatus() {
      return this.$store.state.ui.userStatus;
    },
    chat() {
      return this.$store.state.chatData.currentChatId;
    },
    chatClient() {
      return this.$store.state.chatEngine.chatClient;
    },
    attachedFiles() {
      return this.$store.state.ui.attachedFiles;
    },
    currentRecord() {
      return this.$store.state.audio.currentRecord;
    },
  },
  methods: {
    onBlur() {
      this.$store.commit('updateDraft', this.newMessage);
      this.$store.commit('updateUserStatus', null);
      this.chatClient.sendStatus(this.virtualServer, undefined);
    },
    onInput() {
      if (this.userStatus !== this.chat) {
        this.$store.commit('updateUserStatus', this.chat);
        this.chatClient.sendStatus(this.virtualServer, this.chat);
      }
    },
    onSend() {
      if (this.newMessage) this.send();
      else {
        console.log('nothing to send');
      }
    },
    async send() {
      // const chat = this.chat.slice();
      const text = this.newMessage;
      // const audio = this.currentRecord;
      // const files = this.attachedFiles;
      let result;
      try {
        result = await this.chatClient
          .sendFullMessage(this.virtualServer, this.chat, text);
      } catch (e) {
        console.log('error on send ', e);
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
      this.chatClient.sendStatus(this.virtualServer, undefined);
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
