import { HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { Product, } from '../interfaces/product.interface';
import * as env from '../../../environments.json';
import { ProductsResponse } from '../interfaces/products-response';
import { CustomResponse, ErrorResponse, SuccessResponse } from '../interfaces/response-interface';
import { getErrorMessage } from '../utils/utils';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  private currentUser = this.authService.currentUser; 
  private baseUrl: string = env['BASE_URL'];

  constructor(private http: HttpClient, private authService: AuthService) { }

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

  getUserProducts(): Observable<CustomResponse> {
    const headers = new HttpHeaders().set('authorization', `Bearer ${this.currentUser()?.accessToken}`);
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
  createProduct(newProduct: Product): Observable<CustomResponse> {
    const { title, desc, price, images } = newProduct;
    const productData = { title, desc, price, images };
    const headers = new HttpHeaders().set('authorization', `Bearer ${this.currentUser()?.accessToken}`);
    return this.http.post<Product>(this.baseUrl + '/products', productData, {
      headers: headers
    }).pipe(
      map((response: Product) => {
        return new SuccessResponse(response);
      }),
      catchError((err) => {
        return of(new ErrorResponse(getErrorMessage(err)));
      })
    );
  }

  // UPDATE
  updateProduct(updatedProduct: Product): Observable<CustomResponse> {
    const { title, desc, price, images, status } = updatedProduct;
    const productData = { title, desc, price, images, status };
    const headers = new HttpHeaders().set('authorization', `Bearer ${this.currentUser()?.accessToken}`);
    return this.http.patch<Product>(this.baseUrl + `/products/${updatedProduct.id}`, productData, {
      headers: headers
    }).pipe(
      map((response: Product) => {
        return new SuccessResponse(response);
      }),
      catchError((err) => {
        return of(new ErrorResponse(getErrorMessage(err)));
      })
    );
  }

  // DELETE
  deleteProduct(id: string): Observable<CustomResponse> {
    const headers = new HttpHeaders().set('authorization', `Bearer ${this.currentUser()?.accessToken}`);
    return this.http.delete<Product>(this.baseUrl + `/products/${id}`, { headers: headers }).pipe(
      map((response: Product) => {
        return new SuccessResponse(response);
      }),
      catchError((err) => {
        return of(new ErrorResponse(getErrorMessage(err)));
      })
    );
  }

}
