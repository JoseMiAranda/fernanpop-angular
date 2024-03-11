import { Component, Input, OnInit, signal } from '@angular/core';
import { Product } from '../../../../interfaces/product.interface';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductsService } from '../../../../services/products.service';
import { AuthService } from '../../../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-update-product',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ConfirmDialogModule, ButtonModule],
  templateUrl: './update-product.component.html',
  styleUrl: './update-product.component.css',
  providers: [ConfirmationService, MessageService]
})
export class UpdateProductComponent implements OnInit {
  @Input('id') productId: string | undefined;
  public minLenght = 6;
  public maxLenght = 50;
  public maxDescLenght = 300;
  private currentUser = this.authService.currentUser;
  public product = signal<Product | undefined>(undefined);

  form: FormGroup = new FormGroup({
    title: new FormControl(null),
    price: new FormControl(null),
    img: new FormControl(null),
    desc: new FormControl(null),
  });

  submitted = false;

  constructor(private formBuilder: FormBuilder, private productsService: ProductsService,
    private confirmationService: ConfirmationService, 
    private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.productsService.getProductById(this.productId!).subscribe((result: Product | null) => {
      if (!result || result.sellerId !== this.currentUser()!.uid) {
        // Redirección a error con mensaje
        this.router.navigate(['fernanpop/error/'], {
          state: {
            message: 'Parece que el producto no se encuentra'
          }
        });
      } else {
        this.product.set(result);
        // Cargamos en el formulario los datos del producto
        this.form.patchValue({
          title: this.product()!.title,
          price: this.product()!.price,
          img: this.product()!.img,
          desc: this.product()!.desc
        });
      }
    });

    this.form = this.formBuilder.group(
      {
        title: [
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

    const { title, price, img, desc } = this.form.value;

    const updatedProduct: Product = {
      id: this.product()!.id,
      title: title,
      price: price,
      desc: desc,
      img: img,
      sellerId: this.product()!.sellerId
    }

    this.productsService.updateProduct(this.currentUser()!.accessToken, updatedProduct).subscribe((result: Product | null) => {
      if (!result) {
        // Redirección a error con mensaje
        this.router.navigate(['fernanpop/error/'], {
          state: {
            message: 'Parece que no se pudo modificar el producto'
          }
        });
      } else {
        this.router.navigate(['/fernanpop/product', result.id]);
      }
    });
  }

  onDelete(event: Event): void {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: '¿Estás seguro de borrar el producto?',
      header: 'Confirmación de eliminación',
      icon: 'pi pi-info-circle',
      acceptButtonStyleClass: "p-button-danger p-button-text ml-5",
      rejectButtonStyleClass: "p-button-text p-button-text",
      acceptIcon: "none",
      rejectIcon: "none",
      acceptLabel: "Eliminar",
      rejectLabel: "Cancelar",
      reject: () => {
        // No hacemos nada
      },
      accept: () => {
        // Borramos el producto
        this.productsService.deleteProduct(this.currentUser()!.accessToken, this.product()!.id).subscribe((result: Product | null) => {
          if (result) {
            this.router.navigate(['']);
          } else {
            // Redirección a error con mensaje
            this.router.navigate(['fernanpop/error/'], {
              state: {
                message: 'Parece que no se pudo borrar el producto'
              }
            });
          }
        });
      }
    });
  }
}
