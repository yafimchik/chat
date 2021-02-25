<template>
  <app-sub-page-modal>
    <label>Do you want to close this room?</label>
    <div class="d-flex justify-content-center">
      <b-button v-focus class="mr-2" @click="onCancel">Cancel</b-button>
      <b-button variant="danger" @click="onDelete">Delete</b-button>
    </div>
  </app-sub-page-modal>
</template>

<script>
import SubPageModal from '@/components/SubPageModal.vue';
import { mapGetters } from 'vuex';

export default {
  name: 'CreateRoom',
  components: {
    appSubPageModal: SubPageModal,
  },
  data() {
    return { voiceChannel: undefined };
  },
  computed: {
    ...mapGetters([
      'voiceChannelById',
      'getVoiceChannelContacts',
    ]),
  },
  methods: {
    async onCancel() {
      await this.$router.back();
    },
    async onDelete() {
      const peopleInRoom = this.getVoiceChannelContacts(this.voiceChannel._id);
      if (peopleInRoom.length) {
        this.$store.commit('postNotification', {
          error: true,
          title: 'Error!',
          message: 'Can\'t close this Room. There are people in this room right now!',
        });
        await this.$router.back();
        return;
      }
      await this.$store.dispatch('deleteVoiceChannelOnServer', this.voiceChannel._id);
      await this.$router.back();
    },
  },
  async beforeMount() {
    this.voiceChannel = this.voiceChannelById(this.$route.params.roomId);
    if (!this.voiceChannel) {
      this.$store.commit('postNotification', {
        error: true,
        title: 'Error!',
        message: 'Room wasn\'t found',
      });
      await this.$router.back();
    }
  },
};
</script>

<style scoped lang="scss">
</style>
