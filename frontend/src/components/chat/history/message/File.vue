<template>
  <div>
    <div
      class="file row mb-2"
    >
      <p
        class="file-name mb-0 col-8 p-0"
        v-b-tooltip.hover
        :title="file.filename"
      >
        {{ file.filename }}
      </p>
      <p class="mb-0 col-3 p-0"><b>{{ size }} Mb</b></p>
      <div class="col-1 p-0">
        <b-button
          class="d-flex align-items-center justify-content-center p-1"
          variant="outline-info"
          @click="download"
        >
          <b-icon icon="download" scale="1"></b-icon>
        </b-button>
      </div>
    </div>
    <a ref="downloadAnchor" href="" v-b-visible="false"></a>
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
          const blob = new Blob([dataView], { type: mime.lookup(this.file.filename) });
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
        this.$store.commit('postNotification', {
          error: true,
          message: 'File download error!',
        });
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

<style scoped lang="scss">
div.file {
  p {
    white-space: nowrap;
  }
  p.file-name {
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

</style>
