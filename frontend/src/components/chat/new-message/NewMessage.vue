<template>
  <section class="new-message my-2">
    <b-input-group>
      <template #prepend>
        <b-button variant="outline-info" @click="attachVisibility=!attachVisibility">
          <b-icon icon="paperclip" scale="2"></b-icon>
        </b-button>
      </template>
      <b-form-textarea
        v-model="newMessage"
        @keyup.enter="onSend"
        @input="onInput"
        @change="onBlur"
      ></b-form-textarea>
      <b-input-group-append>
        <b-button variant="outline-info" @click="onSend">
          <b-icon icon="cursor" scale="2"></b-icon>
        </b-button>

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
import { maxFileSize } from '@/configs/chat-connection.config';

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
  watch: {
    attachedFiles(files) {
      if (files && files.length) {
        const bigFiles = files.filter((file) => file.size > (maxFileSize * 1024 * 1024));
        if (bigFiles.length) {
          bigFiles.forEach((file, index) => {
            setTimeout(() => {
              this.$store.commit('postNotification', {
                title: `File is too big! Max Size: ${maxFileSize} Mb`,
                message: `File: ${file.name} size: ${Math.round(file.size / 1024 / 1024)} Mb`,
              });
            }, index * 250);
          });

          const normalFiles = files.filter((file) => file.size <= (maxFileSize * 1024 * 1024));
          this.$store.commit('setAttachedFiles', normalFiles);
        }
      }
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
      if (!this.newMessage && !this.currentRecord && !this.hasFiles) {
        this.$store.commit('postNotification', {
          message: 'Oops... We have nothing to send!',
        });
        return;
      }
      if (await this.send()) {
        this.newMessage = '';
        await this.$store.dispatch('afterMessageSending');
        this.chatClient.sendStatus(this.virtualServer, undefined);
        this.$store.commit('updateDraft', this.newMessage);
        this.attachVisibility = false;
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
