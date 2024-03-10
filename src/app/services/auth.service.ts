import { Injectable, signal } from '@angular/core';
import { Auth, UserCredential, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut  } from '@angular/fire/auth';
import { User } from '../interfaces/user.interface';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  currentUser = signal<User | undefined>(undefined);

  constructor(private auth: Auth) {
  }

  // LOGIN
  async register({email, password}: any) {
    return await createUserWithEmailAndPassword(this.auth,email,password);
  }

  // REGISTER
  async login({email, password}: any) {
    return await signInWithEmailAndPassword(this.auth,email,password).then(async (resp: UserCredential) => {
      // Obtenemos lo que nos interesa del UserCredential
      const user: User = {
        uid: resp.user.uid,
        email: resp.user.email!,
        accessToken: await resp.user.getIdToken()
      }
      this.currentUser.set(user);
      console.log(this.currentUser());
      return true;
    }
    ).catch((err) => {
      return false;
    });
  }

  // LOGOUT
  logout() {
    return signOut(this.auth);
  }

}
