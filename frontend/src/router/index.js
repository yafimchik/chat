import Vue from 'vue';
import VueRouter from 'vue-router';
import store from '@/store';
import Home from '@/views/home/Home.vue';
import Chat from '@/views/room/chat/Chat.vue';
import SignIn from '@/views/sign-in/SignIn.vue';
import SignUp from '@/views/sign-up/SignUp.vue';
import FreeUsers from '@/views/free-users/FreeUsers.vue';
import Room from '@/views/room/Room.vue';
import CreateRoom from '@/views/create-room/CreateRoom.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '',
    component: Home,
    name: 'home',
    meta: { requiresAuth: true },

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
    path: '/free-users',
    name: 'freeUsers',
    component: FreeUsers,
    meta: { requiresAuth: true },
  },
  {
    path: '/room',
    component: Room,
    name: 'room',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'chat',
        component: Chat,
        name: 'chat',
      },
    ],
  },
  {
    path: '/create-room',
    name: 'createRoom',
    component: CreateRoom,
    meta: { requiresAuth: true },
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
