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

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styles: ``
})
export class LoginComponent implements OnInit {

  public errorRegister = signal<string | undefined>(undefined);

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

  onSubmit(): void {
    this.submitted = true;

    if (this.form.invalid) {
      return;
    }

    const { email, password } = this.form.value;

    this.authService.loginWithEmailAndPassword(email, password).subscribe({
      next:() => {
        this.router.navigate(['fernanpop']);
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
