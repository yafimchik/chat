<template>
  <section>
    <div class="d-flex align-items-center flex-wrap">
      <app-user-avatar
        v-for="user in freeUsers" :user="user" :key="user._id"
      ></app-user-avatar>
    </div>
  </section>
</template>

<script>
import UserAvatar from '@/components/UserAvatar.vue';
import { mapGetters } from 'vuex';

export default {
  name: 'FreeUsersList',
  components: {
    appUserAvatar: UserAvatar,
  },
  computed: {
    ...mapGetters([
      'freeUsers',
    ]),
  },
};
</script>
