import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthError } from '@angular/fire/auth';
import { AuthService } from '../../../../services/auth.service';
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
export class VerifyEmailComponent implements OnInit {
  public errorMessage = signal<string | undefined>(undefined);
  public successMessage = signal<string | undefined>(undefined);
  public resendLoading = signal(false);
  public checkLoading = signal(false);
  public userEmail = signal<string | undefined>(undefined);

  private returnUrl = '/';

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
  }

  onResendEmail(): void {
    this.errorMessage.set(undefined);
    this.successMessage.set(undefined);
    this.resendLoading.set(true);

    this.authService.sendVerificationEmail().subscribe({
      next: () => {
        this.resendLoading.set(false);
        this.successMessage.set('Correo de verificación enviado. Revisa tu bandeja de entrada.');
      },
      error: (err) => {
        this.resendLoading.set(false);
        const authError = err as AuthError;
        if (authError.code === 'auth/too-many-requests') {
          this.errorMessage.set('Demasiados intentos. Espera unos minutos antes de reenviar.');
        } else {
          this.errorMessage.set('No se pudo enviar el correo. Inténtalo de nuevo.');
        }
      },
    });
  }

  async onCheckVerified(): Promise<void> {
    this.errorMessage.set(undefined);
    this.successMessage.set(undefined);
    this.checkLoading.set(true);

    try {
      const user = await this.authService.reloadCurrentUser();
      this.checkLoading.set(false);

      if (user?.emailVerified) {
        this.navigateAfterVerification();
        return;
      }

      this.errorMessage.set('Tu correo aún no está verificado. Revisa tu bandeja de entrada y vuelve a intentarlo.');
    } catch {
      this.checkLoading.set(false);
      this.errorMessage.set('No se pudo comprobar el estado de verificación. Inténtalo de nuevo.');
    }
  }

  private navigateAfterVerification(): void {
    this.router.navigateByUrl(this.returnUrl);
  }
}
