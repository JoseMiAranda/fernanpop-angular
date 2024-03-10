import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductsService } from '../../../../services/products.service';
import { Product } from '../../../../interfaces/product.interface';

@Component({
  selector: 'app-create-product',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './create-product.component.html',
  styleUrl: './create-product.component.css'
})
export class CreateProductComponent {
  public minLenght = 6;
  public maxLenght = 20;
  public maxDescLenght = 100;
  private currentUser = this.authService.currentUser;

  form: FormGroup = new FormGroup({
    title: new FormControl(null),
    price: new FormControl(null),
    img: new FormControl(null),
    desc: new FormControl(null),
  });

  submitted = false;

  constructor(private formBuilder: FormBuilder, private productsService: ProductsService, private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.form = this.formBuilder.group(
      {
        title:  [
          null,
          [
            Validators.required,
            Validators.minLength(this.minLenght),
            Validators.maxLength(this.maxLenght),
          ],
        ],
        price: [
          null,
          [
            Validators.required,
          ]
        ],
        img: [
          null,
          [
            Validators.required,
          ]
        ],
        desc: [
          null,
          [
            Validators.required,
            Validators.minLength(this.minLenght),
            Validators.maxLength(this.maxDescLenght),
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
    
    console.log(this.form.invalid)
    if (this.form.invalid) {
      return;
    }

    const {title, price, img, desc} = this.form.value;
    
    
    // Obtener titulo del form
    this.productsService.addProduct(this.currentUser()!.accessToken, title, desc, price, img).subscribe((result: Product | null) => {
      if (!result) {
        // Redirección a error con mensaje
        this.router.navigate(['fernanpop/error/'], {
          state: {
            message: 'Parece que no se puede crear el producto'
          }
        });
      } else {
        this.router.navigate(['/fernanpop/product', result.id]);
      }
    });
  }
}
