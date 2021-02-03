<template>
  <div>
    <app-attach-file></app-attach-file>
    <app-attached-files></app-attached-files>
  </div>
</template>

<script>
import AttachFile from '@/components/chat/new-message/attaching-files/AttachFile.vue';
import AttachedFiles from '@/components/chat/new-message/attaching-files/AttachedFiles.vue';

export default {
  name: 'AttachingFiles',
  data() {
    return {};
  },
  components: {
    appAttachFile: AttachFile,
    appAttachedFiles: AttachedFiles,
  },
};
</script>
