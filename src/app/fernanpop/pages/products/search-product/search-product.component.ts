import { Component, Input, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ProductsService } from '../../../../services/products.service';
import { ProductsResponse } from '../../../../interfaces/product.interface';
import { ListProductsComponent } from '../../../components/list-products/list-products.component';
import { Subscription } from 'rxjs';
import { PaginatorModule } from 'primeng/paginator';

@Component({
  selector: 'app-search-product',
  standalone: true,
  imports: [ListProductsComponent, PaginatorModule],
  templateUrl: './search-product.component.html',
  styleUrl: './search-product.component.css'
})
export class SearchProductComponent implements OnDestroy {

  public productsResponse: ProductsResponse | undefined | null = undefined;
  private subscription: Subscription = new Subscription();

  queryParams: any = {};
  
  constructor(private productsService: ProductsService, private route: ActivatedRoute, private router: Router) { 
    this.subscription.add(this.route.queryParams.subscribe((params: Params) => {
      this.queryParams = params;
  
      this.subscription.add(this.productsService.getProducts({...this.queryParams}).subscribe((resp) => {
        this.productsResponse = resp;
      }));
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
