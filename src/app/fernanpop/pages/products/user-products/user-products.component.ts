import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { ProductsService } from '../../../../services/products.service';
import { ListProductsComponent } from '../../../components/list-products/list-products.component';
import {
  BreadcrumbsComponent,
  ButtonComponent,
  EmptyStateComponent,
  PageContainerComponent,
  PageTitleComponent,
  TextComponent,
} from '../../../../shared/ui';
import { CustomResponse, ErrorResponse, SuccessResponse } from '../../../../interfaces/response-interface';
import { ErrorState, LoadingState, State, SuccessState } from '../../../../states/state.interface';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user-products',
  standalone: true,
  imports: [
    CommonModule,
    ListProductsComponent,
    PageContainerComponent,
    PageTitleComponent,
    BreadcrumbsComponent,
    ButtonComponent,
    EmptyStateComponent,
    TextComponent,
  ],
  templateUrl: './user-products.component.html',
  styleUrl: './user-products.component.css'
})
export class UserProductsComponent implements OnInit, OnDestroy {
  public productState = signal<State>(new LoadingState());
  private getUserProductsSubscription: Subscription = new Subscription();

  constructor(private productsService: ProductsService) {}
  
  ngOnInit(): void {
    this.getUserProductsSubscription = this.productsService.getUserProducts().subscribe({
      next: (response: CustomResponse) => {
        if (response instanceof SuccessResponse) {
          this.productState.set(new SuccessState(response.data));
        } else if (response instanceof ErrorResponse) {
          this.productState.set(new ErrorState(response.error));
        }
      },
    })
  }

  ngOnDestroy(): void {
    this.getUserProductsSubscription.unsubscribe();
  }
}
