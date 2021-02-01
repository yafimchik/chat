<template>
  <div class="d-flex flex-row flex-nowrap attached-files">
    <p class="mt-2">files:</p>
    <div class="w-100 d-flex flex-wrap">
      <app-file
        class="ml-2 mt-2"
        v-for="(item, index) of attachedFiles"
        :file="item"
        :index="index"
        :key="index"
      ></app-file>
    </div>
  </div>
</template>

<script>
import FileName from '@/components/chat/new-message/attaching-files/FileName.vue';

export default {
  name: 'AttachedFiles',
  data() {
    return {
    };
  },
  components: {
    appFile: FileName,
  },
  computed: {
    attachedFiles() {
      return this.$store.state.ui.attachedFiles;
    },
  },
};
</script>

<style scoped>
button > p {
  margin-bottom: 0;
}
</style>
