<template>
  <b-button
    :disabled="!currentRecord"
    class="delete-record"
    variant="outline-info"
    @click="deleteRecord"
  >
    <b-icon icon="file-earmark-x-fill" scale="2"></b-icon>
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
      this.$store.commit('saveRecord', null);
    },
  },
  computed: {
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
