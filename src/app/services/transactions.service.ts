import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Transaction } from '../interfaces/transaction.interface';
import { Observable, catchError, map, of } from 'rxjs';
import { CustomResponse, ErrorResponse, SuccessResponse } from '../interfaces/response-interface';
import { getErrorMessage } from '../utils/utils';

@Injectable({
  providedIn: 'root'
})
export class TransactionsService {

  private baseUrl: string = import.meta.env.NG_APP_BASE_URL;

  constructor(private http: HttpClient) { }

  createTransaction(productId: string): Observable<CustomResponse> {
    return this.http.post<Transaction>(this.baseUrl + `/transactions/${productId}`, {}).pipe(
      map((transaction: Transaction) => {
        return new SuccessResponse(transaction);
      }),
      catchError((err) => {
        console.log(err);
        return of(new ErrorResponse(getErrorMessage(err)));
      })
    );
  }

  getTransactions(): Observable<CustomResponse> {
    return this.http.get<Transaction[]>(this.baseUrl + '/transactions').pipe(
      map((transactions: Transaction[]) => {
        return new SuccessResponse(transactions);
      }),
      catchError((err) => {
        return of(new ErrorResponse(getErrorMessage(err)));
      })
    );
  }

  cancelTransaction(transactionId: string): Observable<CustomResponse> {
    return this.http.patch<Transaction>(this.baseUrl + `/transactions/${transactionId}/cancel`, {}).pipe(
      map((transaction: Transaction) => {
        return new SuccessResponse(transaction);
      }),
      catchError((err) => {
        console.log(err);
        return of(new ErrorResponse(getErrorMessage(err)));
      })
    );
  }

  acceptTransaction(transactionId: string): Observable<CustomResponse> {
    return this.http.patch<Transaction>(this.baseUrl + `/transactions/${transactionId}/accept`, {}).pipe(
      map((transaction: Transaction) => {
        return new SuccessResponse(transaction);
      }),
      catchError((err) => {
        console.log(err);
        return of(new ErrorResponse(getErrorMessage(err)));
      })
    );
  }

}
