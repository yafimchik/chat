<template>
  <div class="user-list">
    <app-user-name
      v-for="user in users" :user="user" :key="user._id"
    ></app-user-name>
  </div>
</template>

<script>
import UserName from '@/components/user-list/UserName.vue';

export default {
  name: 'UserList',
  props: {
    users: Array,
  },
  data() {
    return {};
  },
  components: {
    appUserName: UserName,
  },
};
</script>
