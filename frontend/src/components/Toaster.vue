<template>
  <div class="toaster"></div>
</template>

<script>
export default {
  data() {
    return {};
  },
  computed: {
    notification() {
      return this.$store.state.notification;
    },
  },
  watch: {
    notification(value) {
      if (!value) return;
      if (value.error) {
        if (value.serverError) {
          this.showError('Server Error!');
        } else {
          this.showError('Connection Error!');
        }
        return;
      }
      this.showNotification(value.message, value.title);
    },
  },
  methods: {
    showError(message, title) {
      this.showToast({
        message,
        title,
        variant: 'danger',
        autoHideDelay: 2500
      });
    },
    showNotification(message, title) {
      this.showToast({
        message,
        title,
        variant: 'secondary'
      });
    },
    showToast({
                message = 'text',
                title = 'Attention!',
                variant = 'secondary',
                solid = true,
                autoHideDelay = 1500,
    }) {
      this.$bvToast.toast(message, {
        title,
        variant,
        solid,
        autoHideDelay,
      });
    },
  },
}
</script>
