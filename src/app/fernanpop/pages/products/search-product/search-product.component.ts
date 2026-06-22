import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductsService } from '../../../../services/products.service';
import { CategoriesService } from '../../../../services/categories.service';
import { ListProductsComponent } from '../../../components/list-products/list-products.component';
import { Subscription } from 'rxjs';
import { ErrorState, LoadingState, State, SuccessState } from '../../../../states/state.interface';
import { CustomResponse, ErrorResponse, SuccessResponse } from '../../../../interfaces/response-interface';
import { CommonModule } from '@angular/common';
import { PaginatorComponent } from '../../../components/paginator/paginator.component';
import { Category } from '../../../../interfaces/category.interface';

@Component({
  selector: 'app-search-product',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ListProductsComponent, PaginatorComponent],
  templateUrl: './search-product.component.html',
})
export class SearchProductComponent implements OnInit, OnDestroy {

  public productsState = signal<State>(new LoadingState());
  public categories: Category[] = [];
  public filterForm: FormGroup;
  private queryParams: Params = {};
  private queryParamsSubscription: Subscription = new Subscription();
  private productsSubscription: Subscription = new Subscription();
  private categoriesSubscription: Subscription = new Subscription();

  constructor(
    private productsService: ProductsService,
    private categoriesService: CategoriesService,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
  ) {
    this.filterForm = this.formBuilder.group({
      price_min: [null, [Validators.min(0)]],
      price_max: [null, [Validators.min(0)]],
      categoryId: [''],
    });
  }

  ngOnInit(): void {
    this.categoriesSubscription = this.categoriesService.getCategories().subscribe({
      next: (response: CustomResponse) => {
        if (response instanceof SuccessResponse) {
          this.categories = response.data;
        }
      },
    });

    this.queryParamsSubscription = this.route.queryParams.subscribe((params: Params) => {
      this.queryParams = params;
      this.syncFormFromQueryParams(params);

      this.productsSubscription.unsubscribe();
      this.productsSubscription = this.productsService.getProducts(this.buildApiParams(params)).subscribe({
        next: (response: CustomResponse) => {
          if (response instanceof SuccessResponse) {
            this.productsState.set(new SuccessState(response.data));
          } else if (response instanceof ErrorResponse) {
            this.productsState.set(new ErrorState(response.error));
          }
        },
      });
    });
  }

  ngOnDestroy(): void {
    this.queryParamsSubscription.unsubscribe();
    this.productsSubscription.unsubscribe();
    this.categoriesSubscription.unsubscribe();
  }

  get f(): { [key: string]: AbstractControl } {
    return this.filterForm.controls;
  }

  applyFilters(): void {
    if (this.filterForm.invalid) {
      return;
    }

    const { price_min, price_max, categoryId } = this.filterForm.value;
    const queryParams: Params = {
      ...this.queryParams,
      page: 1,
    };

    if (price_min != null && price_min !== '') {
      queryParams['price_min'] = price_min;
    } else {
      delete queryParams['price_min'];
    }

    if (price_max != null && price_max !== '') {
      queryParams['price_max'] = price_max;
    } else {
      delete queryParams['price_max'];
    }

    if (categoryId) {
      queryParams['categoryId'] = categoryId;
    } else {
      delete queryParams['categoryId'];
    }

    this.router.navigate(['/fernanpop/products'], { queryParams });
  }

  clearFilters(): void {
    const { q } = this.queryParams;
    const queryParams: Params = { page: 1 };
    if (q) {
      queryParams['q'] = q;
    }
    this.router.navigate(['/fernanpop/products'], { queryParams });
  }

  onPageChange(page: number): void {
    this.router.navigate(['/fernanpop/products'], {
      queryParams: { ...this.queryParams, page },
    });
  }

  private syncFormFromQueryParams(params: Params): void {
    this.filterForm.patchValue({
      price_min: params['price_min'] ?? null,
      price_max: params['price_max'] ?? null,
      categoryId: params['categoryId'] ?? '',
    }, { emitEvent: false });
  }

  private buildApiParams(params: Params) {
    return {
      page: params['page'] ? Number(params['page']) : 1,
      q: params['q'] ?? '',
      price_min: params['price_min'] != null ? Number(params['price_min']) : undefined,
      price_max: params['price_max'] != null ? Number(params['price_max']) : undefined,
      categoryId: params['categoryId'] ?? undefined,
    };
  }
}
