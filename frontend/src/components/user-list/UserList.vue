<template>
  <div class="chat-list">
    <b-list-group>
      <app-user-name v-for="user in users" :user="user" :key="index"></app-user-name>
    </b-list-group>
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
