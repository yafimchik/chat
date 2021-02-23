<template>
  <div class="sub-text">{{ user.username }}</div>
</template>

<script>
export default {
  name: 'UserName',
  props: {
    user: Object,
  },
  data() {
    return {};
  },
};
</script>

<style scoped lang="scss">
.sub-text {
  text-align: left;
  margin-top: 5px;
}
</style>
