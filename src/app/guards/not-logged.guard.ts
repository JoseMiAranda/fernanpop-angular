import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';

export const NotLoggedGuard: CanActivateFn = async (route, state) => {
  
  const router = inject(Router);
  const auth = inject(Auth);

  const isLogged = !!auth.currentUser;

  if(!isLogged) {
    return true;
  }
  
  // Redirigimos a la pagina principal si está logueado
  router.navigate(['fernanpop/']);
  return false;
};  
