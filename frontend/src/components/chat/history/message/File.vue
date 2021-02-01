<template>
  <b-button class="file" variant="outline-info" href="">
    <p>{{ file.filename }}</p>
    <b-icon class="my-1" icon="file-earmark-check-fill" scale="1"></b-icon>
    <p>{{ file.size }}</p>
  </b-button>
</template>

<script>
import { apiUrl } from '@/configs/chat-connection.config';

export default {
  name: 'File',
  props: {
    file: { type: Object },
  },
  data() {
    return {};
  },
  methods: {},
  computed: {
    downloadLink() {
      return `${apiUrl}/files/${this.file._id}`;
    },
    size() {
      return `size: ${Math.round(this.audio.size * 10 / 1024 / 1024) / 10} Mb` ;
    },
  },
};
</script>
