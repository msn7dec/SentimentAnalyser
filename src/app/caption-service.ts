import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
    providedIn: 'root'
})
export class CaptionService {
    private apiUrl = 'http://127.0.0.1:5000'; // Replace with your API URL

    constructor(private http: HttpClient) { }

    getCaption(file: any): Observable<{ generated_text: string }> {

        return this.http.post<{ generated_text: string }>(this.apiUrl + '/captions', file)

    }

}