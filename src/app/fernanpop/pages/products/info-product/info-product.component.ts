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
import { ErrorState, LoadingState, State, SuccessState } from '../../../../states/state.interface';
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

  public productState = signal<State>(new LoadingState());
  private getProductsByIdSubscription: Subscription = new Subscription();

  public currentUser = this.authService.currentUser;

  constructor(private transactionsService: TransactionsService, private productService: ProductsService, private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.getProductsByIdSubscription = this.productService.getProductById(this.productId!).subscribe({
      next: (response: CustomResponse) => {
        if (response instanceof SuccessResponse) {
          console.log(response.data);
          this.productState.set(new SuccessState(response.data));
        } else if (response instanceof ErrorResponse) {
          this.productState.set(new ErrorState(response.error));
        }
      },
    });
  }

  ngOnDestroy(): void {
    this.getProductsByIdSubscription.unsubscribe();
  }

  buy() {
    if (!this.authService.currentUser()) {
      this.router.navigate(['/fernanpop/login']);
      return;
    }

    this.transactionsService.addTransaction(this.currentUser()!.accessToken, this.productId!)
      .subscribe((result: Transaction | null) => {
        if (result) {
          this.router.navigate(['/fernanpop/user/transactions']);
        } else {
          this.router.navigate(['fernanpop/error/'], {
            state: {
              message: 'Parece que no se puede comprar el producto'
            }
          });
        }
      });
  }

  goToUpdate() {
    this.router.navigate(['/fernanpop/update-product', this.productId]);
  }

}
