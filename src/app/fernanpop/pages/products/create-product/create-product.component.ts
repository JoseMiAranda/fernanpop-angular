import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductsService } from '../../../../services/products.service';
import { CategoriesService } from '../../../../services/categories.service';
import { Product, PRODUCT_CONDITIONS } from '../../../../interfaces/product.interface';
import { Category } from '../../../../interfaces/category.interface';
import { forkJoin, Subscription } from 'rxjs';
import { CustomResponse, ErrorResponse, SuccessResponse } from '../../../../interfaces/response-interface';
import { InitialState, LoadingState, State } from '../../../../states/state.interface';
import {
  BreadcrumbsComponent,
  ButtonComponent,
  CardComponent,
  PageContainerComponent,
  PageTitleComponent,
  SectionHeadingComponent,
  TextComponent,
} from '../../../../shared/ui';
import { ImageDropComponent } from '../../../components/image-drop/image-drop.component';
import { ImagesService } from '../../../../services/images.service';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-create-product',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    BreadcrumbsComponent,
    CardComponent,
    PageContainerComponent,
    PageTitleComponent,
    SectionHeadingComponent,
    TextComponent,
    ImageDropComponent,
  ],
  templateUrl: './create-product.component.html',
  styleUrl: './create-product.component.css'
})
export class CreateProductComponent implements OnInit, OnDestroy {
  public minLenght = 6;
  public maxLenght = 50;
  public maxDescLenght = 300;
  public productState = signal<State>(new LoadingState());
  public imagesSignal = signal<FileList>(new DataTransfer().files);
  private urlsSignal = signal<string[]>([]); 
  public createProductState = signal<State>(new InitialState());
  public deleteProductState = signal<State>(new InitialState());
  private createProductSubscription: Subscription = new Subscription();
  public submitted = false;
  public isLoading = false;
  public existImage = false;
  public categories: Category[] = [];
  public conditions = PRODUCT_CONDITIONS;
  private categoriesSubscription: Subscription = new Subscription();

  form: FormGroup = new FormGroup({
    title: new FormControl(null),
    price: new FormControl(null),
    categoryId: new FormControl(null),
    condition: new FormControl(null),
    img: new FormControl(null),
    desc: new FormControl(null),
  });


  constructor(private formBuilder: FormBuilder, private productsService: ProductsService,
    private categoriesService: CategoriesService,
    private imagesService: ImagesService, private router: Router,
    private authService: AuthService) { }

  ngOnInit(): void {
    this.categoriesSubscription = this.categoriesService.getCategories().subscribe({
      next: (response: CustomResponse) => {
        if (response instanceof SuccessResponse) {
          this.categories = response.data;
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
        condition: [
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
    this.categoriesSubscription.unsubscribe();
  }

  // Obtenemos un campo del formulario
  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  onDrop(files: FileList) {
    this.imagesSignal.set(files);
  }

  selectCondition(conditionId: string): void {
    this.form.patchValue({ condition: conditionId });
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
          this.router.navigate(['/error/'], {
            state: {
              message: 'Parece que no se pudo subir la imagen'
            }
          });
          return;
        }
        newImages.push((url as SuccessResponse).data);
      });
      this.urlsSignal.set(newImages);
    }).catch((error) => {
      console.error('Error al subir imágenes:', error);
    });
  }

  createProduct() {
    const { title, price, desc, categoryId, condition } = this.form.value;

    const newProduct: Product = {
      id: '',
      sellerId: '',
      title: title,
      price: price,
      desc: desc,
      categoryId: categoryId,
      condition: condition,
      images: this.urlsSignal(),
      createdAt: new Date(),
      updatedAt: new Date(),
      status: [],
    }

    this.createProductSubscription = this.productsService.createProduct(newProduct).subscribe({
      next: (response: CustomResponse) => {
        if (response instanceof SuccessResponse) {
          this.router.navigate(['/product', response.data.slug]);
          return;
        }
        this.router.navigate(['/error/'], {
          state: {
            message: 'Parece que no se pudo crear el producto'
          }
        });
      },
    });
  }

  async onSubmit(): Promise<void> {
    this.submitted = true;
    this.existImage = this.imagesSignal().length > 0;

    const valid = this.form.valid && this.existImage;

    if (!valid) {
      return;
    }

    const user = this.authService.currentUser();
    if (user && !user.emailVerified) {
      this.router.navigate(['/verify-email'], { queryParams: { returnUrl: '/create-product' } });
      return;
    }

    this.isLoading = true;
    this.createProductState.set(new LoadingState());

    await this.uploadImages();
    this.createProduct();
  }
  
}
