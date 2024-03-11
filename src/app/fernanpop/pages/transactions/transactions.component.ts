import { Component, OnInit } from '@angular/core';
import { Transaction } from '../../../interfaces/transaction.interface';
import { Subscription } from 'rxjs';
import { ProductsService } from '../../../services/products.service';
import { AuthService } from '../../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { TransactionsService } from '../../../services/transactions.service';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { CurrentCurrencyPipe } from '../../pipes/current-currency.pipe';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, TableModule, CurrentCurrencyPipe, RouterLink],
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.css'
})
export class TransactionsComponent implements OnInit {
  public transactions: any[] = [];
  private subscription: Subscription = new Subscription();
  currentUser = this.authService.currentUser;

  queryParams: any = {};
  
  constructor(private transactionsService: TransactionsService,  private productsService: ProductsService, private authService: AuthService, private router: Router) { 
  }

  ngOnInit(): void {
    // Agregamos todas las subscripciones
    const transSub = this.transactionsService.getTransactions(this.currentUser()!.accessToken).subscribe((respTransactions) => {
      if(respTransactions) {
        console.log(respTransactions)
        respTransactions.forEach((respTransaction) => {
          const prodSub = this.productsService.getProductById(respTransaction.productId).subscribe((respProduct) => {
            if(respProduct) {
              const {title, img, price, ...rest} = respProduct; 
              this.transactions.push({...respTransaction, title, img, price})
            }
          });
          this.subscription.add(prodSub);
        });
      }
    });
    this.subscription.add(transSub);
  }
  
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onPageChange(pageDetails: any) {
    let {page,...rest} = pageDetails;
    page++;
    console.log(page);
    this.queryParams = {...this.queryParams, page};
    this.router.navigate(['/fernanpop/user/products'], {
      queryParams: {...this.queryParams}
    });
  }
}
