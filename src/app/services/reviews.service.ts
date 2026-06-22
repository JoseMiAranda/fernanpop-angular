import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { CreateReviewPayload, Review, SellerReviewsSummary } from '../interfaces/review.interface';
import { CustomResponse, ErrorResponse, SuccessResponse } from '../interfaces/response-interface';
import { getErrorMessage } from '../utils/utils';

@Injectable({
  providedIn: 'root'
})
export class ReviewsService {
  private baseUrl: string = import.meta.env.NG_APP_BASE_URL;

  constructor(private http: HttpClient) { }

  createReview(transactionId: string, payload: CreateReviewPayload): Observable<CustomResponse> {
    return this.http.post<Review>(`${this.baseUrl}/transactions/${transactionId}/review`, payload).pipe(
      map((review: Review) => new SuccessResponse(review)),
      catchError((err) => of(new ErrorResponse(getErrorMessage(err)))),
    );
  }

  getSellerReviews(sellerId: string): Observable<CustomResponse> {
    return this.http.get<SellerReviewsSummary>(`${this.baseUrl}/sellers/${sellerId}/reviews`).pipe(
      map((summary: SellerReviewsSummary) => new SuccessResponse(summary)),
      catchError((err) => of(new ErrorResponse(getErrorMessage(err)))),
    );
  }
}
