<template>
  <b-form
    class="w-100 d-flex flex-column justify-content-center align-items-stretch"
    @submit="onSubmit"
    v-if="show"
  >
    <b-form-group id="input-group-2" label="New room name:" label-for="input-2">
      <b-form-input
        id="input-2"
        v-model="roomTitle"
        placeholder="Enter title"
        required
        v-focus
        @keydown.esc="onEsc"
      ></b-form-input>
    </b-form-group>
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
    async createRoom() {
      if (this.isOnline) {
        await this.$store.dispatch('createVoiceChannelOnServer', this.roomTitle);
      }
    },
    async onEsc() {
      await this.$router.push(this.$store.getters.previousRoute);
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
