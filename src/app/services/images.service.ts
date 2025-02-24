import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { Product, } from '../interfaces/product.interface';
import * as env from '../../../environments.json';
import { CustomResponse, ErrorResponse, SuccessResponse } from '../interfaces/response-interface';
import { getErrorMessage } from '../utils/utils';

@Injectable({
    providedIn: 'root'
})
export class ImagesService {

    private baseUrl: string = env['BASE_URL'];

    constructor(private http: HttpClient) { }

    // CREATE
    upload(accessToken: string, file: File): Observable<CustomResponse> {
        const headers = new HttpHeaders().set('authorization', `Bearer ${accessToken}`);
        return this.http.post<Product>(this.baseUrl + '/images/upload',
            {
                file: file
            },
            {
                headers: headers,
            }
        )
        // TODO
    }

}
