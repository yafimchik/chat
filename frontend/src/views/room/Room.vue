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
    ]),
    withChat() {
      return this.$route.name === 'chat';
    },
    roomTitle() {
      return this.currentVoiceChannel ? this.currentVoiceChannel.name : '';
    },
  },
  async beforeDestroy() {
    await this.$store.dispatch('setUserRoleToDefault');
  },
};
</script>

<style scoped lang="scss">
</style>
