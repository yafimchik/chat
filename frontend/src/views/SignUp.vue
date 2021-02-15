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
          <b-button class="ml-2" type="submit" variant="primary">Sign Up</b-button>
<!--      <b-button type="button" variant="outline-primary" @click="goSignIn">Sign In</b-button>-->
        </div>
      </b-form>
    </div>
  </div>
</template>

<script>
import { onUpdateCallback, onInputStreamCallback } from '@/vue-utils/chat-callbacks';
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
    chatClient() {
      return this.$store.state.chatEngine.chatClient;
    },
  },
  methods: {
    async goSignIn() {
      await this.$router.push({ name: 'signIn' });
    },
    async onSubmit(event) {
      event.preventDefault();
      await this.signUp();
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
    async signUp() {
      if (!this.chatClient) {
        this.$store.commit('createChatEngine', { apiUrl, onUpdateCallback, onInputStreamCallback });
      }
      if (!this.chatClient) {
        // TODO LOGIN ERROR modal form
        console.log('chat client error');
        return;
      }
      const result = await this.chatClient.register(
        this.form.username,
        this.form.password,
      );
      if (!result) {
        // TODO LOGIN ERROR modal form
        console.log('login error');
        return;
      }
      this.$store.commit('saveUser', result.user);
      this.$store.commit('saveToken', result.token);
      this.$store.commit('setVirtualServers', result.virtualServers);

      const connected = await this.chatClient.connect();
      if (!connected) {
        console.log('connection error');
        // TODO connection ERROR modal form
        return;
      }

      await this.$router.push({ name: 'home' });
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
