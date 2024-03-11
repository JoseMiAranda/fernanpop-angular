import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TransactionsService {

  private baseUrl: string = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

}
