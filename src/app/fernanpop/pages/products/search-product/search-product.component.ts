import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ProductsService } from '../../../../services/products.service';
import { ListProductsComponent } from '../../../components/list-products/list-products.component';
import { Subscription } from 'rxjs';
import { PaginatorModule } from 'primeng/paginator';
import { ErrorState, LoadingState, State, SuccessState } from '../../../../states/state.interface';
import { CustomResponse, ErrorResponse, SuccessResponse } from '../../../../interfaces/response-interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-search-product',
  standalone: true,
  imports: [CommonModule, ListProductsComponent, PaginatorModule],
  templateUrl: './search-product.component.html',
  styleUrl: './search-product.component.css'
})
export class SearchProductComponent implements OnInit, OnDestroy {

  public productsState = signal<State>(new LoadingState());
  private queryParams: any = {};
  private queryParamsSubscription: Subscription = new Subscription();
  private productsSubscription: Subscription = new Subscription();

  constructor(private productsService: ProductsService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    this.queryParamsSubscription = this.route.queryParams.subscribe((params: Params) => {
      this.queryParams = params;
      this.productsSubscription = this.productsService.getProducts(this.queryParams).subscribe({
        next: (response: CustomResponse) => {
          console.log(response);
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
  }

  onPageChange(pageDetails: any) {
    let { page, ...rest } = pageDetails;
    page++;
    this.queryParams = { ...this.queryParams, page };
    this.router.navigate(['/fernanpop/products'], {
      queryParams: { ...this.queryParams }
    });
  }
}
