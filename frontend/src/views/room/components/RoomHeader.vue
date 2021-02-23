<template>
  <header class="d-flex justify-content-between align-items-center">
    <app-home-button></app-home-button>
    <button class="header-text-button"> {{ roomTitle }} </button>
    <app-user-button></app-user-button>
  </header>
</template>

<script>
import HomeButton from '@/components/buttons/HomeButton.vue';
import UserButton from '@/components/buttons/UserButton.vue';

export default {
  name: 'RoomHeader',
  props: {
    roomTitle: {
      type: String,
      default: '',
    },
  },
  components: {
    appHomeButton: HomeButton,
    appUserButton: UserButton,
  },
};
</script>

<style scoped lang="scss">
header {
  padding: 20px 0;
  background-color: rgb(38, 38, 38);
  border-bottom: 1px solid rgb(128, 128, 128);
  margin-bottom: 30px;
}

header .avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}
</style>
