import { Component, Input, OnDestroy, OnInit, signal } from '@angular/core';
import { Product } from '../../../../interfaces/product.interface';
import { Category } from '../../../../interfaces/category.interface';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductsService } from '../../../../services/products.service';
import { CategoriesService } from '../../../../services/categories.service';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ErrorState, InitialState, LoadingState, State, SuccessState } from '../../../../states/state.interface';
import { ConfirmDialogComponent } from '../../../../shared/ui/confirm-dialog/confirm-dialog.component';
import { forkJoin, Subscription } from 'rxjs';
import { CustomResponse, ErrorResponse, SuccessResponse } from '../../../../interfaces/response-interface';
import { GreenButtonComponent } from '../../../components/green-button/green-button.component';
import { ListImagesComponent } from '../../../components/list-images/list-images.component';
import { ImageDropComponent } from "../../../components/image-drop/image-drop.component";
import { ImagesService } from '../../../../services/images.service';

@Component({
  selector: 'app-update-product',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ConfirmDialogComponent, GreenButtonComponent, ListImagesComponent, ImageDropComponent],
  templateUrl: './update-product.component.html',
  styleUrl: './update-product.component.css',
})
export class UpdateProductComponent implements OnInit, OnDestroy {
  @Input('id') productId: string | undefined;
  public minLenght = 6;
  public maxLenght = 50;
  public maxDescLenght = 300;
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
  public confirmVisible = signal(false);
  public previewIndex = signal(0);
  public categories: Category[] = [];
  private pendingConfirmAction: (() => void) | null = null;
  private categoriesSubscription: Subscription = new Subscription();

  form: FormGroup = new FormGroup({
    title: new FormControl(null),
    price: new FormControl(null),
    categoryId: new FormControl(null),
    img: new FormControl(null),
    desc: new FormControl(null),
  });


  constructor(
    private formBuilder: FormBuilder,
    private productsService: ProductsService,
    private categoriesService: CategoriesService,
    private imagesService: ImagesService,
    private router: Router,
    private location: Location,
  ) { }

  ngOnInit(): void {
    this.categoriesSubscription = this.categoriesService.getCategories().subscribe({
      next: (response: CustomResponse) => {
        if (response instanceof SuccessResponse) {
          this.categories = response.data;
        }
      },
    });

    this.getProductsByIdSubscription = this.productsService.getProductById(this.productId!).subscribe({
      next: (response: CustomResponse) => {
        if (response instanceof SuccessResponse) {
          this.productState.set(new SuccessState(response.data));
          const { title, price, img, desc, categoryId } = response.data;
          this.form.patchValue({
            title: title,
            price: price,
            img: img,
            desc: desc,
            categoryId: categoryId ?? '',
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
        categoryId: [
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
    this.categoriesSubscription.unsubscribe();
  }

  // Obtenemos un campo del formulario
  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  deleteImage(image: string) {
    const images = this.productState().data.images.filter((i: string) => i !== image);
    this.productState.set(new SuccessState({ ...this.productState().data, images: images }));
    if (this.previewIndex() >= images.length) {
      this.previewIndex.set(Math.max(0, images.length - 1));
    }
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
      this.imagesService.upload(image)
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
      this.previewIndex.set(images.length - 1);
    }).catch((error) => {
      console.error('Error al subir imágenes:', error);
    });
  }
  
  updateProduct() {
    const { title, price, desc, categoryId } = this.form.value;
    const { id, sellerId, images, status, createdAt } = this.productState().data;
  
    const updatedProduct: Product = {
      id: id,
      sellerId: sellerId,
      title: title,
      price: price,
      desc: desc,
      categoryId: categoryId,
      images: images,
      status: status,
      createdAt: createdAt,
      updatedAt: new Date()
    }
  
    this.updateProductSubscription = this.productsService.updateProduct(updatedProduct).subscribe({
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
  
  onDelete(_event: Event): void {
    this.pendingConfirmAction = () => {
      this.isLoading = true;
      this.deleteProductState.set(new LoadingState());
      this.deleteProductSubscription = this.productsService.deleteProduct(this.productState()!.data.id).subscribe({
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
      });
    };
    this.confirmVisible.set(true);
  }

  onConfirmAccept(): void {
    this.confirmVisible.set(false);
    this.pendingConfirmAction?.();
    this.pendingConfirmAction = null;
  }

  onConfirmReject(): void {
    this.confirmVisible.set(false);
    this.pendingConfirmAction = null;
  }

  goBack(): void {
    this.location.back();
  }
}
