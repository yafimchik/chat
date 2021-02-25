<template>
  <header class="d-flex justify-content-center align-items-center">
    <div class="logo me-3"><img src="/img/logo.png" alt="logo"></div>
    <div class="main-title">{{ mainTitle }}</div>
  </header>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'MainHeader',
  data() {
    return {};
  },
  computed: {
    ...mapGetters([
      'mainTitle',
    ]),
  },
};
</script>

<style scoped lang="scss">
header {
  margin: 25px auto;
}

.logo img {
  width: auto;
  height: 80px;
}

.main-title {
  font-weight: bold;
  font-size: 35px;
  color: #ccc;
}
</style>
