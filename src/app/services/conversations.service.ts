import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { Conversation } from '../interfaces/conversation.interface';
import { Message } from '../interfaces/message.interface';
import { CustomResponse, ErrorResponse, SuccessResponse } from '../interfaces/response-interface';
import { getErrorMessage } from '../utils/utils';

@Injectable({
  providedIn: 'root',
})
export class ConversationsService {
  private baseUrl: string = import.meta.env.NG_APP_BASE_URL;

  constructor(private http: HttpClient) {}

  createOrGetConversation(productId: string): Observable<CustomResponse> {
    return this.http.post<Conversation>(`${this.baseUrl}/conversations/product/${productId}`, {}).pipe(
      map((conversation) => new SuccessResponse(conversation)),
      catchError((err: HttpErrorResponse) => of(new ErrorResponse(getErrorMessage(err)))),
    );
  }

  getConversations(): Observable<CustomResponse> {
    return this.http.get<Conversation[]>(`${this.baseUrl}/conversations`).pipe(
      map((conversations) => new SuccessResponse(conversations)),
      catchError((err: HttpErrorResponse) => of(new ErrorResponse(getErrorMessage(err)))),
    );
  }

  getConversation(id: string): Observable<CustomResponse> {
    return this.http.get<Conversation>(`${this.baseUrl}/conversations/${id}`).pipe(
      map((conversation) => new SuccessResponse(conversation)),
      catchError((err: HttpErrorResponse) => of(new ErrorResponse(getErrorMessage(err)))),
    );
  }

  getMessages(id: string, since?: string): Observable<CustomResponse> {
    let params = new HttpParams();

    if (since) {
      params = params.set('since', since);
    }

    return this.http.get<Message[]>(`${this.baseUrl}/conversations/${id}/messages`, { params }).pipe(
      map((messages) => new SuccessResponse(messages)),
      catchError((err: HttpErrorResponse) => of(new ErrorResponse(getErrorMessage(err)))),
    );
  }

  sendMessage(id: string, content: string): Observable<CustomResponse> {
    return this.http.post<Message>(`${this.baseUrl}/conversations/${id}/messages`, { content }).pipe(
      map((message) => new SuccessResponse(message)),
      catchError((err: HttpErrorResponse) => of(new ErrorResponse(getErrorMessage(err)))),
    );
  }
}
