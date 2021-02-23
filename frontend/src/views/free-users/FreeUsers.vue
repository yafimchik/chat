<template>
  <div class="page free-users">
    <app-main-header></app-main-header>
    <app-free-users-buttons></app-free-users-buttons>
    <app-free-users-list></app-free-users-list>
    <app-main-footer></app-main-footer>
  </div>
</template>

<script>
import FreeUsersButtons from '@/views/free-users/components/FreeUsersButtons.vue';
import FreeUsersList from '@/views/free-users/components/FreeUsersList.vue';
import MainFooter from '@/components/MainFooter.vue';
import MainHeader from '@/components/MainHeader.vue';

export default {
  name: 'FreeUsers',
  components: {
    appMainHeader: MainHeader,
    appFreeUsersButtons: FreeUsersButtons,
    appFreeUsersList: FreeUsersList,
    appMainFooter: MainFooter,
  },
};
</script>

<style scoped lang="scss">
</style>
