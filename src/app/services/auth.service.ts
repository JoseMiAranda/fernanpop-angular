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
    this.obtainUserStorage();
  }

  // REGISTER
  async register({email, password}: any) {
    return await createUserWithEmailAndPassword(this.auth,email,password).then(async (resp: UserCredential) => {
      const user = await this.credentialsToUser(resp, email, password);
      return user;
    }).catch((err) => {
      console.log(err);
      return err;
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
      email: email,
      accessToken: await resp.user.getIdToken()
    }
    // Asignamos una fecha de expiracion inferior a una hora
    let currentDate = new Date();
    let expirationUid = new Date(currentDate.getTime() + 58 * 60000);
    this.saveUser(user, password, expirationUid);
    this.currentUser.set(user);
  }

  // LOGOUT
  logout() {
    this.currentUser.set(undefined);
    this.deleteUser();
  }

  // LOCALSTORAGE METHODS
  private saveUser(user: User, password: string, expirationUid: Date) {
    localStorage.setItem('fernanpopUser', 
    JSON.stringify(
      {
        email: encrypt(user.email), 
        uid: encrypt(user.uid),
        password: encrypt(password),
        accessToken: encrypt(user.accessToken),
        expirationUid: encrypt(expirationUid.toDateString())
      }
    ));
  }

  async obtainUserStorage() {
    let user = localStorage.getItem('fernanpopUser');
    // Validamos que se ha guarda datos del usuario
    if(user) {
      // Validamos que cada campo no este vacio
      let {email, password, uid, accessToken, expirationUid} = JSON.parse(user);
      if(email && password && uid && accessToken && expirationUid) {
        // Desecriptamos el usuario
        uid = decrypt(uid);
        email = decrypt(email);
        password = decrypt(password);
        accessToken = decrypt(accessToken);
        expirationUid = new Date(decrypt(expirationUid));
        // Comprobamos que el token no esté expirado
        if(expirationUid < new Date().getDate()) {
          return this.login({email, password}).then(() => true).catch(() => false);
        } else {
          const user: User = {
            uid: uid,
            email: email,
            accessToken: accessToken
          }
          this.currentUser.set(user);
          return true;
        }
      } 
    }
    return false;
  }

  private deleteUser() {
    localStorage.removeItem('fernanpopUser');
  }

}
