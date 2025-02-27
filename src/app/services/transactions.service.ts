import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Transaction } from '../interfaces/transaction.interface';
import { Observable, catchError, map, of } from 'rxjs';
import * as env from '../../../environments.json';
import { CustomResponse, ErrorResponse, SuccessResponse } from '../interfaces/response-interface';
import { getErrorMessage } from '../utils/utils';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class TransactionsService {

  private currentUser = this.authService.currentUser; 
  private baseUrl: string = env['BASE_URL'];

  constructor(private http: HttpClient, private authService: AuthService) { }

  createTransaction(productId: string): Observable<CustomResponse> {
    const headers = new HttpHeaders().set('authorization', `Bearer ${this.currentUser()?.accessToken}`);
    return this.http.post<Transaction>(this.baseUrl + `/transactions/${productId}`, {}, {
      headers: headers
    }).pipe(
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
    const headers = new HttpHeaders().set('authorization', `Bearer ${this.currentUser()?.accessToken}`);
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

  cancelTransaction(transactionId: string): Observable<CustomResponse> {
    const headers = new HttpHeaders().set('authorization', `Bearer ${this.currentUser()?.accessToken}`);
    return this.http.patch<Transaction>(this.baseUrl + `/transactions/${transactionId}/cancel`, {}, {
      headers: headers
    }).pipe(
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
    const headers = new HttpHeaders().set('authorization', `Bearer ${this.currentUser()?.accessToken}`);
    return this.http.patch<Transaction>(this.baseUrl + `/transactions/${transactionId}/accept`, {}, {
      headers: headers
    }).pipe(
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
