import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { Product } from '../interfaces/product.interface';
import { Favorite } from '../interfaces/favorite.interface';
import { CustomResponse, ErrorResponse, SuccessResponse } from '../interfaces/response-interface';
import { getErrorMessage } from '../utils/utils';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private currentUser = this.authService.currentUser;
  private baseUrl: string = import.meta.env.NG_APP_BASE_URL;

  favoriteIds = signal<Set<string>>(new Set());

  constructor(private http: HttpClient, private authService: AuthService) {}

  loadFavoriteIds(): void {
    if (!this.currentUser()) {
      return;
    }

    this.getFavoriteIds().subscribe({
      next: (response: CustomResponse) => {
        if (response instanceof SuccessResponse) {
          this.favoriteIds.set(new Set(response.data));
        }
      },
    });
  }

  clearFavorites(): void {
    this.favoriteIds.set(new Set());
  }

  isFavorite(productId: string): boolean {
    return this.favoriteIds().has(productId);
  }

  toggleFavorite(productId: string): Observable<CustomResponse> {
    if (this.isFavorite(productId)) {
      return this.removeFavorite(productId);
    }

    return this.addFavorite(productId);
  }

  getFavorites(): Observable<CustomResponse> {
    const headers = new HttpHeaders().set('authorization', `Bearer ${this.currentUser()?.accessToken}`);
    return this.http.get<Product[]>(this.baseUrl + '/favorites', { headers }).pipe(
      map((products: Product[]) => new SuccessResponse(products)),
      catchError((err) => of(new ErrorResponse(getErrorMessage(err)))),
    );
  }

  getFavoriteIds(): Observable<CustomResponse> {
    const headers = new HttpHeaders().set('authorization', `Bearer ${this.currentUser()?.accessToken}`);
    return this.http.get<string[]>(this.baseUrl + '/favorites/ids', { headers }).pipe(
      map((ids: string[]) => new SuccessResponse(ids)),
      catchError((err) => of(new ErrorResponse(getErrorMessage(err)))),
    );
  }

  addFavorite(productId: string): Observable<CustomResponse> {
    const previousIds = new Set(this.favoriteIds());
    this.favoriteIds.update((ids) => new Set(ids).add(productId));

    const headers = new HttpHeaders().set('authorization', `Bearer ${this.currentUser()?.accessToken}`);
    return this.http.post<Favorite>(this.baseUrl + `/favorites/${productId}`, {}, { headers }).pipe(
      map((favorite: Favorite) => new SuccessResponse(favorite)),
      catchError((err) => {
        this.favoriteIds.set(previousIds);
        return of(new ErrorResponse(getErrorMessage(err)));
      }),
    );
  }

  removeFavorite(productId: string): Observable<CustomResponse> {
    const previousIds = new Set(this.favoriteIds());
    this.favoriteIds.update((ids) => {
      const next = new Set(ids);
      next.delete(productId);
      return next;
    });

    const headers = new HttpHeaders().set('authorization', `Bearer ${this.currentUser()?.accessToken}`);
    return this.http.delete<void>(this.baseUrl + `/favorites/${productId}`, { headers }).pipe(
      map(() => new SuccessResponse(null)),
      catchError((err) => {
        this.favoriteIds.set(previousIds);
        return of(new ErrorResponse(getErrorMessage(err)));
      }),
    );
  }
}
