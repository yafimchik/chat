<template>
  <button class="close-room-button" type="button" @click="onClick">
    <b-icon icon="x" class="text-danger"></b-icon>
    <b-modal ref="closeRoomModal" id="close-room-modal" title="Attention!" @ok="onOk">
      <p class="my-4">Do you want to delete this room?</p>
    </b-modal>
  </button>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'CloseRoomButton',
  props: {
    voiceChannel: Object,
  },
  data() {
    return {};
  },
  computed: {
    ...mapGetters([
      'getVoiceChannelContacts',
    ]),
  },
  methods: {
    async onClick(event) {
      event.stopPropagation();
      this.$refs.closeRoomModal.show();
    },
    async onOk() {
      const peopleInRoom = this.getVoiceChannelContacts(this.voiceChannel._id);
      if (peopleInRoom.length) {
        this.$store.commit('postNotification', {
          error: true,
          title: 'Error!',
          message: 'Can\'t close this Room. There are people in this room right now!',
        });
        return;
      }
      await this.$store.dispatch('deleteVoiceChannelOnServer', this.voiceChannel._id);
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
