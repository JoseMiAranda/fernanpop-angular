import { Component, HostListener, OnDestroy, OnInit, signal } from '@angular/core';
import { ProductsService } from '../../../services/products.service';
import { CategoriesService } from '../../../services/categories.service';
import { ListProductsComponent } from '../../components/list-products/list-products.component';
import {
  ButtonComponent,
  EyebrowComponent,
  SectionHeadingComponent,
  TextComponent,
} from '../../../shared/ui';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ErrorState, LoadingState, State, SuccessState } from '../../../states/state.interface';
import { CustomResponse, ErrorResponse, SuccessResponse } from '../../../interfaces/response-interface';
import { Category } from '../../../interfaces/category.interface';
import { Product } from '../../../interfaces/product.interface';

interface CategoryTile {
  id: string;
  name: string;
  subtitle?: string;
  image: string;
  colSpan: 1 | 2;
}

const CATEGORY_TILE_CONFIG: Record<string, { subtitle?: string; image: string; colSpan: 1 | 2; order: number }> = {
  electronica: {
    subtitle: 'Móviles, ordenadores y gadgets',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=1200&q=80',
    colSpan: 2,
    order: 1,
  },
  ropa: {
    image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=800&q=80',
    colSpan: 1,
    order: 2,
  },
  hogar: {
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80',
    colSpan: 1,
    order: 3,
  },
  deportes: {
    subtitle: 'Equipamiento y accesorios',
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=1200&q=80',
    colSpan: 2,
    order: 4,
  },
  otros: {
    subtitle: 'Todo lo demás',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=80',
    colSpan: 2,
    order: 5,
  },
};

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ListProductsComponent, ButtonComponent, EyebrowComponent, SectionHeadingComponent, TextComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit, OnDestroy {

  public productsState = signal<State>(new LoadingState());
  public categories = signal<Category[]>([]);
  public categoryTiles = signal<CategoryTile[]>([]);
  public showBackToTop = signal(false);

  readonly heroImage =
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1600&q=80';

  private getProductsSubscription: Subscription = new Subscription();
  private categoriesSubscription: Subscription = new Subscription();

  constructor(
    private productsService: ProductsService,
    private categoriesService: CategoriesService,
    private router: Router,
  ) {}

  featuredProducts(): Product[] {
    const state = this.productsState();
    if (state.type !== 'success') {
      return [];
    }
    return state.data['products'] ?? [];
  }

  browseMarketplace(): void {
    this.router.navigate(['/fernanpop/products']);
  }

  browseCategory(categoryId: string): void {
    this.router.navigate(['/fernanpop/products'], { queryParams: { categoryId, page: 1 } });
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.showBackToTop.set(window.scrollY > 500);
  }

  ngOnInit(): void {
    this.categoriesSubscription = this.categoriesService.getCategories().subscribe({
      next: (response: CustomResponse) => {
        if (response instanceof SuccessResponse) {
          const categories: Category[] = response.data;
          this.categories.set(categories);
          this.categoryTiles.set(this.buildCategoryTiles(categories));
        }
      },
    });

    this.getProductsSubscription = this.productsService.getProducts({}).subscribe({
      next: (response: CustomResponse) => {
        if (response instanceof SuccessResponse) {
          this.productsState.set(new SuccessState(response.data));
        } else if (response instanceof ErrorResponse) {
          this.productsState.set(new ErrorState(response.error));
        }
      },
    });
  }

  ngOnDestroy(): void {
    this.getProductsSubscription.unsubscribe();
    this.categoriesSubscription.unsubscribe();
  }

  private buildCategoryTiles(categories: Category[]): CategoryTile[] {
    return categories
      .filter((category) => CATEGORY_TILE_CONFIG[category.id])
      .sort((a, b) => CATEGORY_TILE_CONFIG[a.id].order - CATEGORY_TILE_CONFIG[b.id].order)
      .map((category) => {
        const config = CATEGORY_TILE_CONFIG[category.id];
        return {
          id: category.id,
          name: category.name,
          subtitle: config.subtitle,
          image: config.image,
          colSpan: config.colSpan,
        };
      });
  }
}
