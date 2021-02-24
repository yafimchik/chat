<template>
  <button class="close-room-button" type="button" @click="onClick">
    <b-icon icon="x" class="text-danger"></b-icon>
    <b-modal ref="closeRoomModal" id="close-room-modal" title="Attention!">
      <p class="my-4">Do you want to delete this room?</p>
    </b-modal>
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
      event.stopPropagation();
      this.$refs.closeRoomModal.show();
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
