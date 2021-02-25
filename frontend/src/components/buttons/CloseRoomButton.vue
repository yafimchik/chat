<template>
  <button class="close-room-button" type="button" @click="onClick">
    <b-icon icon="x" class="text-danger"></b-icon>
  </button>
</template>

<script>
export default {
  name: 'CloseRoomButton',
  props: {
    voiceChannel: Object,
  },
  data() {
    return {};
  },
  methods: {
    async onClick(event) {
      event.stopImmediatePropagation();
      await this.$router.push({ name: 'closeRoom', params: { roomId: this.voiceChannel._id } });
    },
  },
};
</script>

<style scoped lang="scss">
button.close-room-button {
  border-style: none;
  background-color: transparent;
}
</style>
