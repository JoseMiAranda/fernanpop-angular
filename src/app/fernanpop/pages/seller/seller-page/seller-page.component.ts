import { Component, Input, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { SellersService } from '../../../../services/sellers.service';
import { Seller } from '../../../../interfaces/seller.interface';
import { Product } from '../../../../interfaces/product.interface';
import { SoldItem } from '../../../../interfaces/sold-item.interface';
import { ListProductsComponent } from '../../../components/list-products/list-products.component';
import { CurrentCurrencyPipe } from '../../../../pipes/current-currency.pipe';
import { ErrorState, LoadingState, State, SuccessState } from '../../../../states/state.interface';
import { CustomResponse, ErrorResponse, SuccessResponse } from '../../../../interfaces/response-interface';
import { forkJoin, Subscription } from 'rxjs';

type SellerTab = 'active' | 'sold';

@Component({
  selector: 'app-seller-page',
  standalone: true,
  imports: [CommonModule, ListProductsComponent, CurrentCurrencyPipe],
  templateUrl: './seller-page.component.html',
})
export class SellerPageComponent implements OnInit, OnDestroy {
  @Input('id') sellerId: string | undefined;

  public pageState = signal<State>(new LoadingState());
  public activeTab = signal<SellerTab>('active');
  public seller = signal<Seller | null>(null);
  public products = signal<Product[]>([]);
  public soldItems = signal<SoldItem[]>([]);

  private loadSubscription: Subscription = new Subscription();

  constructor(
    private sellersService: SellersService,
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
    }).subscribe({
      next: ({ seller, products, sold }) => {
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

        if (sold instanceof SuccessResponse) {
          this.soldItems.set(sold.data);
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

  sellerInitials(name: string): string {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('');
  }

  formatSoldDate(value: string): string {
    const date = new Date(value);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }
}
