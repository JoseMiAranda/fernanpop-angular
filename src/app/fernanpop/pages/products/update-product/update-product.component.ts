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
import { forkJoin, Subscription } from 'rxjs';
import { CustomResponse, ErrorResponse, SuccessResponse } from '../../../../interfaces/response-interface';
import { GreenButtonComponent } from '../../../components/green-button/green-button.component';
import { RedButtonComponent } from '../../../components/red-button/red-button.component';
import { ListImagesComponent } from '../../../components/list-images/list-images.component';
import { ImageDropComponent } from "../../../components/image-drop/image-drop.component";
import { ImagesService } from '../../../../services/images.service';

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


  constructor(private formBuilder: FormBuilder, private productsService: ProductsService, private imagesService: ImagesService,
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

  async uploadImages(): Promise<void> {
    const images = this.imagesSignal();
  
    if (images.length === 0) {
      return Promise.resolve();
    }
  
    const imageObservables = Array.from(images).map((image) => 
      this.imagesService.upload(this.currentUser()!.accessToken, image)
    );
  
    await forkJoin(imageObservables).toPromise().then((urls) => {
      const newImages: string[] = [];
      urls?.forEach((url) => {
        if (url instanceof ErrorResponse) {
          this.router.navigate(['fernanpop/error/'], {
            state: {
              message: 'Parece que no se pudo subir la imagen'
            }
          });
          return;
        } 
        newImages.push((url as SuccessResponse).data);
      });
      const images = [...this.productState().data.images, ...newImages];
      this.productState.set(new SuccessState({ ...this.productState().data, images: images }));
    }).catch((error) => {
      console.error('Error al subir imágenes:', error);
    });
  }
  
  updateProduct() {
    const { title, price, desc } = this.form.value;
    const { id, sellerId, images, status, createdAt } = this.productState().data;
  
    const updatedProduct: Product = {
      id: id,
      sellerId: sellerId,
      title: title,
      price: price,
      desc: desc,
      images: images,
      status: status,
      createdAt: createdAt,
      updatedAt: new Date()
    }
  
    this.updateProductSubscription = this.productsService.updateProduct(this.currentUser()!.accessToken, updatedProduct).subscribe({
      next: (response: CustomResponse) => {
        if (response instanceof SuccessResponse) {
          this.router.navigate(['/fernanpop/product', response.data.id]);
          return;
        } 
        this.router.navigate(['fernanpop/error/'], {
          state: {
            message: 'Parece que no se pudo modificar el producto'
          }
        });
      },
    });
  }
  
  async onSubmit(): Promise<void> {
    this.submitted = true;
    this.existImage = this.productState().data.images.length > 0 || this.imagesSignal().length > 0;
  
    const valid = this.form.valid && this.existImage;
  
    if (!valid) {
      return;
    }
  
    this.isLoading = true;
    this.updateProductState.set(new LoadingState());
  
    await this.uploadImages();
    this.updateProduct();
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
        this.deleteProductSubscription = this.productsService.deleteProduct(this.currentUser()!.accessToken, this.productState()!.data.id).subscribe({
            next: (response: CustomResponse) => {
              if (response instanceof SuccessResponse) {
                this.router.navigate(['/fernanpop/user/products']);
                return;
              } 
              this.router.navigate(['fernanpop/error/'], {
                state: {
                  message: 'Parece que no se pudo borrar el producto'
                }
              });
            },
          }
        );
      }
    });
  }
}
