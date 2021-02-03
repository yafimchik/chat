<template>
  <header>
    <b-navbar toggleable="lg" type="dark" variant="info">
      <b-navbar-brand href="#">{{ mainTitle }}</b-navbar-brand>

<!--      <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>-->

      <b-collapse id="nav-collapse" is-nav>
<!--        <b-navbar-nav>-->
<!--          <b-nav-item href="#">Link</b-nav-item>-->
<!--          <b-nav-item href="#" disabled>Disabled</b-nav-item>-->
<!--        </b-navbar-nav>-->

<!--        &lt;!&ndash; Right aligned nav items &ndash;&gt;-->
        <b-navbar-nav class="ml-auto">
<!--          <b-nav-form>-->
<!--            <b-form-input size="sm" class="mr-sm-2" placeholder="Search"></b-form-input>-->
<!--            <b-button size="sm" class="my-2 my-sm-0" type="submit">Search</b-button>-->
<!--          </b-nav-form>-->

<!--          <b-nav-item-dropdown text="Lang" right>-->
<!--            <b-dropdown-item href="#">EN</b-dropdown-item>-->
<!--            <b-dropdown-item href="#">ES</b-dropdown-item>-->
<!--            <b-dropdown-item href="#">RU</b-dropdown-item>-->
<!--            <b-dropdown-item href="#">FA</b-dropdown-item>-->
<!--          </b-nav-item-dropdown>-->

          <b-nav-item-dropdown right>
            <!-- Using 'button-content' slot -->
            <template #button-content>
              <b-icon v-if="!isLoggedIn" icon="person-circle" scale="2"></b-icon>
              <em v-if="isLoggedIn">{{ userButtonTitle }}</em>
            </template>
<!--            <b-dropdown-item href="#">Profile</b-dropdown-item>-->
            <b-dropdown-item
              href="#"
              @click="onUserButtonAction"
            >
              {{ userAction }}
            </b-dropdown-item>
          </b-nav-item-dropdown>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
  </header>
</template>

<script>
export default {
  name: 'Header',
  props: {
    title: String,
  },
  data() {
    return {
      mainTitle: this.title ? this.title : 'Chat',
      userAction: '',
    };
  },
  computed: {
    isLoggedIn() {
      return this.$store.getters.isLoggedIn;
    },
    userName() {
      return this.isLoggedIn ? this.$store.state.chatData.user.username : undefined;
    },
    userButtonTitle() {
      return this.userName ? this.userName : 'Menu';
    },
  },
  mounted() {
    this.userAction = this.userButtonAction();
  },
  methods: {
    userButtonAction() {
      const signInUp = (this.$router.currentRoute.name === 'signIn') ? 'Sign Up' : 'Sign In';
      return this.isLoggedIn ? 'sign out' : signInUp;
    },
    async onUserButtonAction() {
      if (this.isLoggedIn) {
        await this.$router.push({ name: 'signIn' });
        await this.$store.dispatch('logout');
      } else if (this.$router.currentRoute.name === 'signIn') {
        await this.$router.push({ name: 'signUp' });
      } else {
        await this.$router.push({ name: 'signIn' });
      }

      this.userAction = this.userButtonAction();
    },
  },
  watch: {
    isLoggedIn() {
      this.userAction = this.userButtonAction();
    },
  },
};
</script>

<style scoped lang="scss">

</style>
