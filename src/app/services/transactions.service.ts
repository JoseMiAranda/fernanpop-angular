import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Transaction } from '../interfaces/transaction.interface';
import { Observable, catchError, map, of } from 'rxjs';
import * as env from '../../../environments.json';
import { CustomResponse, ErrorResponse, SuccessResponse } from '../interfaces/response-interface';
import { getErrorMessage } from '../utils/utils';

@Injectable({
  providedIn: 'root'
})
export class TransactionsService {

  private baseUrl: string = env['BASE_URL'];

  constructor(private http: HttpClient) {}

  addTransaction(accessToken: string, productId: string): Observable<Transaction | null> {
    const headers = new HttpHeaders().set('authorization', `Bearer ${accessToken}`);
    return this.http.post<Transaction>(this.baseUrl + '/seller/transaction', { productId }, {
      headers: headers
    }).pipe(
      catchError((err) => {
        console.log(err);
        return of(null);
      })
    );
  }

  getTransactions(accessToken: string): Observable<CustomResponse> {
    const headers = new HttpHeaders().set('authorization', `Bearer ${accessToken}`);
    return this.http.get<Transaction[]>(this.baseUrl + '/transactions', {
      headers: headers
    }).pipe(
      map((transactions: Transaction[]) => {
        return new SuccessResponse(transactions);
      }),
      catchError((err) => {
        return of(new ErrorResponse(getErrorMessage(err)));
      })
    );
  }

  updateTransaction(accessToken: string, updatedTransaction: Transaction): Observable<Transaction | null> {
    const { status } = updatedTransaction;
    const transactionData = { status };
    const headers = new HttpHeaders().set('authorization', `Bearer ${accessToken}`);
    return this.http.patch<Transaction>(this.baseUrl + `/seller/transaction/${updatedTransaction.id}`,transactionData, {
      headers: headers
    }).pipe(
      catchError((err) => {
        console.log(err);
        return of(null);
      })
    );
  }

}
