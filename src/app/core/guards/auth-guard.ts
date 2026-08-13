import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);

  const isAuthenticated = await authService.jwtTest();

  if (!isAuthenticated) {
    console.warn('User is not authenticated. Redirecting to login page.');
    const logOut = () => {
      authService.logout().then(() => {});
    };
    logOut();
    return false;
  }
  return true;
};
