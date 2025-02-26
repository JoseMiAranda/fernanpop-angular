import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { Product, } from '../interfaces/product.interface';
import * as env from '../../../environments.json';
import { CustomResponse, ErrorResponse, SuccessResponse } from '../interfaces/response-interface';
import { getErrorMessage } from '../utils/utils';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class ImagesService {
    private currentUser = this.authService.currentUser; 
    private baseUrl: string = env['BASE_URL'];

    constructor(private http: HttpClient, private authService: AuthService) { }

    // CREATE
    upload(file: File): Observable<CustomResponse> {
        const headers = new HttpHeaders().set('authorization', `Bearer ${this.currentUser()?.accessToken}`);
        const formData = new FormData();
        formData.append('file', file);
        return this.http.post<{ 'secure_url': string }>(this.baseUrl + '/images/upload',
            formData,
            {
                headers: headers,
            }
        )
        .pipe(
            map((response) => {
                const secureUrl = response['secure_url']; 
                return new SuccessResponse(secureUrl);
            }),
            catchError((err) => {
                return of(new ErrorResponse(getErrorMessage(err)));
            })
        );
    }

}
