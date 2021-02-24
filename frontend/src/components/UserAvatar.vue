<template>
  <div class="user-avatar m-2">
    <button class="avatar-button" @click="onClick">
      <img class="avatar"
           src="https://avatars.githubusercontent.com/u/51411388?v=4"
           alt="avatar">
      <div class="user-name mt-2">{{ name }}</div>
      <div class="user-mute p-1" v-if="isRoomOpened && muted">
        <img src="img/mute.svg" width="16" height="16">
      </div>
    </button>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'UserAvatar',
  props: {
    user: Object,
  },
  data() {
    return {};
  },
  computed: {
    ...mapGetters({
      getMutedByUserId: 'getMutedByUserId',
      isRoomOpened: 'isRoomOpened',
      currentUser: 'user',
      isSpeaker: 'isSpeaker',
      currentUserMutedStatus: 'currentUserMutedStatus',
    }),
    isCurrentUser() {
      return this.currentUser._id === this.user._id;
    },
    muted() {
      if (this.isCurrentUser) return this.currentUserMutedStatus;
      return this.getMutedByUserId(this.user._id);
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
  methods: {
    async onClick() {
      if (this.isCurrentUser) {
        await this.$store.dispatch('switchMicrophone', this.currentUserMutedStatus);
      }
    },
  },
};
</script>

<style scoped lang="scss">
.avatar-button {
  position: relative;
}

.user-name {
  color: rgb(255, 255, 255);
  font-size: 14px;
}

.user-mute {
  border-radius: 50%;
  right: 0;
  bottom: 20px;
  background-color: #0b78e3;
  position: absolute;
  width: 25px;
  height: 25px;
  display: flex;
}

.user-avatar {
  img.avatar {
    transition: box-shadow 0.2s ease-in-out;
  }

  &.active {
    img.avatar {
      box-shadow: 0 0 3px 5px #0b78e3;
    }
  }
}
</style>
