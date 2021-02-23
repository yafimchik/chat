<template>
  <b-form
    class="h-100 w-100 d-flex flex-column justify-content-center align-items-stretch"
    @submit="onSubmit"
    @reset="onReset"
    v-if="show"
  >
    <b-form-group id="input-group-2" label="Room Title:" label-for="input-2">
      <b-form-input
        id="input-2"
        v-model="roomTitle"
        placeholder="Enter title"
        required
      ></b-form-input>
    </b-form-group>
    <div class="my-1 buttons d-flex">
      <b-button class="col-5" type="reset" variant="danger">Reset</b-button>
      <b-button class="offset-2 col-5" type="submit" variant="primary">Create</b-button>
    </div>
  </b-form>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'NewRoomForm',
  components: {
  },
  data() {
    return {
      roomTitle: '',
      show: true,
    };
  },
  computed: {
    ...mapGetters({
      isOnline: 'isSystemOnline',
      chatClient: 'chatEngine',
      virtualServer: 'currentVirtualServerId',
    }),
  },
  methods: {
    async onSubmit(event) {
      event.preventDefault();
      await this.createRoom();

      if (this.isOnline) {
        await this.$router.push({ name: 'home' });
      }
    },
    onReset(event) {
      event.preventDefault();
      this.roomTitle = '';
      // Trick to reset/clear native browser form validation state
      this.show = false;
      this.$nextTick(() => {
        this.show = true;
      });
    },
    async createRoom() {
      if (this.isOnline) {
        await this.chatClient.createVoiceChannel(this.virtualServer, this.roomTitle);
      }
    },
  },
};
</script>

<style scoped>
form {
  width: 80%;
  max-width: 600px;
}
</style>
