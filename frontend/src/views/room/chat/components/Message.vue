<template>
  <div class="user-message text-left"
    :class="isUserMessage ? 'pl-4' : ''"
  >
    <span class="user-avatar-wrapper">
      <img
        alt="avatar"
        src="https://avatars.githubusercontent.com/u/2845244?v=4"
        style="width: 20px; height: 20px; border-radius: 30%; display: inline;"
      >
    </span>
    <button class="user-name-link"> ~{{ username }} </button>
    <span class="mr-1"> : </span>
    <span class="flex-1 m-0 text-bright"> {{ message.text }} </span>
  </div>
</template>

<script>
export default {
  name: 'Message',
  props: {
    message: String,
  },
  computed: {
    // hasFiles() {
    //   return (!this.message.files) ? false : !!this.message.files.length;
    // },
    // hasAudio() {
    //   return !!this.message.audio;
    // },
    // attached() {
    //   return (this.hasAudio || this.hasFiles);
    // },
    isUserMessage() {
      return this.message.user === this.$store.state.chatData.user._id;
    },
    // usernameClass() {
    //   return this.isUserMessage ? 'order-0' : 'order-12';
    // },
    // chatHistory() {
    //   return this.$store.getters.currentChatHistory;
    // },
    username() {
      if (!this.message) return '';
      const name = this.$store.getters.usernameById(this.message.user);
      if (name) return name;
      return '';
    },
    // initials() {
    //   if (!this.username) return '';
    //   if (typeof this.username !== 'string') return '';
    //   return this.username.split(' ')
    //     .map((word) => word.toUpperCase()[0]).splice(0, 2).join('');
    // },
  },
};
</script>

<style scoped lang="scss">
.user-message {
  margin-bottom: 10px;

  .user-avatar-wrapper {
    padding-right: 7px;
  }

  .user-name-link {
    background: none;
    border: none;
    margin: 0;
    padding: 0;
  }

  .user-name-link:hover {
    text-decoration: underline;
  }

  &:nth-child(2n + 1) {
    button.user-name-link {
      text-decoration-color: rgb(255, 255, 102);
      color: rgb(255, 255, 102);
    }
  }

  &:nth-child(2n) {
    button.user-name-link {
      text-decoration-color: rgb(141, 77, 232);
      color: rgb(141, 77, 232);
    }
  }
}
</style>
