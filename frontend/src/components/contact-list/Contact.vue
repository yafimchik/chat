<template>
  <div class="my-2 d-flex flex-row align-items-center justify-content-center">
    <app-mic-button v-if="isCurrentUser"></app-mic-button>
    <app-user-name :user="user"></app-user-name>
  </div>
</template>

<script>
import UserName from '@/components/user-list/UserName.vue';
import MicrophoneSwitchButton from '@/components/contact-list/MicrophoneSwitchButton.vue';

export default {
  name: 'UserName',
  components: {
    appMicButton: MicrophoneSwitchButton,
    appUserName: UserName,
  },
  props: {
    user: Object,
  },
  data() {
    return {
    };
  },
  computed: {
    isCurrentUser() {
      return this.user._id === this.$store.getters.user._id;
    },
    name() {
      return this.user.username;
    },
    initials() {
      const { name } = this;
      if (!name) return '';
      if (typeof name !== 'string') return '';
      return name.split(' ')
        .map((word) => word.toUpperCase()[0]).splice(0, 2).join('');
    },
  },
};
</script>
