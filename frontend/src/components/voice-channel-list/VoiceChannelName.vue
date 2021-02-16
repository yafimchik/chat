<template>
  <b-list-group-item
    button @click="onClick"
    :active="isListening"
    v-b-hover="hoverHandler"
    class="d-flex flex-row justify-content-between align-items-center"
  >
    <p>{{ voiceChannel.name }}</p>
    <b-badge variant="success" v-if="!isListening && isHovered">
      <b-icon icon="telephone-fill" aria-hidden="true"></b-icon>
    </b-badge>
    <b-badge variant="danger" v-if="isListening && isActive && isHovered">
      <b-icon icon="telephone-x-fill" aria-hidden="true"></b-icon>
    </b-badge>
  </b-list-group-item>
</template>

<script>
export default {
  name: 'VoiceChannelName',
  props: {
    voiceChannel: Object,
  },
  data() {
    return {
      isHovered: false,
    };
  },
  computed: {
    isActive() {
      return this.$route.name === 'voiceChannel';
    },
    isListening() {
      return (this.voiceChannel._id === this.$store.getters.currentVoiceChannelId);
    },
  },
  methods: {
    hoverHandler(isHovered) {
      this.isHovered = isHovered;
    },
    async onClick() {
      if (this.isListening) {
        if (this.isActive) {
          await this.$store.dispatch('disconnectFromVoiceChannel');
        } else {
          await this.$store.dispatch('setCurrentChat', undefined);
          await this.$router.push({ name: 'voiceChannel' });
        }
      } else {
        await this.$store.dispatch('connectToVoiceChannel', this.voiceChannel._id);
      }
    },
  },
};
</script>

<style scoped lang="scss">

</style>
