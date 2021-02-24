<template>
  <section>
    <div class="group-title">Speakers ({{ speakers.length }})</div>
    <div class="d-flex align-items-start flex-wrap">
      <app-user-avatar
        v-for="user in speakers" :user="user" :key="user._id"
        :class="getContactVoiceState(user._id) ? 'active' : ''"
      ></app-user-avatar>
      <app-speak-button></app-speak-button>
    </div>
  </section>
</template>

<script>
import UserAvatar from '@/components/UserAvatar.vue';
import SpeakButton from '@/components/buttons/SpeakButton.vue';
import { mapGetters } from 'vuex';

export default {
  name: 'RoomSpeakers',
  components: {
    appUserAvatar: UserAvatar,
    appSpeakButton: SpeakButton,
  },
  computed: {
    ...mapGetters([
      'speakers',
      'activeStreams',
      'getContactVoiceState',
    ]),
  },
};
</script>

<style scoped lang="scss">
.avatar {
  width: 70px;
  height: 70px;
}

.avatar-button {
  position: relative;
}

div.list-column {
  .chat-list-block,
  .voice-channel-list-block {
    height: 50%;
    width: 100%;
  }
}
</style>
