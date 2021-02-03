<template>
  <div id="app" class="container-fluid">
    <app-header></app-header>
    <router-view/>
    <app-toaster></app-toaster>
    <app-player></app-player>
  </div>
</template>

<script>
import Header from './components/Header.vue';
import Toaster from './components/Toaster.vue';
import Player from '@/audio-recorder/components/Player.vue';

export default {
  components: {
    appHeader: Header,
    appToaster: Toaster,
    appPlayer: Player,
  },
};
</script>

<style lang="scss">
  html {
    height: 100vh;
  }
  body {
    height: 100vh;
    //display: grid;
    //grid-template-columns: 100%;
    //grid-template-rows: 1fr;
    //justify-items: stretch;
    //align-items: center;
  }

  #app {
    height: 100vh;
    display: flex;
    flex-direction: column;

    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
  }

  #nav {
    padding: 30px;

    a {
      font-weight: bold;
      color: #2c3e50;

      &.router-link-exact-active {
        color: #42b983;
      }
    }
  }
</style>
