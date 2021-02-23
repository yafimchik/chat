<template>
  <section class="d-flex justify-content-between align-items-center">
    <div class="m-2">
      <app-home-button></app-home-button>
    </div>
    <button class="header-text-button"> Free online users: </button>
    <div class="m-2">
      <app-user-button></app-user-button>
    </div>
  </section>
</template>

<script>
import HomeButton from '@/components/buttons/HomeButton.vue';
import UserButton from '@/components/buttons/UserButton.vue';

export default {
  name: 'FreeUsersButtons',
  components: {
    appHomeButton: HomeButton,
    appUserButton: UserButton,
  },
};
</script>
