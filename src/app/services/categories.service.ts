import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { Category } from '../interfaces/category.interface';
import { CustomResponse, ErrorResponse, SuccessResponse } from '../interfaces/response-interface';
import { getErrorMessage } from '../utils/utils';

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {

  private baseUrl: string = import.meta.env.NG_APP_BASE_URL;

  constructor(private http: HttpClient) { }

  getCategories(): Observable<CustomResponse> {
    return this.http.get<Category[]>(this.baseUrl + '/categories').pipe(
      map((response: Category[]) => new SuccessResponse(response)),
      catchError((error: HttpErrorResponse) => of(new ErrorResponse(getErrorMessage(error))))
    );
  }
}
