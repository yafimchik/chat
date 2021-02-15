<template>
  <div class="my-2 d-flex flex-row align-items-center justify-content-end">
    <h6 class="alert-heading mb-0">{{ name }}</h6>
    <div class="pl-3">
      <b-avatar variant="primary" :text="initials"></b-avatar>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserName',
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
