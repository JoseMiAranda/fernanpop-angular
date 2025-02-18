import { Component, OnDestroy, signal } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ProductsService } from '../../../../services/products.service';
import { ListProductsComponent } from '../../../components/list-products/list-products.component';
import { Subscription } from 'rxjs';
import { PaginatorModule } from 'primeng/paginator';
import { ErrorState, LoadingState, State, SuccessState } from '../../../../interfaces/state.interface';
import { CustomResponse, ErrorResponse, SuccessResponse } from '../../../../interfaces/response-interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-search-product',
  standalone: true,
  imports: [CommonModule, ListProductsComponent, PaginatorModule],
  templateUrl: './search-product.component.html',
  styleUrl: './search-product.component.css'
})
export class SearchProductComponent implements OnDestroy {

  public productsState = signal<State>(new LoadingState());
  
  private subscription: Subscription = new Subscription();

  queryParams: any = {};
  
  constructor(private productsService: ProductsService, private route: ActivatedRoute, private router: Router) { 
    this.subscription.add(this.route.queryParams.subscribe((params: Params) => {
      this.queryParams = params;

      this.subscription.add(
        this.productsService.getProducts({}).subscribe({
          next: (response: CustomResponse) => {
            if (response instanceof SuccessResponse) {
              this.productsState.set(new SuccessState(response.data));
            } else if (response instanceof ErrorResponse) {
              this.productsState.set(new ErrorState(response.error));
            }
          },
        })
      );
    }));
  }
  

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onPageChange(pageDetails: any) {
    let {page,...rest} = pageDetails;
    page++;
    this.queryParams = {...this.queryParams, page};
    this.router.navigate(['/fernanpop/products'], {
      queryParams: {...this.queryParams}
    });
  }
}
