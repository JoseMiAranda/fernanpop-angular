import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const LoggedGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const isLogged = await authService.obtainUser();
  return isLogged;
};  
