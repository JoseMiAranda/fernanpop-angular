import { HttpErrorResponse } from "@angular/common/http";

export const EMAIL_NOT_VERIFIED = 'email-not-verified';

export function isEmailNotVerifiedError(error: HttpErrorResponse): boolean {
    return error.status === 403 && error.error?.message === EMAIL_NOT_VERIFIED;
}

export function getErrorMessage(error: HttpErrorResponse): string {
    if (isEmailNotVerifiedError(error)) {
        return EMAIL_NOT_VERIFIED;
    }

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
