<template>
  <div id="app" class="container main-wrapper">
    <transition appear name="fade">
      <router-view/>
    </transition>
    <app-toaster></app-toaster>
    <app-player></app-player>
    <app-audio-stream
      v-for="stream in activeStreams"
      :stream="stream"
      :key="stream.id"
    ></app-audio-stream>
  </div>
</template>

<script>
import Player from '@/audio-recorder/components/Player.vue';
import Toaster from '@/components/Toaster.vue';
import AudioStream from '@/components/AudioStream.vue';
import { mapGetters } from 'vuex';

export default {
  components: {
    appToaster: Toaster,
    appPlayer: Player,
    appAudioStream: AudioStream,
  },
  computed: {
    ...mapGetters([
      'activeStreams',
    ]),
  },
};
</script>

<style lang="scss">
html, body {
  height: 100vh;
  scrollbar-color: rgba(255,255,255, 0.2) rgba(255,255,255, 0.4); // firefox
  scrollbar-width: thin; // firefox
}

::-webkit-scrollbar {
  width: 12px;
}

::-webkit-scrollbar-track {
  -webkit-box-shadow: inset 0 0 6px 1px rgba(255,255,255,0.2);
  border-radius: 5px;
}

::-webkit-scrollbar-thumb {
  border-radius: 5px;
  -webkit-box-shadow: inset 0 0 6px 3px rgba(255,255,255,0.5);
}

::-webkit-scrollbar-corner {
  background: rgba(0,0,0,0);
}

body {
  background-color: #1e1e1e;
  color: #ccc;
}

.sub-page-modal {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100vw;
  background-color: rgba(255,255,255,0.2);

  & > .modal-form {
    width: 550px;
    max-height: 70vh;
    position: fixed;
    left: 50%;
    top: 50%;
    padding: 1em;
    transform: translate(-50%, -50%);
    box-shadow: 0 0 10px 10px rgba(255,255,255,0.5);
    border-radius: 10px;
    background-color: rgba(25,25,25,0.9);

    label {
      color: rgb(128, 128, 128);
    }
  }
}

.main-wrapper {
  max-width: 600px;
}

.header-text-button {
  border: none;
  background-color: inherit;
  font-size: 18px;
  color: #ccc;
}

footer {
  position: sticky;
  bottom: 0;
  margin-top: 20px;
}

.footer-button {
  margin-bottom: 20px;
}

.footer-links {
  padding: 20px 0;
  border-top: 1px solid rgb(128, 128, 128);
  background-color: rgb(38, 38, 38);
}

.avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
}

.avatar-button {
  background-color: transparent;
  background-image: none;
  padding-left: 9px;
  padding-right: 9px;
  border: none;
}

.group-title {
  font-size: 20px;
  margin-left: 10px;
  grid-column: 1 / -1;
  color: rgb(255, 255, 255);
}

input.form-control,
input.form-control:focus {
  background-color: rgba(89,89,89,1);
  color: rgba(166,166,166,1);
}

#app {
  height: 100vh;
  display: flex;
  flex-direction: column;
  text-align: center;
  color: #2c3e50;
}

.text-bright {
  color: rgba(255,255,255, 0.4);
}
</style>
