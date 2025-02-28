import { inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { CanActivateFn, Router } from '@angular/router';

export const LoggedGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);
  const auth = inject(Auth);

  const isLogged = !!auth.currentUser;

  if(isLogged) {
    return true;
  }
  // Redirigimos a la pagina principal si no está logueado
  router.navigate(['fernanpop/']);
  return false;
};  
