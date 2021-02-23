<template>
  <footer>
    <div class="d-grid gap-2 footer-button">
      <app-create-room-button></app-create-room-button>
    </div>
    <app-main-footer-links></app-main-footer-links>
  </footer>
</template>

<script>
import CreateRoomButton from '@/components/buttons/CreateRoomButton.vue';
import MainFooterLinks from '@/components/MainFooterLinks.vue';

export default {
  name: 'HomeFooter',
  components: {
    appCreateRoomButton: CreateRoomButton,
    appMainFooterLinks: MainFooterLinks,
  },
  data() {
    return {};
  },
};
</script>
