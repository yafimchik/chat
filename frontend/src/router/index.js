import Vue from 'vue';
import VueRouter from 'vue-router';
import SignIn from '@/views/sign-in/SignIn.vue';
import SignUp from '@/views/sign-up/SignUp.vue';
import FreeUsers from '@/views/free-users/FreeUsers.vue';
import Entry from '@/views/sign-in-up/Entry.vue';
import { afterEachRoute, beforeEachRoute } from '@/router/router.hooks';
import { roomsRoutes } from '@/router/rooms.routes';

Vue.use(VueRouter);

const routes = [
  {
    path: '/entry',
    name: 'entry',
    component: Entry,
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
    path: '',
    name: 'home',
    redirect: { name: 'rooms' },
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

router.addRoutes(roomsRoutes);

router.beforeEach(beforeEachRoute);

router.afterEach(afterEachRoute);

export default router;
