<template>
  <section class="d-flex justify-content-center align-items-center flex-wrap">
    <div class="m-2">
      <app-free-users-button></app-free-users-button>
    </div>
    <div class="m-2">
      <app-user-button></app-user-button>
    </div>
  </section>
</template>

<script>
import FreeUsersButton from '@/components/buttons/FreeUsersButton.vue';
import UserButton from '@/components/buttons/UserButton.vue';

export default {
  name: 'HomeButtons',
  components: {
    appFreeUsersButton: FreeUsersButton,
    appUserButton: UserButton,
  },
  data() {
    return {};
  },
};
</script>
