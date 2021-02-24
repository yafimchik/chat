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
        placeholder="Enter your name"
        required
      ></b-form-input>
    </b-form-group>
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
import { mapGetters } from 'vuex';

export default {
  name: 'EntryForm',
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
    ...mapGetters([
      'isLoggedIn',
      'isSystemOnline',
    ]),
  },
  methods: {
    async onSubmit(event) {
      event.preventDefault();
      await this.entry();

      if (this.isSystemOnline) {
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
    async entry() {
      await this.$store
        .dispatch('initChatClient', {
          apiUrl,
          onUpdateCallback,
          onInputStreamCallback,
          onCloseConnectionCallback,
          onVoiceDetectionEventCallback,
        });

      const loginData = {
        user: this.form.username,
        password: this.form.password,
        noNotification: true,
      };

      await this.$store
        .dispatch('login', loginData);
      if (!this.isLoggedIn) {
        await this.$store
          .dispatch('register', loginData);
      }

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
