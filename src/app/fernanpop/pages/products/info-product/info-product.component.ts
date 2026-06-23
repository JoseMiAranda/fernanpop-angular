import { Component, Input, OnDestroy, OnInit, signal } from '@angular/core';
import { ProductsService } from '../../../../services/products.service';
import { CategoriesService } from '../../../../services/categories.service';
import { Router } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { CurrentCurrencyPipe } from '../../../../pipes/current-currency.pipe';
import { TransactionsService } from '../../../../services/transactions.service';
import { FavoritesService } from '../../../../services/favorites.service';
import { ImageGalleryComponent } from '../../../components/image-gallery/image-gallery.component';
import { ButtonComponent, CardComponent, PageContainerComponent } from '../../../../shared/ui';
import { CategoryNamePipe } from '../../../../pipes/category-name.pipe';
import { ConditionNamePipe } from '../../../../pipes/condition-name.pipe';
import { Category } from '../../../../interfaces/category.interface';
import { ErrorState, InitialState, LoadingState, State, SuccessState } from '../../../../states/state.interface';
import { CustomResponse, ErrorResponse, SuccessResponse } from '../../../../interfaces/response-interface';
import { Subscription } from 'rxjs';
import { RouterLink } from '@angular/router';
import { SellerSummary } from '../../../../interfaces/seller.interface';
import { ReviewsService } from '../../../../services/reviews.service';
import { SellerReviewsSummary } from '../../../../interfaces/review.interface';

@Component({
  selector: 'app-info-product',
  standalone: true,
  imports: [CommonModule, CurrentCurrencyPipe, ImageGalleryComponent, CategoryNamePipe, ConditionNamePipe, RouterLink, ButtonComponent, CardComponent, PageContainerComponent],
  templateUrl: './info-product.component.html',
  styleUrl: './info-product.component.css'
})
export class InfoProductComponent implements OnInit, OnDestroy {

  @Input('slug') productSlug: string | undefined;

  public currentUser = this.authService.currentUser;
  public favoriteIds = this.favoritesService.favoriteIds;
  public productState = signal<State>(new LoadingState());
  images: string[] = [];
  private getProductsByIdSubscription: Subscription = new Subscription();
  public buyProductState = signal<State>(new InitialState());
  public selectedImageIndex = signal(0);
  public sellerReviewsSummary = signal<SellerReviewsSummary>({ averageScore: 0, totalReviews: 0, reviews: [] });
  public categories: Category[] = [];
  private buyProductSubscription: Subscription = new Subscription();
  private categoriesSubscription: Subscription = new Subscription();
  private reviewsSubscription: Subscription = new Subscription();

  constructor(
    private transactionsService: TransactionsService,
    private favoritesService: FavoritesService,
    private productService: ProductsService,
    private categoriesService: CategoriesService,
    private reviewsService: ReviewsService,
    private authService: AuthService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.categoriesSubscription = this.categoriesService.getCategories().subscribe({
      next: (response: CustomResponse) => {
        if (response instanceof SuccessResponse) {
          this.categories = response.data;
        }
      },
    });

    this.getProductsByIdSubscription = this.productService.getProductBySlug(this.productSlug!).subscribe({
      next: (response: CustomResponse) => {
        if (response instanceof SuccessResponse) {
          this.productState.set(new SuccessState(response.data));
          this.images = this.productState().data.images;
          this.selectedImageIndex.set(0);

          const sellerId = response.data.seller?.id ?? response.data.sellerId;
          if (sellerId) {
            this.loadSellerReviews(sellerId);
          }
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
    this.reviewsSubscription.unsubscribe();
  }

  private loadSellerReviews(sellerId: string): void {
    this.reviewsSubscription.unsubscribe();
    this.reviewsSubscription = this.reviewsService.getSellerReviews(sellerId).subscribe({
      next: (response: CustomResponse) => {
        if (response instanceof SuccessResponse) {
          this.sellerReviewsSummary.set(response.data);
        }
      },
    });
  }

  buy() {
    this.buyProductState.set(new LoadingState());

    if (!this.authService.currentUser()) {
      this.router.navigate(['/login']);
      return;
    }

    if (this.productState().type !== 'success') {
      return;
    }

    this.buyProductSubscription = this.transactionsService.createTransaction(this.productState().data.id)
      .subscribe({
        next: (result: CustomResponse) => {
          if (result instanceof SuccessResponse) {
            this.router.navigate(['/user/transactions']);
          } else if (result instanceof ErrorResponse) {
            this.router.navigate(['/error/'], {
              state: {
                message: 'Parece que no se puede comprar el producto'
              }
            });
          }
        }
      });
  }

  goToUpdate() {
    this.router.navigate(['/update-product', this.productState().data.id]);
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

  seller(): SellerSummary | null {
    if (this.productState().type !== 'success') {
      return null;
    }

    return this.productState().data.seller ?? null;
  }

  sellerInitials(name: string): string {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('');
  }

  formatRating(score: number): string {
    return score % 1 === 0 ? score.toFixed(0) : score.toFixed(1);
  }

  canShowFavorite(): boolean {
    if (this.productState().type !== 'success') {
      return false;
    }

    const currentUser = this.currentUser();
    return !!currentUser && currentUser.uid !== this.productState().data.sellerId;
  }

  isFavorite(): boolean {
    if (this.productState().type !== 'success') {
      return false;
    }

    const productId = this.productState().data.id;
    return this.favoriteIds().has(productId);
  }

  toggleFavorite(): void {
    if (!this.authService.currentUser()) {
      this.router.navigate(['/login']);
      return;
    }

    if (this.productState().type !== 'success') {
      return;
    }

    this.favoritesService.toggleFavorite(this.productState().data.id).subscribe();
  }

}
