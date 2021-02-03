<template>
  <b-button
    :disabled="!currentRecord"
    class="delete-record"
    variant="outline-info"
    @click="deleteRecord"
  >
    <b-icon icon="x-circle-fill" scale="1"></b-icon>
  </b-button>
</template>

<script>
export default {
  data() {
    return {
    };
  },
  methods: {
    deleteRecord() {
      if (this.isOnPlayer) {
        this.$store.dispatch('stopPlay');
      }
      this.$store.commit('saveRecord', null);
    },
  },
  computed: {
    isOnPlayer() {
      if (!this.downloadLink) return false;
      return (this.downloadLink === this.playerSource);
    },
    playerSource() {
      return this.$store.state.audio.playerSource;
    },
    downloadLink() {
      if (!this.currentRecord) return undefined;
      return this.currentRecord.url;
    },
    currentRecord() {
      return this.$store.state.audio.currentRecord;
    },
  },
};
</script>

<style scoped>
button > p {
  margin-bottom: 0;
}
</style>
