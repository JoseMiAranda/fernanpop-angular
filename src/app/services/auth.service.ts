import { inject, Injectable,  signal } from '@angular/core';
import { UserCredential, createUserWithEmailAndPassword, signInWithEmailAndPassword, Auth, signOut, user, updateProfile, signInWithCustomToken } from '@angular/fire/auth';
import { User } from '../interfaces/user.interface';
import { from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private firebaseAuth = inject(Auth);
  public user$ = user(this.firebaseAuth);
  public currentUser = signal<User | null | undefined>(undefined);

  // REGISTER
  registerWithEmailAndPassword(email: string, password: string): Observable<void> {
    const promise = createUserWithEmailAndPassword(this.firebaseAuth, email, password).then(async (resp: UserCredential) => 
      updateProfile(resp.user, { displayName: resp.user.displayName })
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
}
