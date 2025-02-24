import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductsService } from '../../../../services/products.service';
import { Product } from '../../../../interfaces/product.interface';
import { forkJoin, Subscription } from 'rxjs';
import { CustomResponse, ErrorResponse, SuccessResponse } from '../../../../interfaces/response-interface';
import { InitialState, LoadingState, State } from '../../../../states/state.interface';
import { GreenButtonComponent } from '../../../components/green-button/green-button.component';
import { ImageDropComponent } from '../../../components/image-drop/image-drop.component';
import { ListImagesComponent } from '../../../components/list-images/list-images.component';
import { ImagesService } from '../../../../services/images.service';

@Component({
  selector: 'app-create-product',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, GreenButtonComponent, ImageDropComponent, ListImagesComponent],
  templateUrl: './create-product.component.html',
  styleUrl: './create-product.component.css'
})
export class CreateProductComponent implements OnInit, OnDestroy {
  public minLenght = 6;
  public maxLenght = 50;
  public maxDescLenght = 300;
  private currentUser = this.authService.currentUser;
  public productState = signal<State>(new LoadingState());
  public imagesSignal = signal<FileList>(new DataTransfer().files);
  private urlsSignal = signal<string[]>([]); 
  public createProductState = signal<State>(new InitialState());
  public deleteProductState = signal<State>(new InitialState());
  private createProductSubscription: Subscription = new Subscription();
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
    private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
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
    this.createProductSubscription.unsubscribe();
  }

  // Obtenemos un campo del formulario
  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
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
      this.urlsSignal.set(newImages);
    }).catch((error) => {
      console.error('Error al subir imágenes:', error);
    });
  }

  createProduct() {
    const { title, price, desc } = this.form.value;

    const newProduct: Product = {
      id: '',
      sellerId: '',
      title: title,
      price: price,
      desc: desc,
      images: this.urlsSignal(),
      createdAt: new Date(),
      updatedAt: new Date(),
      status: [],
    }

    this.createProductSubscription = this.productsService.createProduct(this.currentUser()!.accessToken, newProduct).subscribe({
      next: (response: CustomResponse) => {
        if (response instanceof SuccessResponse) {
          this.router.navigate(['/fernanpop/product', response.data.id]);
          return;
        }
        this.router.navigate(['fernanpop/error/'], {
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

    this.isLoading = true;
    this.createProductState.set(new LoadingState());

    await this.uploadImages();
    this.createProduct();
  }
  
}
