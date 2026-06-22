import { inject } from '@angular/core';
import { Auth, authState } from '@angular/fire/auth';
import { CanActivateFn, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const LoggedGuard: CanActivateFn = async () => {
  const router = inject(Router);
  const auth = inject(Auth);
  const authService = inject(AuthService);

  const user = await firstValueFrom(authState(auth));

  if (!user) {
    router.navigate(['fernanpop/']);
    return false;
  }

  await authService.refreshAccessToken();
  return true;
};
