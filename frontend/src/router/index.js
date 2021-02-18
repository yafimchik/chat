import Vue from 'vue';
import VueRouter from 'vue-router';
import store from '@/store';
import SignUp from '@/views/SignUp.vue';
import SignIn from '@/views/SignIn.vue';
import Home from '@/views/home/Home.vue';
import Chat from '@/views/home/Chat.vue';
import VoiceChannel from '@/views/home/VoiceChannel.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '',
    component: Home,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'home',
        redirect: { name: 'chat' },
      },
      {
        path: 'chat',
        component: Chat,
        name: 'chat',
      },
      {
        path: 'voice-channel',
        name: 'voiceChannel',
        component: VoiceChannel,
      },
    ],
  },
  {
    path: '/sign-in',
    name: 'signIn',
    component: SignIn,
  },
  {
    path: '/sign-up',
    name: 'signUp',
    component: SignUp,
  },
  {
    path: '*',
    redirect: { name: 'home' },
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,

});

router.beforeEach((toR, fromR, next) => {
  if (toR.matched.some((route) => route.meta.requiresAuth) && (!store.getters.isLoggedIn)) {
    next({ name: 'signIn' });
  } else if (toR.path === '/signIn' && store.getters.isLoggedIn) {
    next({ name: 'home' });
  } else {
    next();
  }
});

export default router;
