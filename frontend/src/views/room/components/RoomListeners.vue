<template>
  <section>
    <div class="group-title">Listeners ({{ listeners.length }})</div>
    <div class="d-flex align-items-center flex-wrap">
      <app-user-avatar
        v-for="user in listeners" :user="user" :key="user._id"
      ></app-user-avatar>
    </div>
  </section>
</template>

<script>
import UserAvatar from '@/components/UserAvatar.vue';
import { mapGetters } from 'vuex';

export default {
  name: 'RoomListeners',
  components: {
    appUserAvatar: UserAvatar,
  },
  computed: {
    ...mapGetters([
      'listeners',
    ]),
  },
};
</script>

<style scoped lang="scss">
.avatar {
  width: 70px;
  height: 70px;
}

.avatar-button {
  position: relative;
}
</style>
