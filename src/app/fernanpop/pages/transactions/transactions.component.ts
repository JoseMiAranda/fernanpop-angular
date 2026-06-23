import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { StatusTransaction, Transaction } from '../../../interfaces/transaction.interface';
import { Subscription } from 'rxjs';
import { ProductsService } from '../../../services/products.service';
import { AuthService } from '../../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { TransactionsService } from '../../../services/transactions.service';
import { ReviewsService } from '../../../services/reviews.service';
import { CommonModule, DatePipe } from '@angular/common';
import { CurrentCurrencyPipe } from '../../../pipes/current-currency.pipe';
import { StatusPipe } from '../../../pipes/status.pipe';
import { ConfirmDialogComponent } from '../../../shared/ui/confirm-dialog/confirm-dialog.component';
import { RatingDialogComponent } from '../../../shared/ui/rating-dialog/rating-dialog.component';
import {
  ButtonComponent,
  CardComponent,
  EmptyStateComponent,
  PageContainerComponent,
  PageTitleComponent,
} from '../../../shared/ui';
import { ErrorState, LoadingState, State, SuccessState } from '../../../states/state.interface';
import { CustomResponse, ErrorResponse, SuccessResponse } from '../../../interfaces/response-interface';
import { CreateReviewPayload } from '../../../interfaces/review.interface';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [
    CommonModule,
    CurrentCurrencyPipe,
    ConfirmDialogComponent,
    RatingDialogComponent,
    RouterLink,
    StatusPipe,
    DatePipe,
    PageContainerComponent,
    PageTitleComponent,
    EmptyStateComponent,
    CardComponent,
    ButtonComponent,
  ],
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.css',
})
export class TransactionsComponent implements OnInit, OnDestroy {
  public transactionsState = signal<State>(new LoadingState());
  public currentUser = this.authService.currentUser;
  public confirmVisible = signal(false);
  public confirmHeader = signal('');
  public confirmMessage = signal('');
  public confirmAcceptLabel = signal('Estoy seguro');
  public confirmRejectLabel = signal('Cancelar');
  public confirmAcceptVariant = signal<'teal' | 'success' | 'danger'>('teal');
  public ratingVisible = signal(false);
  public ratingProductTitle = signal('');
  private ratingTransactionId: string | null = null;
  private getTransactionsSubscription: Subscription = new Subscription();
  private pendingConfirmAction: (() => void) | null = null;

  queryParams: any = {};

  constructor(private transactionsService: TransactionsService, private productsService: ProductsService,
    private authService: AuthService, private reviewsService: ReviewsService, private router: Router) {}

  ngOnInit(): void {
    // Agregamos todas las subscripciones
    this.getTransactionsSubscription =  this.transactionsService.getTransactions().subscribe({
      next: (response: CustomResponse) => {
        if (response instanceof SuccessResponse) {
          this.transactionsState.set(new SuccessState(response.data));
        } else if (response instanceof ErrorResponse) {
          this.transactionsState.set(new ErrorState(response.error));
        }
      },
    });
  }

  ngOnDestroy(): void {
    this.getTransactionsSubscription.unsubscribe();
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

  onAccept(_event?: Event, transactionId?: string): void {
    if (!transactionId) return;
    this.openConfirmDialog({
      header: '¿Estás seguro de confirmar?',
      message: 'Asegúrate de que el producto esté en buenas condiciones antes de aceptar',
      acceptVariant: 'teal',
      onAccept: () => {
        this.transactionsService.acceptTransaction(transactionId)
          .subscribe((resp) => {
            if (resp instanceof SuccessResponse) {
              const acceptedTransaction = resp.data as Transaction;
              const transactions = this.transactionsState().data.map((transaction: Transaction) => {
                if (transaction.id === acceptedTransaction.id) {
                  return acceptedTransaction;
                }
                return transaction;
              });
              this.transactionsState.set(new SuccessState(transactions));
              this.openRatingDialog(acceptedTransaction);
            } else {
              this.router.navigate(['fernanpop/error/'], {
                state: {
                  message: 'Parece que no se pudo aceptar la transacción'
                }
              });
            }
          });
      }
    });
  }

  onCancel(_event?: Event, transactionId?: string): void {
    if (!transactionId) return;
    this.openConfirmDialog({
      header: '¿Estás seguro de cancelar?',
      message: 'El comprador no podrá recibir el producto',
      acceptVariant: 'danger',
      onAccept: () => {
        this.transactionsService.cancelTransaction(transactionId)
          .subscribe((resp) => {
            if (resp instanceof SuccessResponse) {
              const cancelledTransaction = resp.data as Transaction;
              const transactions = this.transactionsState().data.map((transaction: Transaction) => {
                if (transaction.id === cancelledTransaction.id) {
                  return cancelledTransaction;
                }
                return transaction;
              });
              this.transactionsState.set(new SuccessState(transactions));
            } else {
              this.router.navigate(['fernanpop/error/'], {
                state: {
                  message: 'Parece que no se pudo cancelar la transacción'
                }
              });
            }
          });
      }
    });
  }

  onConfirmAccept(): void {
    this.confirmVisible.set(false);
    this.pendingConfirmAction?.();
    this.pendingConfirmAction = null;
  }

  onConfirmReject(): void {
    this.confirmVisible.set(false);
    this.pendingConfirmAction = null;
  }

  onRate(_event?: Event, transaction?: Transaction): void {
    if (!transaction) return;
    this.openRatingDialog(transaction);
  }

  onRatingSubmit(payload: CreateReviewPayload): void {
    if (!this.ratingTransactionId) {
      return;
    }

    const transactionId = this.ratingTransactionId;
    this.ratingVisible.set(false);
    this.ratingTransactionId = null;

    this.reviewsService.createReview(transactionId, payload).subscribe((resp) => {
      if (resp instanceof SuccessResponse) {
        const review = resp.data;
        const transactions = this.transactionsState().data.map((transaction: Transaction) => {
          if (transaction.id === transactionId) {
            return {
              ...transaction,
              review: {
                score: review.score,
                description: review.description,
                createdAt: review.createdAt,
              },
            };
          }
          return transaction;
        });
        this.transactionsState.set(new SuccessState(transactions));
      } else {
        this.router.navigate(['fernanpop/error/'], {
          state: {
            message: 'Parece que no se pudo enviar la valoración'
          }
        });
      }
    });
  }

  onRatingSkip(): void {
    this.ratingVisible.set(false);
    this.ratingTransactionId = null;
  }

  isBuyer(transaction: Transaction): boolean {
    return transaction.buyerId === this.currentUser()?.uid;
  }

  private openRatingDialog(transaction: Transaction): void {
    this.ratingTransactionId = transaction.id;
    this.ratingProductTitle.set(transaction.title);
    this.ratingVisible.set(true);
  }

  private openConfirmDialog(options: {
    header: string;
    message: string;
    acceptLabel?: string;
    rejectLabel?: string;
    acceptVariant?: 'teal' | 'success' | 'danger';
    onAccept: () => void;
  }): void {
    this.confirmHeader.set(options.header);
    this.confirmMessage.set(options.message);
    this.confirmAcceptLabel.set(options.acceptLabel ?? 'Estoy seguro');
    this.confirmRejectLabel.set(options.rejectLabel ?? 'Cancelar');
    this.confirmAcceptVariant.set(options.acceptVariant ?? 'teal');
    this.pendingConfirmAction = options.onAccept;
    this.confirmVisible.set(true);
  }
}
