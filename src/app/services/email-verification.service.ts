import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { RateLimitError, RateLimitResult } from '../utils/rate-limiter';

export interface EmailVerificationLimits {
  send: RateLimitResult;
  check: RateLimitResult;
}

export interface EmailVerificationCheckResult {
  emailVerified: boolean;
}

const RATE_LIMIT_EXCEEDED = 'rate-limit-exceeded';

@Injectable({
  providedIn: 'root',
})
export class EmailVerificationService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = import.meta.env.NG_APP_BASE_URL;

  sendVerificationEmail(): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/email-verification/send`, {});
  }

  checkVerificationStatus(): Observable<EmailVerificationCheckResult> {
    return this.http.post<EmailVerificationCheckResult>(`${this.baseUrl}/email-verification/check`, {});
  }

  getLimits(): Observable<EmailVerificationLimits> {
    return this.http.get<EmailVerificationLimits>(`${this.baseUrl}/email-verification/limits`);
  }

  static mapHttpError(error: unknown, action: 'send' | 'check'): Error {
    if (!(error instanceof HttpErrorResponse)) {
      return error instanceof Error ? error : new Error('Unknown error');
    }

    if (error.status === 429 && error.error?.message === RATE_LIMIT_EXCEEDED) {
      return new RateLimitError(error.error.retryAfterMs ?? 0, action);
    }

    if (error.status === 429 && error.error?.message === 'firebase-too-many-requests') {
      return new Error('firebase-too-many-requests');
    }

    if (action === 'send') {
      return new Error('email-verification-send-failed');
    }

    return new Error('email-verification-check-failed');
  }

  static handleError(error: unknown, action: 'send' | 'check'): Observable<never> {
    return throwError(() => EmailVerificationService.mapHttpError(error, action));
  }
}
