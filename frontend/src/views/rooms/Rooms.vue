<template>
  <div class="page home flex-grow-1">
    <app-main-header></app-main-header>
    <app-rooms-buttons></app-rooms-buttons>
    <app-room-card-list></app-room-card-list>
    <app-rooms-footer></app-rooms-footer>
    <transition appear name="fade">
      <router-view/>
    </transition>
  </div>
</template>

<script>
import MainHeader from '@/components/MainHeader.vue';
import RoomsButtons from '@/views/rooms/components/RoomsButtons.vue';
import RoomCardList from '@/views/rooms/components/room-card-list/RoomCardList.vue';
import RoomsFooter from '@/views/rooms/components/RoomsFooter.vue';

export default {
  name: 'Rooms',
  components: {
    appMainHeader: MainHeader,
    appRoomsButtons: RoomsButtons,
    appRoomCardList: RoomCardList,
    appRoomsFooter: RoomsFooter,
  },
  data() {
    return {};
  },
};
</script>
