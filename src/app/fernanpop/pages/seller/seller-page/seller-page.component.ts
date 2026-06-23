import { Component, Input, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SellersService } from '../../../../services/sellers.service';
import { ReviewsService } from '../../../../services/reviews.service';
import { AuthService } from '../../../../services/auth.service';
import { Seller } from '../../../../interfaces/seller.interface';
import { Product } from '../../../../interfaces/product.interface';
import { SoldItem } from '../../../../interfaces/sold-item.interface';
import { PurchasedItem } from '../../../../interfaces/purchased-item.interface';
import { Review, SellerReviewsSummary } from '../../../../interfaces/review.interface';
import { ListProductsComponent } from '../../../components/list-products/list-products.component';
import { CurrentCurrencyPipe } from '../../../../pipes/current-currency.pipe';
import { ErrorState, LoadingState, State, SuccessState } from '../../../../states/state.interface';
import { CustomResponse, ErrorResponse, SuccessResponse } from '../../../../interfaces/response-interface';
import { forkJoin, Subscription } from 'rxjs';

type SellerTab = 'active' | 'sold' | 'purchased';

@Component({
  selector: 'app-seller-page',
  standalone: true,
  imports: [CommonModule, RouterLink, ListProductsComponent, CurrentCurrencyPipe],
  templateUrl: './seller-page.component.html',
})
export class SellerPageComponent implements OnInit, OnDestroy {
  @Input('id') sellerId: string | undefined;

  public pageState = signal<State>(new LoadingState());
  public activeTab = signal<SellerTab>('active');
  public seller = signal<Seller | null>(null);
  public products = signal<Product[]>([]);
  public soldItems = signal<SoldItem[]>([]);
  public purchasedItems = signal<PurchasedItem[]>([]);
  public reviewsSummary = signal<SellerReviewsSummary>({ averageScore: 0, totalReviews: 0, reviews: [] });

  private loadSubscription: Subscription = new Subscription();

  constructor(
    private sellersService: SellersService,
    private reviewsService: ReviewsService,
    private authService: AuthService,
    private location: Location,
  ) {}

  ngOnInit(): void {
    if (!this.sellerId) {
      this.pageState.set(new ErrorState('seller-not-found'));
      return;
    }

    this.loadSubscription = forkJoin({
      seller: this.sellersService.getSeller(this.sellerId),
      products: this.sellersService.getSellerProducts(this.sellerId),
      sold: this.sellersService.getSellerSold(this.sellerId),
      purchased: this.sellersService.getSellerPurchased(this.sellerId),
      reviews: this.reviewsService.getSellerReviews(this.sellerId),
    }).subscribe({
      next: ({ seller, products, sold, purchased, reviews }) => {
        if (seller instanceof ErrorResponse) {
          this.pageState.set(new ErrorState(seller.error));
          return;
        }

        if (seller instanceof SuccessResponse) {
          this.seller.set(seller.data);
        }

        if (products instanceof SuccessResponse) {
          this.products.set(products.data);
        }

        const reviewsData = reviews instanceof SuccessResponse
          ? reviews.data as SellerReviewsSummary
          : { averageScore: 0, totalReviews: 0, reviews: [] as Review[] };

        this.reviewsSummary.set(reviewsData);

        if (sold instanceof SuccessResponse) {
          const reviewByTransactionId = new Map(
            reviewsData.reviews.map((review) => [review.transactionId, review]),
          );

          const soldWithReviews: SoldItem[] = sold.data.map((item: SoldItem) => {
            const review = item.id ? reviewByTransactionId.get(item.id) : undefined;
            return {
              ...item,
              review: review
                ? {
                    score: review.score,
                    description: review.description,
                    createdAt: review.createdAt,
                  }
                : undefined,
            };
          });

          this.soldItems.set(soldWithReviews);
        }

        if (purchased instanceof SuccessResponse) {
          this.purchasedItems.set(purchased.data);
        }

        this.pageState.set(new SuccessState(null));
      },
    });
  }

  ngOnDestroy(): void {
    this.loadSubscription.unsubscribe();
  }

  setTab(tab: SellerTab): void {
    this.activeTab.set(tab);
  }

  goBack(): void {
    this.location.back();
  }

  isOwnProfile(): boolean {
    const currentUser = this.authService.currentUser();
    return !!currentUser && currentUser.uid === this.sellerId;
  }

  sellerInitials(name: string): string {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('');
  }

  formatSoldDate(value: string): string {
    return this.formatReviewDate(value);
  }

  formatPurchasedDate(value: string): string {
    return this.formatReviewDate(value);
  }

  formatReviewDate(value: string): string {
    const date = new Date(value);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  formatRating(score: number): string {
    return score % 1 === 0 ? score.toFixed(0) : score.toFixed(1);
  }
}
