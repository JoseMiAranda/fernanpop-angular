import { Component, Input, OnInit } from '@angular/core';
import { Product } from '../../../../interfaces/product.interface';
import { ProductsService } from '../../../../services/products.service';
import { Router } from '@angular/router';
import { SkeletonModule } from 'primeng/skeleton';
import { AuthService } from '../../../../services/auth.service';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { CurrentCurrencyPipe } from '../../../pipes/current-currency.pipe';

@Component({
  selector: 'app-info-product',
  standalone: true,
  imports: [CommonModule, CurrentCurrencyPipe, SkeletonModule],
  templateUrl: './info-product.component.html',
  styleUrl: './info-product.component.css'
})
export class InfoProductComponent implements OnInit {

  @Input('id') productId: string | undefined;

  public product?: Product | null;
  public currentUser = this.authService.currentUser;

  constructor(private productService: ProductsService, private authService: AuthService, private router: Router) { }

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

  onClick() {
    console.log(this.authService.currentUser());
  }

}
