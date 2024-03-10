import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const isLogged = await authService.obtainUser();
  console.log(isLogged);
  return !isLogged;
  // return false;
};  
