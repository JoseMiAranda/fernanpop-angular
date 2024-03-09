import { Component, OnDestroy, OnInit } from '@angular/core';
import { ProductsService } from '../../../services/products.service';
import { Observable, Subscription } from 'rxjs';
import { ProductsResponse } from '../../../interfaces/product.interface';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ListProductsComponent } from '../../components/list-products/list-products.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ListProductsComponent],
  templateUrl: './home.component.html',
  styles: ``
})
export class HomeComponent implements OnInit, OnDestroy {

  public productsResponse?: ProductsResponse | null;
  private subscription: Subscription = new Subscription();

  constructor(private productsService: ProductsService, private router: Router) {}

  onClick() {
    this.router.navigate(['/fernanpop/products'], {
      queryParams: {page: 2}
    });
  }
  
  ngOnInit(): void {
    this.subscription.add(this.productsService.getProducts({}).subscribe((resp) => this.productsResponse = resp));
  }
  
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
