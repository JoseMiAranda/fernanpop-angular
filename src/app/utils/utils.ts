import CryptoJS from "crypto-js";
import * as env from '../../../environments.json';

export function encrypt(value: string) {
    return CryptoJS.AES.encrypt(value, env['MY_SECRET_KEY']).toString();
}

export function decrypt(value: string) {
return CryptoJS.AES.decrypt(value, env['MY_SECRET_KEY']).toString(CryptoJS.enc.Utf8);
}