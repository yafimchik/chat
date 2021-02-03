<template>
  <div class="chat-list p-3">
    <app-user-name v-for="(user, index) in users" :user="user" :key="index"></app-user-name>
  </div>
</template>

<script>
import UserName from '@/components/user-list/UserName.vue';

export default {
  name: 'UserList',
  data() {
    return {
    };
  },
  computed: {
    users() {
      return this.$store.getters.usersOnline;
    },
  },
  components: {
    appUserName: UserName,
  },
};
</script>

<style scoped lang="scss">

</style>
