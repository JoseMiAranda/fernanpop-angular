import { Component, OnInit, signal } from '@angular/core';
import { ProductsService } from '../../../../services/products.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PaginatorModule } from 'primeng/paginator';
import { ListProductsComponent } from '../../../components/list-products/list-products.component';
import { AuthService } from '../../../../services/auth.service';
import { CustomResponse, ErrorResponse, SuccessResponse } from '../../../../interfaces/response-interface';
import { ErrorState, LoadingState, State, SuccessState } from '../../../../interfaces/state.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-products',
  standalone: true,
  imports: [CommonModule, ListProductsComponent, PaginatorModule, RouterLink],
  templateUrl: './user-products.component.html',
  styleUrl: './user-products.component.css'
})
export class UserProductsComponent implements OnInit {
  public productState = signal<State>(new LoadingState());
  private currentUser = this.authService.currentUser;

  constructor(private productsService: ProductsService, private authService: AuthService, private route: ActivatedRoute, private router: Router) {}
  
  ngOnInit(): void {
    this.productsService.getUserProducts(this.currentUser()!.accessToken).subscribe({
      next: (response: CustomResponse) => {
        if (response instanceof SuccessResponse) {
          this.productState.set(new SuccessState(response.data));
        } else if (response instanceof ErrorResponse) {
          this.productState.set(new ErrorState(response.error));
        }
      },
    })
  }
}
