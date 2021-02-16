<template>
  <div class="voice-channel-list p-3">
    <b-list-group>
      <template v-for="voiceChannel in voiceChannels">
        <app-chat-name
          :voiceChannel="voiceChannel"
          :key="voiceChannel._id"
        ></app-chat-name>
        <app-contact-list :voiceChannel="voiceChannel" :key="voiceChannel._id"></app-contact-list>
      </template>
    </b-list-group>
  </div>
</template>

<script>
import VoiceChannelName from '@/components/voice-channel-list/VoiceChannelName.vue';
import ContactList from '@/components/contact-list/ContactList.vue';

export default {
  name: 'VoiceChannelList',
  components: {
    appContactList: ContactList,
    appChatName: VoiceChannelName,
  },
  data() {
    return {
    };
  },
  computed: {
    voiceChannels() {
      return this.$store.getters.voiceChannelsByCurrentVirtualServer;
    },
  },
};
</script>

<style scoped lang="scss">

</style>
