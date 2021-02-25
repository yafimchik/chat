<template>
  <div class="sub-page-modal create-room">
    <div class="modal-form">
      <div class="d-flex justify-content-end">
        <app-close-form-button></app-close-form-button>
      </div>
      <slot></slot>
    </div>
  </div>
</template>

<script>
import CloseFormButton from '@/components/buttons/CloseFormButton.vue';

export default {
  name: 'SubPageModal',
  components: {
    appCloseFormButton: CloseFormButton,
  },
};
</script>

<style scoped lang="scss">
</style>
