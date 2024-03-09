import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const loggedUserGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  console.log(authService.currentUser());
  return authService.currentUser() == undefined;
};
