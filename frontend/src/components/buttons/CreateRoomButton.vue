<template>
  <button class="btn btn-primary w-100" type="button" @click="onClick">Create Room</button>
</template>

<script>
export default {
  name: 'CreateRoomButton',
  data() {
    return {};
  },
  methods: {
    async onClick() {
      await this.$router.push({ name: 'createRoom' });
    },
  },
};
</script>
