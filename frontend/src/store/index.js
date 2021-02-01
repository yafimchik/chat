import Vue from 'vue';
import Vuex from 'vuex';
import audioStore from '@/audio-recorder/store/audio.store';
import uiStore from './ui.store';
import chatDataStore from './chat-data.store';
import chatEngineStore from './chat-engine.store';

Vue.use(Vuex);

const DEFAULT_STATE = () => ({
});

export default new Vuex.Store({
  state: DEFAULT_STATE(),
  modules: {
    audio: audioStore,
    ui: uiStore,
    chatEngine: chatEngineStore,
    chatData: chatDataStore,
  },
});
