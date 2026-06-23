import { inject, Injectable, signal } from '@angular/core';
import { UserCredential, createUserWithEmailAndPassword, signInWithEmailAndPassword, Auth, signOut, user, updateProfile } from '@angular/fire/auth';
import { User } from '../interfaces/user.interface';
import { from, Observable } from 'rxjs';

export const ACCESS_TOKEN_KEY = 'access_token';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private firebaseAuth = inject(Auth);
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
    const promise = createUserWithEmailAndPassword(this.firebaseAuth, email, password).then((resp: UserCredential) =>
      updateProfile(resp.user, { displayName })
    );

    return from(promise);
  }

  // LOGIN
  loginWithEmailAndPassword(email: string, password: string): Observable<void> {
    const promise = signInWithEmailAndPassword(this.firebaseAuth, email, password).then(() => {});
    return from(promise);
  }

  // LOGOUT
  logout(): Observable<void> {
    const promise = signOut(this.firebaseAuth);
    return from(promise);
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
        this.currentUser.set({
          uid: firebaseUser.uid,
          email: firebaseUser.email!,
          displayName: firebaseUser.displayName ?? undefined,
          photoUrl: firebaseUser.photoURL ?? undefined,
        });
      });

    return from(promise);
  }
}
