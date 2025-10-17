import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { LoginService } from '../services/login.service';
import { AppRoutes } from '../app.routes';
import { AppStore } from '../stores/app.store';
import { CacheKeys, CacheService } from '../services/cache.service';

export const authGuard: CanActivateFn = (route, state) => {
  const loginService = inject(LoginService);
  const appStore = inject(AppStore);
  const cacheService = inject(CacheService);
  const router = inject(Router);

  if (cacheService.getFromCache(CacheKeys.LOGIN_STATE)) {
    return true;
  } else {
    // Redirect to login if not authenticated
    router.navigate([AppRoutes.EMPTY]);
    return false;
  }
};