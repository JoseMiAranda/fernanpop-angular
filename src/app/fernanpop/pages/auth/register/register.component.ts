import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { AuthError } from '@angular/fire/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styles: ``
})
export class RegisterComponent {
  public minLenght = 6;
  public maxLenght = 20;
  public errorRegister = signal<string | undefined>(undefined);

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
    console.log('submit');
    this.submitted = true;

    if (this.form.invalid) {
      return;
    }

    this.authService.register(this.form.value).then(
      (resp) => {
        if (!resp) {
          // Usuario registrado
          this.router.navigate(['fernanpop']);
        } else {
          // No hace falta validar el min lenght de firebase porque ya no hemos hecho (min 6 como firebase)
          let authError = resp as AuthError;
          console.log(authError);
          if (authError.code === 'auth/email-already-in-use') {
            this.errorRegister.set('Email ya utilizado. Por favor escoja otro');
          } else {
            this.errorRegister.set('Actualmente no podemos registrar usuarios');
          }
        }
      }
    );
  }

}
