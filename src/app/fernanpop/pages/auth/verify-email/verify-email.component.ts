import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { RateLimitError } from '../../../../utils/rate-limiter';
import {
  ButtonComponent,
  CardComponent,
  PageContainerComponent,
  PageTitleComponent,
  TextComponent,
} from '../../../../shared/ui';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [
    CommonModule,
    PageContainerComponent,
    CardComponent,
    PageTitleComponent,
    TextComponent,
    ButtonComponent,
  ],
  templateUrl: './verify-email.component.html',
})
export class VerifyEmailComponent implements OnInit, OnDestroy {
  public errorMessage = signal<string | undefined>(undefined);
  public successMessage = signal<string | undefined>(undefined);
  public resendLoading = signal(false);
  public checkLoading = signal(false);
  public userEmail = signal<string | undefined>(undefined);
  public resendCooldownSeconds = signal(0);
  public checkCooldownSeconds = signal(0);

  private returnUrl = '/';
  private cooldownIntervalId: ReturnType<typeof setInterval> | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (user?.emailVerified) {
      this.navigateAfterVerification();
      return;
    }

    this.userEmail.set(user?.email);
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/';
    this.startCooldownTimer();
  }

  ngOnDestroy(): void {
    this.stopCooldownTimer();
  }

  onResendEmail(): void {
    if (this.resendCooldownSeconds() > 0) {
      return;
    }

    this.errorMessage.set(undefined);
    this.successMessage.set(undefined);
    this.resendLoading.set(true);

    this.authService.sendVerificationEmail().subscribe({
      next: () => {
        this.resendLoading.set(false);
        this.successMessage.set('Correo de verificación enviado. Revisa tu bandeja de entrada.');
        void this.updateCooldowns();
      },
      error: (err) => {
        this.resendLoading.set(false);
        this.handleResendError(err);
        void this.updateCooldowns();
      },
    });
  }

  async onCheckVerified(): Promise<void> {
    if (this.checkCooldownSeconds() > 0) {
      return;
    }

    this.errorMessage.set(undefined);
    this.successMessage.set(undefined);
    this.checkLoading.set(true);

    try {
      const user = await this.authService.reloadCurrentUser({ forEmailVerification: true });
      this.checkLoading.set(false);

      if (user?.emailVerified) {
        this.navigateAfterVerification();
        return;
      }

      this.errorMessage.set('Tu correo aún no está verificado. Revisa tu bandeja de entrada y vuelve a intentarlo.');
      void this.updateCooldowns();
    } catch (err) {
      this.checkLoading.set(false);
      this.handleCheckError(err);
      void this.updateCooldowns();
    }
  }

  private handleResendError(err: unknown): void {
    if (err instanceof RateLimitError) {
      this.errorMessage.set(this.formatRateLimitMessage('reenviar el correo', err.retryAfterMs));
      return;
    }

    if (err instanceof Error && err.message === 'firebase-too-many-requests') {
      this.errorMessage.set('Demasiados intentos. Espera unos minutos antes de reenviar.');
      return;
    }

    this.errorMessage.set('No se pudo enviar el correo. Inténtalo de nuevo.');
  }

  private handleCheckError(err: unknown): void {
    if (err instanceof RateLimitError) {
      this.errorMessage.set(this.formatRateLimitMessage('comprobar la verificación', err.retryAfterMs));
      return;
    }

    this.errorMessage.set('No se pudo comprobar el estado de verificación. Inténtalo de nuevo.');
  }

  private formatRateLimitMessage(action: string, retryAfterMs: number): string {
    const seconds = Math.ceil(retryAfterMs / 1000);
    if (seconds >= 60) {
      const minutes = Math.ceil(seconds / 60);
      return `Has alcanzado el límite de intentos. Podrás ${action} en ${minutes} min.`;
    }
    return `Has alcanzado el límite de intentos. Podrás ${action} en ${seconds} s.`;
  }

  private startCooldownTimer(): void {
    void this.updateCooldowns();
    this.cooldownIntervalId = setInterval(() => void this.updateCooldowns(), 1000);
  }

  private stopCooldownTimer(): void {
    if (this.cooldownIntervalId !== null) {
      clearInterval(this.cooldownIntervalId);
      this.cooldownIntervalId = null;
    }
  }

  private async updateCooldowns(): Promise<void> {
    const limits = await this.authService.getVerificationLimits();
    this.resendCooldownSeconds.set(Math.ceil(limits.send.retryAfterMs / 1000));
    this.checkCooldownSeconds.set(Math.ceil(limits.check.retryAfterMs / 1000));
  }

  private navigateAfterVerification(): void {
    this.router.navigateByUrl(this.returnUrl);
  }
}
