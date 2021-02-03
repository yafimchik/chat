<template>
  <b-form-file
    v-model="files"
    multiple
    :file-name-formatter="getFormatNames"
    placeholder="Choose a file or drop it here..."
    drop-placeholder="Drop file here..."
    @input="onInput"
    variant="outline-info"
  ></b-form-file>
</template>

<script>
export default {
  name: 'AttachFile',
  data() {
    return {
      files: [],
    };
  },
  methods: {
    onInput() {
      this.$store.commit('setAttachedFiles', this.files);
    },
    getFormatNames() {
      const count = this.files ? this.files.length : 0;
      return count === 1 ? this.files[0].name : `${count} files selected`;
    },
  },
  computed: {
    attachedFiles() {
      return this.$store.state.ui.attachedFiles;
    },
  },
  watch: {
    attachedFiles() {
      this.files = [...this.attachedFiles];
    },
  },
};
</script>

<style scoped>
button > p {
  margin-bottom: 0;
}
</style>
