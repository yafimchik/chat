<template>
  <b-list-group-item
    button @click="onClick"
    :active="isActive"
    v-b-hover="hoverHandler"
    class="d-flex flex-row justify-content-between align-items-center"
  >
    <p>{{ voiceChannel.name }}</p>
    <b-badge variant="success" v-if="!isActive && isHovered">
      <b-icon icon="telephone-fill" aria-hidden="true"></b-icon>
    </b-badge>
    <b-badge variant="danger" v-if="isActive && isHovered">
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
      return (this.voiceChannel._id === this.$store.getters.currentVoiceChannelId);
    },
  },
  methods: {
    hoverHandler(isHovered) {
      this.isHovered = isHovered;
    },
    async onClick() {
      await this.$store.dispatch('connectToVoiceChannel', this.voiceChannel._id);
      if (this.$router.currentRoute.name !== 'voiceChannel') {
        await this.$router.push({ name: 'voiceChannel' });
      }
    },
  },
};
</script>

<style scoped lang="scss">

</style>
