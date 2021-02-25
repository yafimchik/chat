import store from '@/store';
import {
  AUTHORIZATION_ROUTES,
  DEFAULT_NON_AUTH_PAGE_NAME,
  DEFAULT_REDIRECT_PAGE_NAME,
} from '@/configs/view.config';

export function afterEachRoute(toR) {
  store.commit('pushRoute', toR);
}

export function beforeEachRoute(toR, fromR, next) {
  if (!store.getters.currentRoute) store.commit('pushRoute', toR);

  if (toR.matched.some((route) => route.meta.requiresAuth) && (!store.getters.isLoggedIn)) {
    next({ name: DEFAULT_NON_AUTH_PAGE_NAME });
  } else if (AUTHORIZATION_ROUTES.includes(toR.name) && store.getters.isLoggedIn) {
    next({ name: DEFAULT_REDIRECT_PAGE_NAME });
  } else {
    next();
  }
}
