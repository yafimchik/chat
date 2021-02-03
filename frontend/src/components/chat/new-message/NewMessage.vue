<template>
  <section class="new-message">
    <b-input-group>
      <template #prepend>
        <b-button variant="outline-info" @click="attachVisibility=!attachVisibility">
          <b-icon icon="plus-circle"></b-icon>
        </b-button>
      </template>
      <b-form-textarea
        v-model="newMessage"
        @keyup.enter="onSend"
        @input="onInput"
        @change="onBlur"
      ></b-form-textarea>
      <b-input-group-append>
        <b-button variant="outline-info" @click="onSend">send</b-button>

      </b-input-group-append>
    </b-input-group>
    <b-collapse v-model="attachVisibility">
      <app-audio class="mt-2"></app-audio>
      <app-files class="mt-2"></app-files>
    </b-collapse>
  </section>
</template>

<script>
import AttachingAudio from '@/components/chat/new-message/AttachingAudio.vue';
import AttachingFiles from '@/components/chat/new-message/attaching-files/AttachingFiles.vue';
import readFileAsync from '@/vue-utils/utils';

export default {
  name: 'NewMessage',
  components: {
    appAudio: AttachingAudio,
    appFiles: AttachingFiles,
  },
  data() {
    return {
      attachVisibility: false,
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
    hasFiles() {
      if (!this.attachedFiles) return false;
      return !!this.attachedFiles.length;
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
    async onSend() {
      if (!this.newMessage && !this.currentRecord && !this.hasFiles) return;
      if (await this.send()) {
        this.newMessage = '';
        await this.$store.dispatch('afterMessageSending');
        this.chatClient.sendStatus(this.virtualServer, undefined);
        this.$store.commit('updateDraft', this.newMessage);
      } else {
        this.$store.commit('postNotification', {
          error: true,
          message: 'Message was not sent!',
          title: 'Attention. Error!',
        });
      }
    },
    async send() {
      const chat = this.chat.slice();
      const text = this.newMessage;
      let audio;
      try {
        if (this.currentRecord) {
          audio = {
            type: this.currentRecord.type,
            audio: await this.currentRecord.blob.arrayBuffer(),
            size: this.currentRecord.size,
            duration: this.currentRecord.duration,
          };
        }
      } catch (e) {
        return false;
      }

      let files = this.attachedFiles;
      if (files) {
        files = files.length ? files : undefined;
      }
      if (files) {
        files = await Promise.all(files.map((file) => readFileAsync(file)
          .then((fileBuffer) => ({
            filename: file.name,
            file: fileBuffer,
            size: file.size,
          }))));
      }

      const message = {
        chat,
        text,
        audio,
        files,
      };

      let result;
      try {
        result = await this.chatClient
          .sendFullMessage(this.virtualServer, this.chat, message);
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
section.new-message {
  margin: 10px;
}
</style>
