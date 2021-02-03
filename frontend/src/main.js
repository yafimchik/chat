import Vue from 'vue';
import moment from 'moment';
import {
  BootstrapVue,
  IconsPlugin,
  SidebarPlugin,
  ToastPlugin,
  FormFilePlugin,
  BadgePlugin,
  TooltipPlugin,
} from 'bootstrap-vue';
// Import Bootstrap an BootstrapVue CSS files (order is important)
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import App from './App.vue';
// import './registerServiceWorker'; //PWA
import router from './router';
import store from './store';

// Make BootstrapVue available throughout your project
Vue.use(BootstrapVue);
Vue.use(FormFilePlugin);
Vue.use(IconsPlugin);
Vue.use(SidebarPlugin);
Vue.use(ToastPlugin);
Vue.use(BadgePlugin);
Vue.use(TooltipPlugin);

Vue.config.productionTip = false;

Vue.filter('myDate', (value) => {
  if (!value) return '';
  return moment(String(value)).format('DD.MM.YYYY hh:mm:ss');
});

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
