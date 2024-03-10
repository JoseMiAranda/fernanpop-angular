import { Component } from '@angular/core';
import { ProductsResponse } from '../../../../interfaces/product.interface';
import { Subscription } from 'rxjs';
import { ProductsService } from '../../../../services/products.service';
import { ActivatedRoute, Params, Router, RouterLink } from '@angular/router';
import { PaginatorModule } from 'primeng/paginator';
import { ListProductsComponent } from '../../../components/list-products/list-products.component';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-user-products',
  standalone: true,
  imports: [ListProductsComponent, PaginatorModule, RouterLink],
  templateUrl: './user-products.component.html',
  styleUrl: './user-products.component.css'
})
export class UserProductsComponent {
  public productsResponse?: ProductsResponse | null;
  private subscription: Subscription = new Subscription();
  private currentUser = this.authService.currentUser;

  queryParams: any = {};
  
  constructor(private productsService: ProductsService, private authService: AuthService, private route: ActivatedRoute, private router: Router) { 
    this.subscription.add(this.route.queryParams.subscribe((params: Params) => {
      this.queryParams = params;
      console.log(this.queryParams); 
      
      console.log(this.currentUser()!.accessToken);

      this.subscription.add(this.productsService.getUserProducts(this.currentUser()!.accessToken).subscribe((resp) => {
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
    console.log(page);
    this.queryParams = {...this.queryParams, page};
    this.router.navigate(['/fernanpop/user/products'], {
      queryParams: {...this.queryParams}
    });
  }
}
