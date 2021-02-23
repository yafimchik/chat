<template>
  <div class="toaster"></div>
</template>

<script>
export default {
  name: 'Toaster',
  data() {
    return {};
  },
  computed: {
    notification() {
      return this.$store.state.ui.notification;
    },
  },
  watch: {
    notification(value) {
      if (!value) return;
      if (value.error) {
        if (value.serverError) {
          this.showError('Server Error!');
        } else {
          this.showError(value.message, value.title);
        }
        return;
      }
      this.showNotification(value.message, value.title);
    },
  },
  methods: {
    showError(message = 'ConnectionError', title) {
      this.showToast({
        message,
        title,
        variant: 'danger',
        autoHideDelay: 3000,
      });
    },
    showNotification(message, title) {
      this.showToast({
        message,
        title,
        variant: 'secondary',
      });
    },
    showToast(
      {
        message = 'text',
        title = 'Attention!',
        variant = 'secondary',
        solid = true,
        autoHideDelay = 2000,
      },
    ) {
      this.$bvToast.toast(message, {
        title,
        variant,
        solid,
        autoHideDelay,
      });
    },
  },
};
</script>
