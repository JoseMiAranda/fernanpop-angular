import { Component, OnDestroy, OnInit, computed, signal } from '@angular/core';
import { FavoritesService } from '../../../services/favorites.service';
import { ListProductsComponent } from '../../components/list-products/list-products.component';
import {
  EmptyStateComponent,
  PageContainerComponent,
  PageTitleComponent,
  TextComponent,
} from '../../../shared/ui';
import { CustomResponse, ErrorResponse, SuccessResponse } from '../../../interfaces/response-interface';
import { ErrorState, LoadingState, State, SuccessState } from '../../../states/state.interface';
import { Product } from '../../../interfaces/product.interface';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [
    CommonModule,
    ListProductsComponent,
    PageContainerComponent,
    PageTitleComponent,
    EmptyStateComponent,
    TextComponent,
  ],
  templateUrl: './favorites.component.html',
  styleUrl: './favorites.component.css'
})
export class FavoritesComponent implements OnInit, OnDestroy {
  public favoritesState = signal<State>(new LoadingState());
  public displayedProducts = computed(() => {
    if (this.favoritesState().type !== 'success') {
      return [];
    }

    const favoriteIds = this.favoritesService.favoriteIds();
    return this.favoritesState().data.filter((product: Product) => favoriteIds.has(product.id!));
  });

  private getFavoritesSubscription: Subscription = new Subscription();

  constructor(private favoritesService: FavoritesService) {}

  ngOnInit(): void {
    this.getFavoritesSubscription = this.favoritesService.getFavorites().subscribe({
      next: (response: CustomResponse) => {
        if (response instanceof SuccessResponse) {
          this.favoritesState.set(new SuccessState(response.data));
        } else if (response instanceof ErrorResponse) {
          this.favoritesState.set(new ErrorState(response.error));
        }
      },
    });
  }

  ngOnDestroy(): void {
    this.getFavoritesSubscription.unsubscribe();
  }
}
