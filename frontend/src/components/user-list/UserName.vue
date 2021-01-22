<template>
  <b-list-group-item class="mx-2 d-flex flex-row align-items-center">
    <h6 class="alert-heading">{{ name }}</h6>
    <b-avatar class="ml-2" variant="primary" :text="initials"></b-avatar>
  </b-list-group-item>
</template>

<script>
export default {
  name: 'ChatName',
  props: {
    user: Object,
  },
  data() {
    return {
    };
  },
  computed: {
    name() {
      return this.user.username;
    },
    initials() {
      const { name } = this;
      if (!name) return '';
      if (typeof name !== 'string') return '';
      return name.split(' ')
        .map((word) => word.toUpperCase()[0]).splice(0, 2).join('');
    },
  },
};
</script>

<style scoped lang="scss">

</style>
