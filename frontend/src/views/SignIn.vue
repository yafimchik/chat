<template>
  <div class="flex-grow-1">
    <div class="w-100 h-100 d-flex justify-content-center align-items-center">
      <b-form
        class="h-100 d-flex flex-column justify-content-center align-items-stretch"
        @submit="onSubmit"
        @reset="onReset"
        v-if="show"
      >
        <!--      <b-form-group-->
        <!--        id="input-group-1"-->
        <!--        label="Email address:"-->
        <!--        label-for="input-1"-->
        <!--        description="We'll never share your email with anyone else."-->
        <!--      >-->
        <!--        <b-form-input-->
        <!--          id="input-1"-->
        <!--          v-model="form.email"-->
        <!--          type="email"-->
        <!--          placeholder="Enter email"-->
        <!--          required-->
        <!--        ></b-form-input>-->
        <!--      </b-form-group>-->

        <b-form-group id="input-group-2" label="Your Name:" label-for="input-2">
          <b-form-input
            id="input-2"
            v-model="form.username"
            placeholder="Enter name"
            required
          ></b-form-input>
        </b-form-group>

        <!--      <b-form-group id="input-group-3" label="password:" label-for="input-3">-->
        <!--        <b-form-input-->
        <!--          id="input-3"-->
        <!--          v-model="form.password"-->
        <!--          placeholder="Enter password"-->
        <!--          type="password"-->
        <!--        ></b-form-input>-->
        <!--      </b-form-group>-->

        <div class="buttons">
          <b-button type="reset" variant="danger">Reset</b-button>
          <b-button class="ml-2" type="submit" variant="primary">Sign In</b-button>
<!--  <b-button type="button" variant="outline-primary" @click="goSignUp">Sign Up</b-button>-->
        </div>
      </b-form>
    </div>
  </div>
</template>

<script>
import {
  onUpdateCallback,
  onInputStreamCallback,
  onCloseConnectionCallback,
  onVoiceDetectionEventCallback,
} from '@/vue-utils/chat-callbacks';
import { apiUrl } from '../configs/chat-connection.config';

export default {
  name: 'signIn',
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
    },
    onReset(event) {
      event.preventDefault();
      // Reset our form values
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

      if (this.isOnline) {
        await this.$router.push({ name: 'home' });
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
