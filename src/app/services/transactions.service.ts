import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Transaction } from '../interfaces/transaction.interface';
import { Observable, catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TransactionsService {

  private baseUrl: string = 'http://localhost:3000';

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
    return this.http.post<Transaction[]>(this.baseUrl + '/seller/transactions', {
      headers: headers
    }).pipe(
      catchError((err) => {
        console.log(err);
        return of(null);
      })
    );
  }

}
