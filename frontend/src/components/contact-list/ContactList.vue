<template>
  <div class="contact p-3">
    <app-contact
      v-for="(item, index) in contactsWithStreams"
      :user="item.user" :key="index" :stream="item.stream"
    ></app-contact>
  </div>
</template>

<script>
import Contact from '@/components/contact-list/Contact.vue';

export default {
  name: 'ContactList',
  components: {
    appContact: Contact,
  },
  data() {
    return {};
  },
  computed: {
    contactsWithStreams() {
      return this.$store.getters.contactsWithStreams
        .map(({ contact, stream }) => ({
          contact,
          stream,
          user: this.$store.getters.userById(contact),
        }));
    },
    users() {
      return this.$store.getters.usersOnline;
    },
  },
};
</script>

<style scoped lang="scss">

</style>
