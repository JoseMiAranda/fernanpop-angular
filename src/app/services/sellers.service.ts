import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { Seller } from '../interfaces/seller.interface';
import { SoldItem } from '../interfaces/sold-item.interface';
import { PurchasedItem } from '../interfaces/purchased-item.interface';
import { Product } from '../interfaces/product.interface';
import { CustomResponse, ErrorResponse, SuccessResponse } from '../interfaces/response-interface';
import { getErrorMessage } from '../utils/utils';

@Injectable({
  providedIn: 'root'
})
export class SellersService {
  private baseUrl: string = import.meta.env.NG_APP_BASE_URL;

  constructor(private http: HttpClient) { }

  getSeller(id: string): Observable<CustomResponse> {
    return this.http.get<Seller>(`${this.baseUrl}/sellers/${id}`).pipe(
      map((response: Seller) => new SuccessResponse(response)),
      catchError((err) => of(new ErrorResponse(getErrorMessage(err)))),
    );
  }

  getSellerProducts(id: string): Observable<CustomResponse> {
    return this.http.get<Product[]>(`${this.baseUrl}/sellers/${id}/products`).pipe(
      map((response: Product[]) => new SuccessResponse(response)),
      catchError((err) => of(new ErrorResponse(getErrorMessage(err)))),
    );
  }

  getSellerSold(id: string): Observable<CustomResponse> {
    return this.http.get<SoldItem[]>(`${this.baseUrl}/sellers/${id}/sold`).pipe(
      map((response: SoldItem[]) => new SuccessResponse(response)),
      catchError((err) => of(new ErrorResponse(getErrorMessage(err)))),
    );
  }

  getSellerPurchased(id: string): Observable<CustomResponse> {
    return this.http.get<PurchasedItem[]>(`${this.baseUrl}/sellers/${id}/purchased`).pipe(
      map((response: PurchasedItem[]) => new SuccessResponse(response)),
      catchError((err) => of(new ErrorResponse(getErrorMessage(err)))),
    );
  }
}
