import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { ProductsService } from '../../../services/products.service';
import { Subscription } from 'rxjs';
import { CommonModule, NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { ListProductsComponent } from '../../components/list-products/list-products.component';
import { ErrorState, LoadingState, State, SuccessState } from '../../../interfaces/state.interface';
import { CustomResponse, ErrorResponse, SuccessResponse } from '../../../interfaces/response-interface';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ListProductsComponent],
  templateUrl: './home.component.html',
  styles: ``
})
export class HomeComponent implements OnInit, OnDestroy {

  public productsState = signal<State>(new LoadingState());

  private subscription: Subscription = new Subscription();

  constructor(private productsService: ProductsService, private router: Router) {}

  onClick() {
    this.router.navigate(['/fernanpop/products'], {
      queryParams: {page: 2}
    });
  }
  
  ngOnInit(): void {
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
  }
  
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
