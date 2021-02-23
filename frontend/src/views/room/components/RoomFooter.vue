<template>
  <footer>
    <div class="d-flex justify-content-around footer-links">
      <app-leave-room-button></app-leave-room-button>
      <app-chat-button></app-chat-button>
      <app-invite-to-room-button></app-invite-to-room-button>
    </div>
  </footer>
</template>

<script>
import LeaveRoomButton from '@/components/buttons/LeaveRoomButton.vue';
import ChatButton from '@/components/buttons/ChatButton.vue';
import InviteToRoomButton from '@/components/buttons/InviteToRoomButton.vue';

export default {
  name: 'RoomFooter',
  components: {
    appLeaveRoomButton: LeaveRoomButton,
    appChatButton: ChatButton,
    appInviteToRoomButton: InviteToRoomButton,
  },
};
</script>

<style scoped lang="scss">
.footer-links button {
  background-color: transparent;
  background-image: none;
  border: none;
  padding: 10px;
  color: rgb(140, 140, 140);
  font-size: 14px;
  flex: 1 1 0;
}

footer img {
  margin: auto auto 3px;
}
</style>
