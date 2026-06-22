import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Product, ProductStatus } from '../../../interfaces/product.interface';
import { Category } from '../../../interfaces/category.interface';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CurrentCurrencyPipe } from '../../../pipes/current-currency.pipe';
import { CategoryNamePipe } from '../../../pipes/category-name.pipe';
import { AuthService } from '../../../services/auth.service';
import { CategoriesService } from '../../../services/categories.service';
import { CustomResponse, SuccessResponse } from '../../../interfaces/response-interface';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-list-products',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrentCurrencyPipe, CategoryNamePipe],
  templateUrl: './list-products.component.html',
  styleUrl: './list-products.component.css'
})
export class ListProductsComponent implements OnInit, OnDestroy {
  user = this.authService.currentUser;
  public categories: Category[] = [];
  private categoriesSubscription: Subscription = new Subscription();

  @Input() listProducts: Product[] = [];
  @Input() compact = false;
  @Input() variant: 'legacy' | 'stitch' = 'legacy';

  constructor(
    private authService: AuthService,
    private categoriesService: CategoriesService,
  ) {}

  ngOnInit(): void {
    this.categoriesSubscription = this.categoriesService.getCategories().subscribe({
      next: (response: CustomResponse) => {
        if (response instanceof SuccessResponse) {
          this.categories = response.data;
        }
      },
    });
  }

  ngOnDestroy(): void {
    this.categoriesSubscription.unsubscribe();
  }

  isReserved(product: Product): boolean {
    return product.status.includes(ProductStatus.RESERVED);
  }
}
