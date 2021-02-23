<template>
  <section class="row room-card-section">
    <app-room-card
      v-for="voiceChannel in voiceChannels"
      :voice-channel="voiceChannel" :key="voiceChannel._id"
    ></app-room-card>
  </section>
</template>

<script>
import RoomCard from '@/views/home/components/room-card-list/RoomCard.vue';

export default {
  name: 'RoomCardList',
  components: {
    appRoomCard: RoomCard,
  },
  data() {
    return {};
  },
  computed: {
    voiceChannels() {
      return this.$store.getters.voiceChannelsByCurrentVirtualServer;
    },
  },
};
</script>
