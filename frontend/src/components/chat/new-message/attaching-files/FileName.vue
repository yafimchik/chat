<template>
  <b-button
    class="d-flex flex-row align-items-center"
    variant="outline-secondary"
    @click="onDelete"
  >
    <p class="mr-2">{{ shortName }}</p>
    <b-icon icon="x" variant="danger"  scale="2"></b-icon>
  </b-button>
</template>

<script>
export default {
  name: 'FileName',
  props: {
    file: { type: Object },
    index: { type: Number },
  },
  data() {
    return {
      files: undefined,
    };
  },
  methods: {
    onDelete() {
      const files = [...this.attachedFiles];
      files.splice(this.index, 1);
      this.$store.commit('setAttachedFiles', files);
    },
  },
  computed: {
    attachedFiles() {
      return this.$store.state.ui.attachedFiles;
    },
    shortName() {
      return this.file.name.length > 30 ? `${this.file.name.slice(0, 30)}...` : this.file.name;
    },
  },
};
</script>

<style scoped>
button > p {
  margin-bottom: 0;
}
</style>
