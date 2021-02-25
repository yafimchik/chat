<template>
  <app-sub-page-modal>
    <app-new-room-form></app-new-room-form>
  </app-sub-page-modal>
</template>

<script>
import NewRoomForm from '@/views/rooms/create-room/components/NewRoomForm.vue';
import SubPageModal from '@/components/SubPageModal.vue';

export default {
  name: 'CreateRoom',
  components: {
    appSubPageModal: SubPageModal,
    appNewRoomForm: NewRoomForm,
  },
};
</script>

<style scoped lang="scss">
</style>
