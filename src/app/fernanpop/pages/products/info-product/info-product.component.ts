import { Component, Input, OnDestroy, OnInit, signal } from '@angular/core';
import { ProductsService } from '../../../../services/products.service';
import { CategoriesService } from '../../../../services/categories.service';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { CurrentCurrencyPipe } from '../../../../pipes/current-currency.pipe';
import { TransactionsService } from '../../../../services/transactions.service';
import { GreenButtonComponent } from '../../../components/green-button/green-button.component';
import { ImageGalleryComponent } from '../../../components/image-gallery/image-gallery.component';
import { CategoryNamePipe } from '../../../../pipes/category-name.pipe';
import { Category } from '../../../../interfaces/category.interface';
import { ErrorState, InitialState, LoadingState, State, SuccessState } from '../../../../states/state.interface';
import { CustomResponse, ErrorResponse, SuccessResponse } from '../../../../interfaces/response-interface';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-info-product',
  standalone: true,
  imports: [CommonModule, CurrentCurrencyPipe, GreenButtonComponent, ImageGalleryComponent, CategoryNamePipe],
  templateUrl: './info-product.component.html',
  styleUrl: './info-product.component.css'
})
export class InfoProductComponent implements OnInit, OnDestroy {

  @Input('id') productId: string | undefined;

  public currentUser = this.authService.currentUser;
  public productState = signal<State>(new LoadingState());
  images: string[] = [];
  private getProductsByIdSubscription: Subscription = new Subscription();
  public buyProductState = signal<State>(new InitialState());
  public selectedImageIndex = signal(0);
  public categories: Category[] = [];
  private buyProductSubscription: Subscription = new Subscription();
  private categoriesSubscription: Subscription = new Subscription();

  constructor(
    private transactionsService: TransactionsService,
    private productService: ProductsService,
    private categoriesService: CategoriesService,
    private authService: AuthService,
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

    this.getProductsByIdSubscription = this.productService.getProductById(this.productId!).subscribe({
      next: (response: CustomResponse) => {
        if (response instanceof SuccessResponse) {
          this.productState.set(new SuccessState(response.data));
          this.images = this.productState().data.images;
          this.selectedImageIndex.set(0);
        } else if (response instanceof ErrorResponse) {
          this.productState.set(new ErrorState(response.error));
        }
      },
    });
  }

  ngOnDestroy(): void {
    this.getProductsByIdSubscription.unsubscribe();
    this.buyProductSubscription.unsubscribe();
    this.categoriesSubscription.unsubscribe();
  }

  buy() {
    this.buyProductState.set(new LoadingState());

    if (!this.authService.currentUser()) {
      this.router.navigate(['/fernanpop/login']);
      return;
    }

    this.buyProductSubscription = this.transactionsService.createTransaction(this.productId!)
      .subscribe({
        next: (result: CustomResponse) => {
          if (result instanceof SuccessResponse) {
            this.router.navigate(['/fernanpop/user/transactions']);
          } else if (result instanceof ErrorResponse) {
            this.router.navigate(['fernanpop/error/'], {
              state: {
                message: 'Parece que no se puede comprar el producto'
              }
            });
          }
        }
      });
  }

  goToUpdate() {
    this.router.navigate(['/fernanpop/update-product', this.productId]);
  }

  goBack() {
    this.location.back();
  }

  previousImage() {
    const last = this.images.length - 1;
    const next = this.selectedImageIndex() === 0 ? last : this.selectedImageIndex() - 1;
    this.selectedImageIndex.set(next);
  }

  nextImage() {
    const last = this.images.length - 1;
    const next = this.selectedImageIndex() === last ? 0 : this.selectedImageIndex() + 1;
    this.selectedImageIndex.set(next);
  }

}
