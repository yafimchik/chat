import Vue from 'vue';
import VueRouter from 'vue-router';
import store from '@/store';
import SignUp from '@/views/SignUp.vue';
import SignIn from '../views/SignIn.vue';
import Home from '../views/Home.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '',
    name: 'home',
    component: Home,
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
    console.log('redirect to login?');
    next({ name: 'signIn' });
    return;
  }
  if (toR.path === '/signIn' && store.getters.isLoggedIn) {
    console.log('redirect to home?');
    next({ name: 'home' });
    return;
  }
  console.log('straight');
  next();
});

export default router;
