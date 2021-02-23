<template>
  <b-form
    class="h-100 w-100 d-flex flex-column justify-content-center align-items-stretch"
    @submit="onSubmit"
    @reset="onReset"
    v-if="show"
  >
    <b-form-group id="input-group-2" label="Your Name:" label-for="input-2">
      <b-form-input
        id="input-2"
        v-model="form.username"
        placeholder="Enter name"
        required
      ></b-form-input>
    </b-form-group>
    <div class="my-1 buttons d-flex">
      <b-button class="col-5" type="reset" variant="danger">Reset</b-button>
      <b-button class="offset-2 col-5" type="submit" variant="primary">Sign In</b-button>
    </div>
  </b-form>
</template>

<script>
import { apiUrl } from '@/configs/chat-connection.config';
import {
  onCloseConnectionCallback,
  onInputStreamCallback,
  onUpdateCallback,
  onVoiceDetectionEventCallback,
} from '@/vue-utils/chat-callbacks';

export default {
  name: 'LoginForm',
  components: {
  },
  data() {
    return {
      form: {
        username: '',
        password: '',
      },
      show: true,
    };
  },
  computed: {
    isOnline() {
      return this.$store.getters.isSystemOnline;
    },
  },
  methods: {
    async onSubmit(event) {
      event.preventDefault();
      await this.signIn();

      if (this.isOnline) {
        await this.$router.push({ name: 'home' });
      }
    },
    onReset(event) {
      event.preventDefault();
      this.form.username = '';
      this.form.password = '';
      // Trick to reset/clear native browser form validation state
      this.show = false;
      this.$nextTick(() => {
        this.show = true;
      });
    },
    async signIn() {
      await this.$store
        .dispatch('initChatClient', {
          apiUrl,
          onUpdateCallback,
          onInputStreamCallback,
          onCloseConnectionCallback,
          onVoiceDetectionEventCallback,
        });

      await this.$store
        .dispatch('login', { user: this.form.username, password: this.form.password });

      await this.$store
        .dispatch('connectToServer');
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
