import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface Comment {
  id: number;
  text: string;
  author: string;
  avatar: string;
}

interface EvaluationResponse {
  sentiment: 'positive' | 'negative';
}

@Injectable({
  providedIn: 'root'
})
export class CommentEvaluationService {
  private apiUrl = 'http://127.0.0.1:5000/evaluate'; // Replace with your API endpoint

  constructor(private http: HttpClient) { }

  evaluateComment(comment: Comment): Observable<boolean> {
    return this.http.post<EvaluationResponse>(this.apiUrl, { 
      comment: comment.text,
      commentId: comment.id
    })
      .pipe(
        map(response => response.sentiment === 'positive')
      );
  }
}