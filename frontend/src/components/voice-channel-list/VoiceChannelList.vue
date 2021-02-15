<template>
  <div class="voice-channel-list p-3">
    <b-list-group>
      <app-chat-name
        v-for="voiceChannel in voiceChannels"
        :voiceChannel="voiceChannel"
        :key="voiceChannel._id"
      ></app-chat-name>
    </b-list-group>
  </div>
</template>

<script>
import VoiceChannelName from '@/components/voice-channel-list/VoiceChannelName.vue';

export default {
  name: 'VoiceChannelList',
  data() {
    return {
    };
  },
  computed: {
    voiceChannels() {
      return this.$store.getters.voiceChannelsByCurrentVirtualServer;
    },
  },
  components: {
    appChatName: VoiceChannelName,
  },
};
</script>

<style scoped lang="scss">

</style>
