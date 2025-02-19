import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductsService } from '../../../../services/products.service';
import { Product, ProductStatus } from '../../../../interfaces/product.interface';
import { Subscription } from 'rxjs';
import { CustomResponse, SuccessResponse } from '../../../../interfaces/response-interface';
import { InitialState, LoadingState, State } from '../../../../interfaces/state.interface';
import { ProductButtonComponent } from '../../../components/product-button/product-button.component';

@Component({
  selector: 'app-create-product',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ProductButtonComponent],
  templateUrl: './create-product.component.html',
  styleUrl: './create-product.component.css'
})
export class CreateProductComponent implements OnInit, OnDestroy {
  public minLenght = 6;
  public maxLenght = 50;
  public maxDescLenght = 300;
  private currentUser = this.authService.currentUser;
  private createProductSubscription: Subscription = new Subscription();
  public productState = signal<State>(new InitialState());

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

  ngOnDestroy(): void {
    this.createProductSubscription.unsubscribe();
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

    this.productState.set(new LoadingState());

    const {title, price, img, desc} = this.form.value;
    
    const newProduct: Product = {
      id: '',
      sellerId: '',
      title: title,
      price: price,
      desc: desc,
      img: img,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: ProductStatus.INITIAL,
    }
    
    // Obtener titulo del form
    // this.createProductSubscription = this.productsService.addProduct(this.currentUser()!.accessToken, newProduct)
    //   .subscribe({
    //     next: (result: CustomResponse) => {
    //       if(result instanceof SuccessResponse) {
    //         const { id } = result.data;
    //         this.router.navigate(['/fernanpop/product', id]);
    //         return;
    //       }
    //       // Redirección a error con mensaje
    //       this.router.navigate(['fernanpop/error/'], {
    //         state: {
    //           message: 'Parece que no se pudo crear el producto'
    //         }
    //       });
    //     },
    //   });
  }
}
