import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { Product, } from '../interfaces/product.interface';
import { ProductsResponse } from '../interfaces/products-response';
import { CustomResponse, ErrorResponse, SuccessResponse } from '../interfaces/response-interface';
import { getErrorMessage } from '../utils/utils';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  private baseUrl: string = import.meta.env.NG_APP_BASE_URL;

  constructor(private http: HttpClient) { }

  // SELECT
  getProducts({
    page = 1,
    q = '',
    price_min,
    price_max,
    categoryId,
    sort = 'newest',
    reserved = 'all',
  }: {
    page?: number;
    q?: string;
    price_min?: number;
    price_max?: number;
    categoryId?: string;
    sort?: 'newest' | 'oldest';
    reserved?: 'all' | 'yes' | 'no';
  } = {}): Observable<CustomResponse> {
    let params = new HttpParams()
      .set('page', page)
      .set('q', q)
      .set('sort', sort)
      .set('reserved', reserved);

    if (price_min != null && price_min > 0) {
      params = params.set('price_min', price_min);
    }
    if (price_max != null) {
      params = params.set('price_max', price_max);
    }
    if (categoryId) {
      params = params.set('categoryId', categoryId);
    }

    return this.http.get<ProductsResponse>(this.baseUrl + '/products', { params }).pipe(
      map((response: ProductsResponse) => {
        return new SuccessResponse(response);
      }),
      catchError((error: HttpErrorResponse) => {
        return of(new ErrorResponse(getErrorMessage(error)));
      })
    );
  }

  getUserProducts(): Observable<CustomResponse> {
    return this.http.get<Product[]>(this.baseUrl + '/products/seller').pipe(
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
    const { title, desc, price, images, categoryId, condition } = newProduct;
    const productData = { title, desc, price, images, categoryId, condition };
    return this.http.post<Product>(this.baseUrl + '/products', productData).pipe(
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
    const { title, desc, price, images, status, categoryId, condition } = updatedProduct;
    const productData = { title, desc, price, images, status, categoryId, condition };
    return this.http.patch<Product>(this.baseUrl + `/products/${updatedProduct.id}`, productData).pipe(
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
    return this.http.delete<Product>(this.baseUrl + `/products/${id}`).pipe(
      map((response: Product) => {
        return new SuccessResponse(response);
      }),
      catchError((err) => {
        return of(new ErrorResponse(getErrorMessage(err)));
      })
    );
  }

}
