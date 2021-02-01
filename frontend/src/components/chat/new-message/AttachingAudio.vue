<template>
  <div class="d-flex flex-row justify-content-end">
    <app-mic class="mr-2"></app-mic>
    <app-play class="mr-2"></app-play>
    <app-delete class="mr-2"></app-delete>
  </div>
</template>

<script>
import Microphone from '@/audio-recorder/components/Microphone.vue';
import Play from '@/audio-recorder/components/Play.vue';
import DeleteRecord from '@/audio-recorder/components/DeleteRecord.vue';

export default {
  name: 'AttachingAudio',
  data() {
    return {};
  },
  components: {
    appMic: Microphone,
    appPlay: Play,
    appDelete: DeleteRecord,
  },
};
</script>
