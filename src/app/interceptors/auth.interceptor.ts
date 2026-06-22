import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, from, switchMap, throwError } from 'rxjs';
import { ACCESS_TOKEN_KEY, AuthService } from '../services/auth.service';

const baseUrl = import.meta.env.NG_APP_BASE_URL;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(baseUrl)) {
    return next(req);
  }

  const authService = inject(AuthService);
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);

  const authReq = token
    ? req.clone({ setHeaders: { authorization: `Bearer ${token}` } })
    : req;

  let retried = false;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (retried || (error.status !== 401 && error.status !== 403)) {
        return throwError(() => error);
      }

      retried = true;

      return from(authService.refreshAccessToken()).pipe(
        switchMap((newToken) => {
          if (!newToken) {
            return throwError(() => error);
          }

          const retryReq = req.clone({
            setHeaders: { authorization: `Bearer ${newToken}` },
          });

          return next(retryReq);
        }),
      );
    }),
  );
};
