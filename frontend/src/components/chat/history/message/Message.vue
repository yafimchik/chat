<template>
  <div class="message my-1 row">
    <div
      class="user mx-0 d-flex flex-row align-items-center justify-content-end col-3"
      :class="usernameClass"
    >
      <h6 class="alert-heading">{{ username }}</h6>
      <b-avatar class="ml-2" variant="primary" :text="initials"></b-avatar>
    </div>
    <b-alert show variant="secondary" class="message-block mb-0 d-flex justify-content-between
          flex-column align-items-stretch col-9">
      <p class="mb-1" v-if="!!message.text">{{ message.text }}</p>
      <hr v-if="attached">
      <app-audio class="mb-1" v-if="!!message.audio" :audio="message.audio"></app-audio>
      <app-files
        class="mb-1"
        v-if="!!(message.files && message.files.length)"
        :files="message.files"
      ></app-files>
      <hr>
      <p class="time mb-0">{{ message.date | myDate }}</p>
    </b-alert>
  </div>
</template>

<script>
import Audio from '@/components/chat/history/message/Audio.vue';
import Files from '@/components/chat/history/message/Files.vue';

export default {
  name: 'Message',
  props: {
    message: String,
  },
  components: {
    appAudio: Audio,
    appFiles: Files,
  },
  data() {
    return {
    };
  },
  computed: {
    hasFiles() {
      return (!this.message.files) ? false : !!this.message.files.length;
    },
    hasAudio() {
      return !!this.message.audio;
    },
    attached() {
      return (this.hasAudio || this.hasFiles);
    },
    isUserMessage() {
      return this.message.user === this.$store.state.chatData.user._id;
    },
    usernameClass() {
      return this.isUserMessage ? 'order-0' : 'order-12';
    },
    chatHistory() {
      return this.$store.getters.currentChatHistory;
    },
    username() {
      if (!this.message) return '';
      const name = this.$store.getters.usernameById(this.message.user);
      if (name) return name;
      return '';
    },
    initials() {
      if (!this.username) return '';
      if (typeof this.username !== 'string') return '';
      return this.username.split(' ')
        .map((word) => word.toUpperCase()[0]).splice(0, 2).join('');
    },
  },
};
</script>

<style scoped lang="scss">
.message-block {
  padding-bottom: 5px;

  p.time {
    font-size: 0.8em;
  }

  hr {
    margin: 2px 0;
  }
}
</style>
