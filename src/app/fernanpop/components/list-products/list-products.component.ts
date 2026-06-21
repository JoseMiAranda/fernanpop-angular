import { Component, Input } from '@angular/core';
import { Product, ProductStatus } from '../../../interfaces/product.interface';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CurrentCurrencyPipe } from '../../../pipes/current-currency.pipe';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-list-products',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrentCurrencyPipe],
  templateUrl: './list-products.component.html',
  styleUrl: './list-products.component.css'
})
export class ListProductsComponent {
  user = this.authService.currentUser;

  @Input() listProducts: Product[] = [];

  constructor(private authService: AuthService) {}

  isReserved(product: Product): boolean {
    return product.status.includes(ProductStatus.RESERVED);
  }
}
