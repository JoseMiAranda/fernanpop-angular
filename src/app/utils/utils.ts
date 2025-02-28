import CryptoJS from "crypto-js";
import * as env from '../../../environments.json';
import { HttpErrorResponse } from "@angular/common/http";

export function encrypt(value: string) {
    return CryptoJS.AES.encrypt(value, env['MY_SECRET_KEY']).toString();
}

export function decrypt(value: string) {
return CryptoJS.AES.decrypt(value, env['MY_SECRET_KEY']).toString(CryptoJS.enc.Utf8);
}

export function getErrorMessage(error: HttpErrorResponse): string {
    switch (error.status) {
        case 0:
            return 'Sin conexión.';
        case 400:
            return 'La petición no es válida.';
        case 401:
            return 'No autorizado.';
        case 403:
            return 'No tienes permisos.';
        case 404:
            return 'No encontrado.';
        case 408:
            return 'Tiempo de espera excedido.';
        case 500:
            return 'Ha habido un error inesperado.';
        case 504:
            return 'Tiempo de espera excedido.';
        default:
            return 'Ha habido un error inesperado.';
    }
}
