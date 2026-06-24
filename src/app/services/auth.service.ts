import { inject, Injectable, signal } from '@angular/core';
import {
  User as FirebaseUser,
  UserCredential,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  Auth,
  signOut,
  user,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from '@angular/fire/auth';
import { User } from '../interfaces/user.interface';
import { firstValueFrom, from, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { EmailVerificationService } from './email-verification.service';
import { RateLimitResult } from '../utils/rate-limiter';

export const ACCESS_TOKEN_KEY = 'access_token';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private firebaseAuth = inject(Auth);
  private emailVerificationService = inject(EmailVerificationService);
  private refreshPromise: Promise<string | null> | null = null;

  public user$ = user(this.firebaseAuth);
  public currentUser = signal<User | null | undefined>(undefined);

  setAccessToken(token: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  clearAccessToken(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  }

  refreshAccessToken(): Promise<string | null> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.doRefreshAccessToken().finally(() => {
      this.refreshPromise = null;
    });

    return this.refreshPromise;
  }

  private async doRefreshAccessToken(): Promise<string | null> {
    const firebaseUser = this.firebaseAuth.currentUser;
    if (!firebaseUser) {
      this.clearAccessToken();
      return null;
    }

    const token = await firebaseUser.getIdToken(true);
    this.setAccessToken(token);
    return token;
  }

  // REGISTER
  registerWithEmailAndPassword(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ): Observable<void> {
    const displayName = `${firstName.trim()} ${lastName.trim()}`.trim();
    const promise = createUserWithEmailAndPassword(this.firebaseAuth, email, password).then(
      async (resp: UserCredential) => {
        await updateProfile(resp.user, { displayName });
        await this.refreshAccessToken();
        await firstValueFrom(this.emailVerificationService.sendVerificationEmail());
      },
    );

    return from(promise);
  }

  sendVerificationEmail(): Observable<void> {
    const firebaseUser = this.firebaseAuth.currentUser;

    if (!firebaseUser) {
      return from(Promise.reject(new Error('No hay usuario autenticado')));
    }

    return this.emailVerificationService.sendVerificationEmail().pipe(
      catchError((err) => EmailVerificationService.handleError(err, 'send')),
    );
  }

  async getVerificationLimits(): Promise<{ send: RateLimitResult; check: RateLimitResult }> {
    try {
      return await firstValueFrom(this.emailVerificationService.getLimits());
    } catch {
      return {
        send: { allowed: true, remaining: 0, retryAfterMs: 0 },
        check: { allowed: true, remaining: 0, retryAfterMs: 0 },
      };
    }
  }

  async reloadCurrentUser(options?: { forEmailVerification?: boolean }): Promise<User | null> {
    const firebaseUser = this.firebaseAuth.currentUser;

    if (!firebaseUser) {
      this.currentUser.set(null);
      return null;
    }

    if (options?.forEmailVerification) {
      let result;
      try {
        result = await firstValueFrom(this.emailVerificationService.checkVerificationStatus());
      } catch (err) {
        throw EmailVerificationService.mapHttpError(err, 'check');
      }

      if (result.emailVerified) {
        await firebaseUser.reload();
        const mappedUser = AuthService.mapFirebaseUser(firebaseUser);
        this.currentUser.set(mappedUser);
        await this.refreshAccessToken();
        return mappedUser;
      }

      return AuthService.mapFirebaseUser(firebaseUser);
    }

    await firebaseUser.reload();
    const mappedUser = AuthService.mapFirebaseUser(firebaseUser);
    this.currentUser.set(mappedUser);
    await this.refreshAccessToken();
    return mappedUser;
  }

  // LOGIN
  loginWithEmailAndPassword(email: string, password: string): Observable<void> {
    const promise = signInWithEmailAndPassword(this.firebaseAuth, email, password).then(() => {});
    return from(promise);
  }

  loginWithGoogle(): Observable<void> {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const promise = signInWithPopup(this.firebaseAuth, provider).then(async (credential) => {
      const firebaseUser = credential.user;
      const photoURL = AuthService.resolvePhotoUrl(firebaseUser);

      if (photoURL && !firebaseUser.photoURL) {
        await updateProfile(firebaseUser, {
          displayName: firebaseUser.displayName ?? '',
          photoURL,
        });
        await firebaseUser.reload();
      }
    });
    return from(promise);
  }

  static mapGoogleAuthError(code: string, context: 'login' | 'register' = 'login'): string | undefined {
    switch (code) {
      case 'auth/account-exists-with-different-credential':
        return 'Este correo ya está registrado con contraseña. Inicia sesión con email y contraseña.';
      case 'auth/popup-closed-by-user':
      case 'auth/cancelled-popup-request':
        return undefined;
      default:
        return context === 'register'
          ? 'Actualmente no podemos registrar usuarios con Google'
          : 'Actualmente no podemos iniciar sesión con Google';
    }
  }

  // LOGOUT
  logout(): Observable<void> {
    const promise = signOut(this.firebaseAuth);
    return from(promise);
  }

  static resolvePhotoUrl(user: {
    photoURL?: string | null;
    providerData?: { providerId: string; photoURL?: string | null }[];
  }): string | undefined {
    if (user.photoURL) {
      return user.photoURL;
    }

    const googleProvider = user.providerData?.find((p) => p.providerId === 'google.com');
    if (googleProvider?.photoURL) {
      return googleProvider.photoURL;
    }

    return user.providerData?.find((p) => p.photoURL)?.photoURL ?? undefined;
  }

  static mapFirebaseUser(user: FirebaseUser): User {
    return {
      uid: user.uid,
      email: user.email!,
      emailVerified: user.emailVerified,
      displayName: user.displayName ?? undefined,
      photoUrl: AuthService.resolvePhotoUrl(user),
    };
  }

  static parseDisplayName(displayName: string): { firstName: string; lastName: string } {
    const trimmed = displayName.trim();
    const spaceIndex = trimmed.indexOf(' ');

    if (spaceIndex === -1) {
      return { firstName: trimmed, lastName: '' };
    }

    return {
      firstName: trimmed.slice(0, spaceIndex),
      lastName: trimmed.slice(spaceIndex + 1).trim(),
    };
  }

  updateUserProfile(displayName: string, photoURL?: string): Observable<void> {
    const firebaseUser = this.firebaseAuth.currentUser;

    if (!firebaseUser) {
      return from(Promise.reject(new Error('No hay usuario autenticado')));
    }

    const profileUpdate: { displayName: string; photoURL?: string } = { displayName };
    if (photoURL !== undefined) {
      profileUpdate.photoURL = photoURL;
    }

    const promise = updateProfile(firebaseUser, profileUpdate)
      .then(() => firebaseUser.reload())
      .then(() => {
        this.currentUser.set(AuthService.mapFirebaseUser(firebaseUser));
      });

    return from(promise);
  }
}
