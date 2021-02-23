<template>
  <div class="page create-room">
    <app-main-header></app-main-header>
    <app-create-room-buttons></app-create-room-buttons>
    <app-new-room-form></app-new-room-form>
    <app-main-footer></app-main-footer>
  </div>
</template>

<script>
import MainFooter from '@/components/MainFooter.vue';
import MainHeader from '@/components/MainHeader.vue';
import CreateRoomButtons from '@/views/create-room/components/CreateRoomButtons.vue';
import NewRoomForm from '@/views/create-room/components/NewRoomForm.vue';

export default {
  name: 'CreateRoom',
  components: {
    appMainHeader: MainHeader,
    appCreateRoomButtons: CreateRoomButtons,
    appNewRoomForm: NewRoomForm,
    appMainFooter: MainFooter,
  },
};
</script>

<style scoped lang="scss">
</style>
