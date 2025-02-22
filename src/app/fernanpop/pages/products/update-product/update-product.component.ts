import { Component, Input, OnDestroy, OnInit, signal } from '@angular/core';
import { Product } from '../../../../interfaces/product.interface';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductsService } from '../../../../services/products.service';
import { AuthService } from '../../../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ErrorState, InitialState, LoadingState, State, SuccessState } from '../../../../states/state.interface';
import { Subscription } from 'rxjs';
import { CustomResponse, ErrorResponse, SuccessResponse } from '../../../../interfaces/response-interface';
import { GreenButtonComponent } from '../../../components/green-button/green-button.component';
import { RedButtonComponent } from '../../../components/red-button/red-button.component';
import { ListImagesComponent } from '../../../components/list-images/list-images.component';
import { ImageDropComponent } from "../../../components/image-drop/image-drop.component";

@Component({
  selector: 'app-update-product',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ConfirmDialogModule, ButtonModule, GreenButtonComponent, RedButtonComponent, ListImagesComponent, ImageDropComponent],
  templateUrl: './update-product.component.html',
  styleUrl: './update-product.component.css',
  providers: [ConfirmationService, MessageService]
})
export class UpdateProductComponent implements OnInit, OnDestroy {
  @Input('id') productId: string | undefined;
  public minLenght = 6;
  public maxLenght = 50;
  public maxDescLenght = 300;
  private currentUser = this.authService.currentUser;
  public productState = signal<State>(new LoadingState());
  public imagesSignal = signal<FileList>(new DataTransfer().files);
  public updateProductState = signal<State>(new InitialState());
  public deleteProductState = signal<State>(new InitialState());
  private getProductsByIdSubscription: Subscription = new Subscription();
  private updateProductSubscription: Subscription = new Subscription();
  private deleteProductSubscription: Subscription = new Subscription();
  public submitted = false;
  public isLoading = false;
  public existImage = false;

  form: FormGroup = new FormGroup({
    title: new FormControl(null),
    price: new FormControl(null),
    img: new FormControl(null),
    desc: new FormControl(null),
  });


  constructor(private formBuilder: FormBuilder, private productsService: ProductsService,
    private confirmationService: ConfirmationService, 
    private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.getProductsByIdSubscription = this.productsService.getProductById(this.productId!).subscribe({
      next: (response: CustomResponse) => {
        if (response instanceof SuccessResponse) {
          this.productState.set(new SuccessState(response.data));
          const { title, price, img, desc } = response.data;
          this.form.patchValue({
            title: title,
            price: price,
            img: img,
            desc: desc
          });
        } else if (response instanceof ErrorResponse) {
          this.router.navigate(['fernanpop/error/'], {
            state: {
              message: 'Parece que el producto no se encuentra'
            }
          });
        }
      },
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
    this.getProductsByIdSubscription.unsubscribe();
    this.updateProductSubscription.unsubscribe();
    this.deleteProductSubscription.unsubscribe();
  }

  // Obtenemos un campo del formulario
  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  deleteImage(image: string) {
    const images = this.productState().data.images.filter((i: string) => i !== image);
    this.productState.set(new SuccessState({ ...this.productState().data, images: images }));
  }

  onDrop(files: FileList) {
    this.imagesSignal.set(files);
  }

  onSubmit(): void {
    this.submitted = true;
    this.existImage = this.productState().data.images.length > 0 || this.imagesSignal().length > 0;

    const valid = this.form.valid && this.existImage;

    if (!valid) {
      return;
    }

    this.isLoading = true;
    this.updateProductState.set(new LoadingState());

    // Añadir imágenes
    const images = this.imagesSignal();


    // Actualizar producto
    const { title, price, img, desc } = this.form.value;

    const { id, sellerId, status, createdAt } = this.productState().data;

    const updatedProduct: Product = {
      id: id,
      sellerId: sellerId,
      title: title,
      price: price,
      desc: desc,
      images: [img],
      status: status,
      createdAt: createdAt,
      updatedAt: new Date()
    }

    //!TODO
    // this.updateProductSubscription = this.productsService.updateProduct(this.currentUser()!.accessToken, updatedProduct).subscribe({
    //   next: (response: CustomResponse) => {
    //     if (response instanceof SuccessResponse) {
    //       this.router.navigate(['/fernanpop/product', response.data.id]);
    //       return;
    //     } 
    //     this.router.navigate(['fernanpop/error/'], {
    //       state: {
    //         message: 'Parece que no se pudo modificar el producto'
    //       }
    //     });
    //   },
    // });
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
        this.isLoading = true;
        this.deleteProductState.set(new LoadingState());
        //!TODO
        // Borramos el producto
        // this.productsService.deleteProduct(this.currentUser()!.accessToken, this.productState()!.id).subscribe((result: Product | null) => {
        //   if (result) {
        //     this.router.navigate(['']);
        //   } else {
        //     // Redirección a error con mensaje
        //     this.router.navigate(['fernanpop/error/'], {
        //       state: {
        //         message: 'Parece que no se pudo borrar el producto'
        //       }
        //     });
        //   }
        // });
      }
    });
  }
}
