import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { Product, ProductsResponse } from '../interfaces/product.interface';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  private baseUrl: string = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getProducts({page = 1, q = '', minPrice = 0, maxPrice = Number.MAX_SAFE_INTEGER}): Observable<ProductsResponse | null> {
    return this.http.get<ProductsResponse | null>(this.baseUrl + `/products/filter?page=${page}&q=${q}`).pipe(
      catchError(error => {
        console.error(error);
        return of(null);
      })
      );
  }

  getUserProducts(accessToken: string): Observable<ProductsResponse | null> {
    const headers = new HttpHeaders().set('authorization', `Bearer ${accessToken}`);
    return this.http.get<ProductsResponse | null>(this.baseUrl + `/seller/products`, { headers: headers }).pipe(
      catchError(error => {
        console.error(error);
        return of(null);
      })
      );
  }

  getProductById(id: string): Observable<Product | null> {
    return this.http.get<Product | null>(this.baseUrl + '/products/' + id)
    .pipe(
      catchError((err) => {
      console.log(err);
      return of(null);
    }));
  }
  
  addProduct(accessToken: string, title: string, desc: string, price: number, img: string): Observable<Product | null> {
    const productData = { title, desc, price, img };
    const headers = new HttpHeaders().set('authorization', `Bearer ${accessToken}`);
    return this.http.post<Product>(this.baseUrl + '/seller/product', productData, {
      headers: headers
    }).pipe(
      catchError((err) => {
        console.log(err);
        return of(null);
      })
    );
  }

}
