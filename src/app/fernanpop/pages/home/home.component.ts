import { Component, HostListener, OnDestroy, OnInit, signal } from '@angular/core';
import { ProductsService } from '../../../services/products.service';
import { CategoriesService } from '../../../services/categories.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ErrorState, LoadingState, State, SuccessState } from '../../../states/state.interface';
import { CustomResponse, ErrorResponse, SuccessResponse } from '../../../interfaces/response-interface';
import { Category } from '../../../interfaces/category.interface';
import { Product } from '../../../interfaces/product.interface';
import { HeroSectionComponent } from './sections/hero-section/hero-section.component';
import { FeaturedSectionComponent } from './sections/featured-section/featured-section.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HeroSectionComponent, FeaturedSectionComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit, OnDestroy {

  public productsState = signal<State>(new LoadingState());
  public categories = signal<Category[]>([]);
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
    this.router.navigate(['/products']);
  }

  browseCategory(categoryId: string): void {
    this.router.navigate(['/products'], { queryParams: { categoryId, page: 1 } });
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
}
