<template>
  <button class="close-form-button" type="button" @click="onClick">
    <b-icon icon="x" class="text-light"></b-icon>
  </button>
</template>

<script>
export default {
  name: 'CloseFormButton',
  data() {
    return {};
  },
  methods: {
    async onClick(event) {
      event.stopPropagation();
      if (this.$route.matched.length > 1) {
        // go to parent page
        await this.$router.push(this.$route.matched[this.$route.matched.length - 2]);
      } else {
        await this.$router.push(this.$store.getters.previousRoute);
      }
    },
  },
};
</script>

<style scoped lang="scss">
button.close-form-button {
  border-style: none;
  background-color: transparent;
  border-radius: 50%;
}
</style>
