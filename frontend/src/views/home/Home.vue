<template>
  <div class="page home flex-grow-1">
    <app-main-header></app-main-header>
    <app-home-buttons></app-home-buttons>
    <app-room-card-list></app-room-card-list>
    <app-home-footer></app-home-footer>
  </div>
</template>

<script>
import MainHeader from '@/components/MainHeader.vue';
import HomeButtons from '@/views/home/components/HomeButtons.vue';
import RoomCardList from '@/views/home/components/room-card-list/RoomCardList.vue';
import HomeFooter from '@/views/home/components/HomeFooter.vue';

export default {
  name: 'Home',
  components: {
    appMainHeader: MainHeader,
    appHomeButtons: HomeButtons,
    appRoomCardList: RoomCardList,
    appHomeFooter: HomeFooter,
  },
  data() {
    return {};
  },
  async beforeMount() {
    await this.$store.dispatch('initializeAllChatUI');
  },
};
</script>
