<template>
  <div class="page sign-in flex-grow-1">
    <app-main-header></app-main-header>
    <div class="">
      <div class="w-100 h-100 d-flex justify-content-center align-items-center">
        <app-login-form></app-login-form>
      </div>
    </div>
    <app-main-footer></app-main-footer>
  </div>
</template>

<script>
import LoginForm from '@/views/sign-in/components/LoginForm.vue';
import MainHeader from '@/components/MainHeader.vue';
import MainFooter from '@/components/MainFooter.vue';

export default {
  name: 'signIn',
  components: {
    appMainHeader: MainHeader,
    appLoginForm: LoginForm,
    appMainFooter: MainFooter,
  },
  async beforeDestroy() {
    await this.$store.dispatch('initializeAllChatUI');
  },
};
</script>
