<template>
  <header class="d-flex justify-content-center align-items-center flex-wrap">
    <div class="m-2">
      <app-home-button></app-home-button>
    </div>
    <button class="header-text-button"> New room: </button>
    <div class="m-2">
      <app-user-button></app-user-button>
    </div>
  </header>
</template>

<script>
import HomeButton from '@/components/buttons/HomeButton.vue';
import UserButton from '@/components/buttons/UserButton.vue';

export default {
  name: 'CreateRoomButtons',
  components: {
    appHomeButton: HomeButton,
    appUserButton: UserButton,
  },
};
</script>
