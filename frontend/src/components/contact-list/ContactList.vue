<template>
  <div class="contact p-3">
    <app-contact v-for="user in voiceChannelContacts" :user="user" :key="user._id">
    </app-contact>
    <div class="audio-streams" v-if="isListening">
      <app-audio-stream
        v-for="stream in activeStreams"
        :stream="stream"
        :key="stream.id"
      ></app-audio-stream>
    </div>
  </div>
</template>

<script>
import AudioStream from '@/components/contact-list/AudioStream.vue';
import UserName from '@/components/user-list/UserName.vue';

export default {
  name: 'ContactList',
  components: {
    appContact: UserName,
    appAudioStream: AudioStream,
  },
  props: {
    voiceChannel: Object,
  },
  data() {
    return {};
  },
  computed: {
    voiceChannelContacts() {
      return this.$store.getters.getVoiceChannelContacts(this.voiceChannel._id)
        .map((userId) => this.$store.getters.userById(userId));
    },
    isListening() {
      return this.$store.getters.currentVoiceChannelId === this.voiceChannel._id;
    },
    activeStreams() {
      console.log('activeStreams ', this.$store.getters.activeStreams);
      return this.$store.getters.activeStreams;
    },
    usersOnline() {
      return this.$store.getters.usersOnline;
    },
  },
};
</script>
