<template>
  <footer>
    <app-main-footer-links></app-main-footer-links>
  </footer>
</template>

<script>
import MainFooterLinks from '@/components/MainFooterLinks.vue';

export default {
  name: 'MainFooter',
  components: {
    appMainFooterLinks: MainFooterLinks,
  },
  data() {
    return {};
  },
};
</script>
