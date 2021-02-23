<template>
  <button @click="onClick">
    <div class="d-flex justify-content-center">
      <div style="position: relative;">
        <img src="img/chat.svg" width="24" height="24">
        <span class="new-message"></span>
      </div>
    </div>
    <div>Chat</div>
  </button>
</template>

<script>
export default {
  name: 'ChatButton',
  data() {
    return {};
  },
  methods: {
    async onClick() {
      if (this.$route.name !== 'chat') await this.$router.push({ name: 'chat' });
      else await this.$router.push({ name: 'room' });
    },
  },
};
</script>
