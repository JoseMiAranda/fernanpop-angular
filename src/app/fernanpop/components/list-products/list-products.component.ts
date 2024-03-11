import { Component, Input, OnInit } from '@angular/core';
import { Product } from '../../../interfaces/product.interface';
import { RouterLink } from '@angular/router';
import { SkeletonModule } from 'primeng/skeleton';
import { CommonModule } from '@angular/common';
import { CurrentCurrencyPipe } from '../../pipes/current-currency.pipe';
import { User } from '@angular/fire/auth';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-list-products',
  standalone: true,
  imports: [CommonModule, RouterLink, SkeletonModule, CurrentCurrencyPipe],
  templateUrl: './list-products.component.html',
  styleUrl: './list-products.component.css'
})
export class ListProductsComponent implements OnInit {
  numbers: number[] = [];
 
  user = this.authService.currentUser;
  
  @Input() listProducts: Product[] | undefined;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.numbers = Array(10).fill(0).map((_, i) => i + 1);
  }
}
