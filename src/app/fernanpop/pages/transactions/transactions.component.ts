import { Component, OnInit, signal } from '@angular/core';
import { Transaction } from '../../../interfaces/transaction.interface';
import { Subscription } from 'rxjs';
import { ProductsService } from '../../../services/products.service';
import { AuthService } from '../../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { TransactionsService } from '../../../services/transactions.service';
import { TableModule } from 'primeng/table';
import { CommonModule, DatePipe } from '@angular/common';
import { CurrentCurrencyPipe } from '../../../pipes/current-currency.pipe';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { StatusPipe } from '../../../pipes/status.pipe';
import { StatusTransaction } from '../../../interfaces/product.interface';
import { ColorStatusPipe } from '../../../pipes/color-status.pipe';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, TableModule, CurrentCurrencyPipe, ConfirmDialogModule, RouterLink, ButtonModule, StatusPipe, DatePipe, ColorStatusPipe],
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.css',
  providers: [ConfirmationService, MessageService]
})
export class TransactionsComponent implements OnInit {
  public transactions = signal<any[]>([]);
  private subscription: Subscription = new Subscription();
  currentUser = this.authService.currentUser;

  queryParams: any = {};

  constructor(private transactionsService: TransactionsService, private productsService: ProductsService,
    private confirmationService: ConfirmationService,
    private authService: AuthService, private router: Router) {
  }

  ngOnInit(): void {
    // Agregamos todas las subscripciones
    const transSub = this.transactionsService.getTransactions(this.currentUser()!.accessToken).subscribe((respTransactions) => {
      if (respTransactions) {
        console.log(respTransactions);
        respTransactions.forEach((respTransaction) => {
          const prodSub = this.productsService.getProductById(respTransaction.productId).subscribe((respProduct) => {
            if (respProduct) {
              const { title, img, price, ...rest } = respProduct;
              this.transactions.set([...this.transactions(), { ...respTransaction, title, img, price }]);
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
    let { page, ...rest } = pageDetails;
    page++;
    console.log(page);
    this.queryParams = { ...this.queryParams, page };
    this.router.navigate(['/fernanpop/user/products'], {
      queryParams: { ...this.queryParams }
    });
  }

  onAccept(event: Event, transaction: Transaction): void {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      header: '¿Estás seguro de confirmar?',
      message: 'Asegúrate de que el producto esté en buenas condiciones antes de aceptar',
      icon: 'pi pi-info-triangle',
      acceptButtonStyleClass: "p-button-success p-button-text ml-5",
      rejectButtonStyleClass: "p-button-text p-button-text",
      acceptIcon: "none",
      rejectIcon: "none",
      acceptLabel: "Estoy seguro",
      rejectLabel: "Cancelar",
      reject: () => {
        // No hacemos nada
      },
      accept: () => {
        // Creamos una copia de la transacción y que esté confirmada
        const confirmedTransaction = { ...transaction };
        confirmedTransaction.status = StatusTransaction.RECEIVED;
        this.transactionsService.updateTransaction(this.currentUser()!.accessToken, confirmedTransaction)
          .subscribe((resp) => {
            if (resp) {
              console.log(resp);
              // Actualizamos la lista
              this.transactions.set(this.transactions().map(transactionIndexed => {
                if (transactionIndexed.id == resp.id) {
                  return resp;
                } else {
                  return transactionIndexed;
                }
              }));
            } else {
              this.router.navigate(['fernanpop/error/'], {
                state: {
                  message: 'Parece que no se puede confirmar'
                }
              });
            }
          });
      }
    });
  }


  onCancel(event: Event, transaction: Transaction): void {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      header: '¿Estás seguro de cancelar?',
      message: 'El comprador no podrá recibir el producto',
      icon: 'pi pi-info-triangle',
      acceptButtonStyleClass: "p-button-success p-button-text ml-5",
      rejectButtonStyleClass: "p-button-text p-button-text",
      acceptIcon: "none",
      rejectIcon: "none",
      acceptLabel: "Estoy seguro",
      rejectLabel: "Cancelar",
      reject: () => {
        // No hacemos nada
      },
      accept: () => {
        // Creamos una copia de la transacción y que esté confirmada
        const confirmedTransaction = { ...transaction };
        confirmedTransaction.status = StatusTransaction.CANCELED;
        this.transactionsService.updateTransaction(this.currentUser()!.accessToken, confirmedTransaction)
          .subscribe((resp) => {
            if (resp) {
              console.log(resp);
              // Actualizamos la lista
              this.transactions.set(this.transactions().map(transactionIndexed => {
                if (transactionIndexed.id == resp.id) {
                  return resp;
                } else {
                  return transactionIndexed;
                }
              }));
              console.log(this.transactions());
            } else {
              this.router.navigate(['fernanpop/error/'], {
                state: {
                  message: 'Parece que no se puede cancelar'
                }
              });
            }
          });
      }
    });
  }
}
