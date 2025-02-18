import { Component, Input, OnInit } from '@angular/core';
import { Product } from '../../../../interfaces/product.interface';
import { ProductsService } from '../../../../services/products.service';
import { Router } from '@angular/router';
import { SkeletonModule } from 'primeng/skeleton';
import { AuthService } from '../../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { CurrentCurrencyPipe } from '../../../../pipes/current-currency.pipe';
import { TransactionsService } from '../../../../services/transactions.service';
import { Transaction } from '../../../../interfaces/transaction.interface';
import { ProductButtonComponent } from '../../../components/product-button/product-button.component';

@Component({
  selector: 'app-info-product',
  standalone: true,
  imports: [CommonModule, CurrentCurrencyPipe, SkeletonModule, ProductButtonComponent],
  templateUrl: './info-product.component.html',
  styleUrl: './info-product.component.css'
})
export class InfoProductComponent implements OnInit {

  @Input('id') productId: string | undefined;

  public product?: Product | null;
  public currentUser = this.authService.currentUser;

  constructor(private transactionsService: TransactionsService, private productService: ProductsService, private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.productService.getProductById(this.productId!).subscribe((result: Product | null) => {
      if (!result) {
        // Redirección a error con mensaje
        this.router.navigate(['fernanpop/error/'], {
          state: {
            message: 'Parece que el producto no se encuentra'
          }
        });
      } else {
        this.product = result;
      }
    });
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
