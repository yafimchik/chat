<template>
  <div class="m-2">
    <button class="avatar-button" @click="onClick">
      <img class="avatar"
           :src="imgSource"
           alt="avatar">
    </button>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { VOICE_CHANNEL_USER_ROLES } from '@/chat-engine-client/chat-engine.client.constants';

export default {
  name: 'SpeakButton',
  data() {
    return {

    };
  },
  computed: {
    ...mapGetters([
      'isSpeaker',
    ]),
    imgSource() {
      return this.isSpeaker ? '/img/minus.png' : '/img/plus.png';
    },
  },
  methods: {
    async onClick() {
      const newRole = this.isSpeaker
        ? VOICE_CHANNEL_USER_ROLES.listener : VOICE_CHANNEL_USER_ROLES.speaker;
      await this.$store.dispatch('updateUserRole', newRole);
    },
  },
};
</script>

<style scoped lang="scss">
img {
  background-color: rgba(255, 255, 255, 0.3);
  padding: 5px;
}
</style>
