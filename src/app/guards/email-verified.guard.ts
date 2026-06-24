import { inject } from '@angular/core';
import { Auth, authState } from '@angular/fire/auth';
import { CanActivateFn, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const EmailVerifiedGuard: CanActivateFn = async () => {
  const router = inject(Router);
  const auth = inject(Auth);
  const authService = inject(AuthService);

  const user = await firstValueFrom(authState(auth));

  if (!user) {
    router.navigate(['/login']);
    return false;
  }

  await user.reload();
  authService.currentUser.set(AuthService.mapFirebaseUser(user));

  const returnUrl = router.url;

  if (!user.emailVerified) {
    router.navigate(['/verify-email'], {
      queryParams: returnUrl && returnUrl !== '/' ? { returnUrl } : {},
    });
    return false;
  }

  await authService.refreshAccessToken();
  return true;
};
