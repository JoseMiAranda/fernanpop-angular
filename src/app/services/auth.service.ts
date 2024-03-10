import { Injectable, signal } from '@angular/core';
import { Auth, UserCredential, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut  } from '@angular/fire/auth';
import { User } from '../interfaces/user.interface';
import { decrypt, encrypt } from '../utils/utils';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  currentUser = signal<User | undefined>(undefined);

  constructor(private auth: Auth) {
    this.obtainUser();
  }

  // REGISTER
  async register({email, password}: any) {
    return await createUserWithEmailAndPassword(this.auth,email,password).then(async (resp: UserCredential) => {
      await this.credentialsToUser(resp, email, password);
      return true;
    }).catch((err) => {
      console.log(err);
      return false;
    });
  }

  // LOGIN
  async login({email, password}: any) {
    return await signInWithEmailAndPassword(this.auth,email,password).then(async (resp: UserCredential) => {
      await this.credentialsToUser(resp, email, password);
      return true;
    }
    ).catch((err) => {
      console.log(err);
      return false;
    });
  }

  private async credentialsToUser(resp: UserCredential, email: string, password: string) {
    const user: User = {
      uid: resp.user.uid,
      email: resp.user.email!,
      accessToken: await resp.user.getIdToken()
    }
    this.saveUser(email,password);
    this.currentUser.set(user);
  }

  // LOGOUT
  logout() {
    this.currentUser.set(undefined);
    this.deleteUser();
  }

  // LOCALSTORAGE METHODS
  private saveUser(email: string,password: string) {
    localStorage.setItem('fernanpopUser', 
    JSON.stringify(
      {
        email: encrypt(email), 
        password: encrypt(password)
      }
    ));
  }

  async obtainUser() {
    let user = localStorage.getItem('fernanpopUser');
    if(user) {
      let {email, password} = JSON.parse(user);
      email = decrypt(email);
      password = decrypt(password);
      return this.login({email, password}).then(() => true).catch((err) => false);
    }
    return false;
  }

  private deleteUser() {
    localStorage.removeItem('fernanpopUser');
  }

}
