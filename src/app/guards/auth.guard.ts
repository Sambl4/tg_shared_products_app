import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { LoginService } from '../services/login.service';
import { AppRoutes } from '../app.routes';

export const authGuard: CanActivateFn = (route, state) => {
  const loginService = inject(LoginService);
  const router = inject(Router);

  if (loginService.isLoggedIn()) {
    return true;
  } else {
    // Redirect to login if not authenticated
    router.navigate([AppRoutes.EMPTY]);
    return false;
  }
};