<template>
  <div
    class="file d-flex flex-row flex-nowrap justify-content-between align-items-center mb-2"
  >
    <div class="d-flex flex-row flex-nowrap align-items-center">
      <p
        class="mb-0 flex-grow-1"
        v-b-tooltip.hover
        :title="file.filename"
      >
        {{ shortName }}
      </p>
      <a ref="downloadAnchor" href="" v-b-visible="false"></a>
      <p class="mb-0"><b>size: {{ size }} Mb</b></p>
    </div>
    <b-button class="file ml-2" variant="outline-info" @click="download">
      <b-icon icon="download" scale="1"></b-icon>
    </b-button>
  </div>
</template>

<script>
import { apiUrl } from '@/configs/chat-connection.config';
import mime from 'mime-types';

export default {
  name: 'File',
  props: {
    file: { type: Object },
  },
  data() {
    return {
      downloadLink: undefined,
    };
  },
  beforeDestroy() {
    window.URL.revokeObjectURL(this.downloadLink);
  },
  methods: {
    async download() {
      if (this.downloadLink) {
        this.$refs.downloadAnchor.click();
        return;
      }
      try {
        const response = await fetch(`${apiUrl}/files/${this.file._id}`, {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        });
        let buffer;
        if (response.ok) buffer = await response.arrayBuffer();
        if (buffer) {
          const dataView = new DataView(buffer);
          console.log(mime.lookup(this.file.filename));
          const blob = new Blob([dataView], { type: mime.lookup(this.file.filename) });
          console.log('blob ', blob);
          if (window.navigator.msSaveOrOpenBlob) { // IE10+
            window.navigator.msSaveOrOpenBlob(blob, this.file.filename);
          } else { // Others
            this.downloadLink = URL.createObjectURL(blob);
            this.$refs.downloadAnchor.href = this.downloadLink;
            this.$refs.downloadAnchor.download = this.file.filename;
            this.$refs.downloadAnchor.click();
          }
        }
      } catch (e) {
        console.error(e);
      }
    },
  },
  computed: {
    token() {
      return this.$store.state.chatData.token;
    },
    size() {
      return Math.round((this.file.size * 100) / 1024 / 1024) / 100;
    },
    shortName() {
      let name = this.file.filename;
      if (!name) name = '';
      return name.length > 20 ? `${name.slice(0, 20)}...` : name;
    },
  },
};
</script>

<style scoped>
button > p {
  word-wrap: break-word;
}
</style>
