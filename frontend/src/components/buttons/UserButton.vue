<template>
  <button class="avatar-button" @click="onClick">
    <img class="avatar" src="https://avatars.githubusercontent.com/u/33094186?v=4" alt="avatar">
  </button>
</template>

<script>
export default {
  name: 'FreeUsersButton',
  data() {
    return {};
  },
  methods: {
    async onClick() {
      console.log('user button what ???');
    },
  },
};
</script>
