import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const LoggedGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const isLogged = await authService.obtainUserStorage();
  if(isLogged) {
    return true;
  }
  // Redirigimos a la pagina principal si no está logueado
  router.navigate(['fernanpop/']);
  return false;
};  
