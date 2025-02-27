import { Component, Input, OnDestroy, OnInit, signal } from '@angular/core';
import { ProductsService } from '../../../../services/products.service';
import { Router } from '@angular/router';
import { SkeletonModule } from 'primeng/skeleton';
import { AuthService } from '../../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { CurrentCurrencyPipe } from '../../../../pipes/current-currency.pipe';
import { TransactionsService } from '../../../../services/transactions.service';
import { Transaction } from '../../../../interfaces/transaction.interface';
import { GreenButtonComponent } from '../../../components/green-button/green-button.component';
import { ErrorState, InitialState, LoadingState, State, SuccessState } from '../../../../states/state.interface';
import { CustomResponse, ErrorResponse, SuccessResponse } from '../../../../interfaces/response-interface';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-info-product',
  standalone: true,
  imports: [CommonModule, CurrentCurrencyPipe, SkeletonModule, GreenButtonComponent],
  templateUrl: './info-product.component.html',
  styleUrl: './info-product.component.css'
})
export class InfoProductComponent implements OnInit, OnDestroy {

  @Input('id') productId: string | undefined;

  public currentUser = this.authService.currentUser;
  public productState = signal<State>(new LoadingState());
  private getProductsByIdSubscription: Subscription = new Subscription();
  public buyProductState = signal<State>(new InitialState());
  private buyProductSubscription: Subscription = new Subscription();

  constructor(private transactionsService: TransactionsService, private productService: ProductsService, private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.getProductsByIdSubscription = this.productService.getProductById(this.productId!).subscribe({
      next: (response: CustomResponse) => {
        if (response instanceof SuccessResponse) {
          this.productState.set(new SuccessState(response.data));
        } else if (response instanceof ErrorResponse) {
          this.productState.set(new ErrorState(response.error));
        }
      },
    });
  }

  ngOnDestroy(): void {
    this.getProductsByIdSubscription.unsubscribe();
    this.buyProductSubscription.unsubscribe();
  }

  buy() {
    this.buyProductState.set(new LoadingState());

    if (!this.authService.currentUser()) {
      this.router.navigate(['/fernanpop/login']);
      return;
    }

    this.buyProductSubscription = this.transactionsService.createTransaction(this.productId!)
      .subscribe({
        next: (result: CustomResponse) => {
          if (result instanceof SuccessResponse) {
            this.router.navigate(['/fernanpop/user/transactions']);
          } else if (result instanceof ErrorResponse) {
            this.router.navigate(['fernanpop/error/'], {
              state: {
                message: 'Parece que no se puede comprar el producto'
              }
            });
          }
        }
      });
  }

  goToUpdate() {
    this.router.navigate(['/fernanpop/update-product', this.productId]);
  }

}
