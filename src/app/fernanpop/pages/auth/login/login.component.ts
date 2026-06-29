import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { AuthService } from '../../../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { AuthError } from '@angular/fire/auth';
import { GoogleSignInButtonComponent } from '../google-sign-in-button/google-sign-in-button.component';
import {
  ButtonComponent,
  CardComponent,
  EyebrowComponent,
  PageContainerComponent,
  PageTitleComponent,
  TextComponent,
} from '../../../../shared/ui';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    PageContainerComponent,
    CardComponent,
    EyebrowComponent,
    PageTitleComponent,
    TextComponent,
    ButtonComponent,
    GoogleSignInButtonComponent,
  ],
  templateUrl: './login.component.html',
  styles: ``
})
export class LoginComponent implements OnInit {

  public errorRegister = signal<string | undefined>(undefined);
  public showPassword = signal(false);
  public googleLoading = signal(false);

  public minLenght = 6;
  public maxLenght = 20;

  form: FormGroup = new FormGroup({
    email: new FormControl(null),
    password: new FormControl(null),
  });

  submitted = false;

  constructor(private formBuilder: FormBuilder, private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.form = this.formBuilder.group(
      {
        email: [null, [Validators.required, Validators.email]],
        password: [
          null,
          [
            Validators.required,
            Validators.minLength(this.minLenght),
            Validators.maxLength(this.maxLenght),
          ],
        ],
      },
    );
  }

  // Obtenemos un campo del formulario
  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  togglePasswordVisibility(): void {
    this.showPassword.update((visible) => !visible);
  }

  onGoogleSignIn(): void {
    this.errorRegister.set(undefined);
    this.googleLoading.set(true);

    this.authService.loginWithGoogle().subscribe({
      next: () => {
        this.googleLoading.set(false);
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.googleLoading.set(false);
        const authError = err as AuthError;
        const message = AuthService.mapGoogleAuthError(authError.code, 'login');
        if (message) {
          this.errorRegister.set(message);
        }
      },
    });
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorRegister.set(undefined);

    if (this.form.invalid) {
      return;
    }

    const { email, password } = this.form.value;

    this.authService.loginWithEmailAndPassword(email, password).subscribe({
      next:() => {
        this.router.navigate(['/']);
      },
      error: (err) => {
        const authError = err as AuthError;
        // No hace falta validar el min lenght de firebase porque ya no hemos hecho (min 6 como firebase)
        switch (authError.code) {
          case 'auth/user-not-found':
            this.errorRegister.set('Email o contraseña incorrecta');
            break;
          case 'auth/wrong-password':
            this.errorRegister.set('Email o contraseña incorrecta');
            break;
          default:
            this.errorRegister.set('Actualmente no podemos loguear usuarios');
            break;
        }
      }
    });
  }

}
