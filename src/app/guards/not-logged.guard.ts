import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth, authState } from '@angular/fire/auth';
import { firstValueFrom } from 'rxjs';

export const NotLoggedGuard: CanActivateFn = async () => {
  const router = inject(Router);
  const auth = inject(Auth);

  const user = await firstValueFrom(authState(auth));

  if (!user) {
    return true;
  }

  router.navigate(['fernanpop/']);
  return false;
};
