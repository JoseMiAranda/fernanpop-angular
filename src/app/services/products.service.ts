import { HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { Product, } from '../interfaces/product.interface';
import * as env from '../../../environments.json';
import { ProductsResponse } from '../interfaces/products-response';
import { CustomResponse, ErrorResponse, SuccessResponse } from '../interfaces/response-interface';
import { getErrorMessage } from '../utils/utils';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  private baseUrl: string = env['BASE_URL'];

  constructor(private http: HttpClient) { }

  // SELECT
  getProducts({ page = 1, q = '', minPrice = 0, maxPrice = Number.MAX_SAFE_INTEGER }): Observable<CustomResponse> {
    return this.http.get<ProductsResponse>(this.baseUrl + `/products?page=${page}&q=${q}`).pipe(
      map((response: ProductsResponse) => {
        return new SuccessResponse(response);
      }),
      catchError((error: HttpErrorResponse) => {
        return of(new ErrorResponse(getErrorMessage(error)));
      })
    );
  }

  getUserProducts(accessToken: string): Observable<CustomResponse> {
    const headers = new HttpHeaders().set('authorization', `Bearer ${accessToken}`);
    return this.http.get<Product[]>(this.baseUrl + '/products/seller', {
      headers: headers
    }).pipe(
      map((transactions: Product[]) => {
        return new SuccessResponse(transactions);
      }),
      catchError((err) => {
        return of(new ErrorResponse(getErrorMessage(err)));
      })
    );
  }

  getProductById(id: string): Observable<CustomResponse> {
    return this.http.get<Product>(this.baseUrl + '/products/' + id)
      .pipe(
        map((response: Product) => {
          return new SuccessResponse(response);
        }),
        catchError((err) => {
          return of(new ErrorResponse(getErrorMessage(err)));
        }));
  }

  // CREATE
  addProduct(accessToken: string, newProduct: Product): Observable<Product | null> {
    const { title, desc, price, img } = newProduct;
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

  // UPDATE
  updateProduct(accessToken: string, updatedProduct: Product): Observable<Product | null> {
    const { title, desc, price, img } = updatedProduct;
    const productData = { title, desc, price, img };
    const headers = new HttpHeaders().set('authorization', `Bearer ${accessToken}`);
    return this.http.patch<Product>(this.baseUrl + `/seller/product/${updatedProduct.id}`, productData, {
      headers: headers
    }).pipe(
      catchError((err) => {
        console.log(err);
        return of(null);
      })
    );
  }

  // DELETE
  deleteProduct(accessToken: string, id: string) {
    const headers = new HttpHeaders().set('authorization', `Bearer ${accessToken}`);
    return this.http.delete<Product>(this.baseUrl + `/seller/product/${id}`, { headers: headers }).pipe(
      catchError((err) => {
        console.log(err);
        return of(null);
      })
    );
  }

}
