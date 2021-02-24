<template>
  <div class="page sign-up flex-grow-1">
    <app-main-header></app-main-header>
    <div class="">
      <div class="w-100 h-100 d-flex justify-content-center align-items-center">
        <app-register-form></app-register-form>
      </div>
    </div>
    <app-main-footer></app-main-footer>
  </div>
</template>

<script>
import MainHeader from '@/components/MainHeader.vue';
import MainFooter from '@/components/MainFooter.vue';
import RegisterForm from '@/views/sign-up/components/RegisterForm.vue';

export default {
  name: 'signUp',
  components: {
    appMainHeader: MainHeader,
    appRegisterForm: RegisterForm,
    appMainFooter: MainFooter,
  },
  async beforeDestroy() {
    await this.$store.dispatch('initializeAllChatUI');
  },
};
</script>
