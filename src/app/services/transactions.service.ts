import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Transaction } from '../interfaces/transaction.interface';
import { Observable, catchError, of } from 'rxjs';
import * as env from '../../../environments.json';

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

  getTransactions(accessToken: string): Observable<Transaction[] | null> {
    const headers = new HttpHeaders().set('authorization', `Bearer ${accessToken}`);
    return this.http.get<Transaction[]>(this.baseUrl + '/seller/transactions', {
      headers: headers
    }).pipe(
      catchError((err) => {
        console.log(err);
        return of(null);
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
