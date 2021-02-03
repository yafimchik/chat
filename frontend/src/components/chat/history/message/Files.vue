<template>
  <div>
    <div class="w-100 d-flex flex-row-reverse">
      <b-button
        class="d-block"
        variant="info"
        @click="visibility=!visibility"
      >Attached files</b-button>
    </div>
    <div class="files d-flex flow-column align-items-stretch">
      <b-collapse v-model="visibility" class="mt-2">
        <b-card>
          <app-file v-for="(fileItem, index) of files" :file="fileItem" :key="index"></app-file>
        </b-card>
      </b-collapse>
    </div>
  </div>
</template>

<script>
import File from '@/components/chat/history/message/File.vue';

export default {
  name: 'Files',
  components: {
    appFile: File,
  },
  props: {
    files: { type: Array },
  },
  data() {
    return {
      visibility: false,
    };
  },
};
</script>
