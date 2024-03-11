import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TransactionsService {

  private baseUrl: string = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  // addProduct(accessToken: string, newTransaction: Transaction): Observable<Transaction | null> {
  //   const { title, desc, price, img } = newProduct;
  //   const productData = { title, desc, price, img };
  //   const headers = new HttpHeaders().set('authorization', `Bearer ${accessToken}`);
  //   return this.http.post<Product>(this.baseUrl + '/seller/product', productData, {
  //     headers: headers
  //   }).pipe(
  //     catchError((err) => {
  //       console.log(err);
  //       return of(null);
  //     })
  //   );
  // }

}
