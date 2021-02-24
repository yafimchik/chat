<template>
  <div class="page sign-in flex-grow-1">
    <app-main-header></app-main-header>
    <div class="">
      <div class="w-100 h-100 d-flex justify-content-center align-items-center">
        <app-entry-form></app-entry-form>
      </div>
    </div>
    <app-main-footer></app-main-footer>
  </div>
</template>

<script>
import MainHeader from '@/components/MainHeader.vue';
import MainFooter from '@/components/MainFooter.vue';
import EntryForm from '@/views/sign-in-up/components/EntryForm.vue';

export default {
  name: 'Entry',
  components: {
    appMainHeader: MainHeader,
    appEntryForm: EntryForm,
    appMainFooter: MainFooter,
  },
  async beforeDestroy() {
    await this.$store.dispatch('initializeAllChatUI');
  },
};
</script>
