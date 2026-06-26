import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { AuthError } from '@angular/fire/auth';
import { GoogleSignInButtonComponent } from '../google-sign-in-button/google-sign-in-button.component';
import {
  ButtonComponent,
  CardComponent,
  PageContainerComponent,
  PageTitleComponent,
  TextComponent,
} from '../../../../shared/ui';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    PageContainerComponent,
    CardComponent,
    PageTitleComponent,
    TextComponent,
    ButtonComponent,
    GoogleSignInButtonComponent,
  ],
  templateUrl: './register.component.html',
  styles: ``
})
export class RegisterComponent {
  public minLenght = 6;
  public maxLenght = 20;
  public errorRegister = signal<string | undefined>(undefined);
  public googleLoading = signal(false);

  form: FormGroup = new FormGroup({
    firstName: new FormControl(null),
    lastName: new FormControl(null),
    email: new FormControl(null),
    password: new FormControl(null),
    confirmPassword: new FormControl(null),
    acceptTerms: new FormControl(false),
  });

  submitted = false;
  googleTermsAttempted = false;

  constructor(private formBuilder: FormBuilder, private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.form = this.formBuilder.group(
      {
        firstName: [null, [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
        lastName: [null, [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
        email: [null, [Validators.required, Validators.email]],
        password: [
          null,
          [
            Validators.required,
            Validators.minLength(this.minLenght),
            Validators.maxLength(this.maxLenght),
          ],
        ],
        confirmPassword: [null, [Validators.required, this.passwordsMatchValidator]],
        acceptTerms: [false, Validators.requiredTrue],
      },
    );

    this.form.get('password')?.valueChanges.subscribe(() => {
      this.form.get('confirmPassword')?.updateValueAndValidity({ emitEvent: false });
    });
  }

  private passwordsMatchValidator = (control: AbstractControl): ValidationErrors | null => {
    const password = control.parent?.get('password')?.value;
    if (control.value && password !== control.value) {
      return { passwordMismatch: true };
    }
    return null;
  };

  // Obtenemos un campo del formulario
  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  onGoogleSignIn(): void {
    this.errorRegister.set(undefined);

    if (!this.form.get('acceptTerms')?.value) {
      this.googleTermsAttempted = true;
      this.form.get('acceptTerms')?.markAsTouched();
      return;
    }

    this.googleTermsAttempted = false;

    this.googleLoading.set(true);

    this.authService.loginWithGoogle().subscribe({
      next: () => {
        this.googleLoading.set(false);
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.googleLoading.set(false);
        const authError = err as AuthError;
        const message = AuthService.mapGoogleAuthError(authError.code, 'register');
        if (message) {
          this.errorRegister.set(message);
        }
      },
    });
  }

  onSubmit(): void {
    this.submitted = true;
    this.googleTermsAttempted = false;
    this.errorRegister.set(undefined);

    if (this.form.invalid) {
      return;
    }

    const { firstName, lastName, email, password } = this.form.value;

    this.authService.registerWithEmailAndPassword(email, password, firstName, lastName).subscribe({
      next: () => {
        this.router.navigate(['/verify-email']);
      },
      error: (err) => {
        // No hace falta validar el min lenght de firebase porque ya no hemos hecho (min 6 como firebase)
        let authError = err as AuthError;
        console.log(authError);
        if (authError.code === 'auth/email-already-in-use') {
          this.errorRegister.set('Email ya utilizado. Por favor escoja otro');
        } else {
        this.errorRegister.set('Actualmente no podemos registrar usuarios');
        }
      }
    });
  }
}
