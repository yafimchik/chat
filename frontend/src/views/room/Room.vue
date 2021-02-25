<template>
  <div class="page room flex-grow-1
      d-flex flex-column flex-nowrap align-items-stretch justify-content-center"
  >
    <app-room-header :roomTitle="roomTitle"></app-room-header>
    <div class="flex-grow-1">
      <app-room-speakers></app-room-speakers>
      <app-room-listeners></app-room-listeners>
      <router-view/>
    </div>
    <app-room-footer></app-room-footer>
  </div>
</template>

<script>
import RoomHeader from '@/views/room/components/RoomHeader.vue';
import RoomSpeakers from '@/views/room/components/RoomSpeakers.vue';
import RoomListeners from '@/views/room/components/RoomListeners.vue';
import RoomFooter from '@/views/room/components/RoomFooter.vue';
import { mapGetters } from 'vuex';
import { DEFAULT_REDIRECT_PAGE_NAME } from '@/configs/view.config';

export default {
  name: 'Room',
  components: {
    appRoomHeader: RoomHeader,
    appRoomSpeakers: RoomSpeakers,
    appRoomListeners: RoomListeners,
    appRoomFooter: RoomFooter,
  },
  computed: {
    ...mapGetters([
      'currentVoiceChannel',
      'currentVoiceChannelId',
      'voiceChannelById',
    ]),
    withChat() {
      return this.$route.name === 'chat';
    },
    roomTitle() {
      return this.currentVoiceChannel ? this.currentVoiceChannel.name : '';
    },
  },
  async beforeMount() {
    const voiceChannel = this.voiceChannelById(this.$route.params.roomId);
    if (!voiceChannel) {
      await this.$router.push({ name: DEFAULT_REDIRECT_PAGE_NAME });
      return;
    }
    if (voiceChannel._id !== this.currentVoiceChannelId) {
      await this.$store.dispatch('connectToVoiceChannel', voiceChannel._id);
      await this.$store.dispatch('setCurrentChat', voiceChannel.chat);
    }
  },
};
</script>

<style scoped lang="scss">
</style>
