<template>
  <b-card
    header="Files:"
    header-tag="header"
  >
    <div class="row">
      <app-file v-for="fileItem in files" :file="fileItem"></app-file>
    </div>
  </b-card>
</template>

<script>

import File from '@/components/chat/history/message/File.vue';

export default {
  name: 'Audio',
  components: {
    appFile: File,
  },
  props: {
    files: { type: Array },
  },
  data() {},
};
</script>
