import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface Video {
    id: number;
    title: string;
    description: string;
    thumbnail: string;
    comments: Comment[];
    likes?: number;
}

interface Comment {
    id: number;
    text: string;
    author: string;
    avatar: string;
    sentiment?: string;
    isLoading?: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class DashboardService {
    private apiUrl = 'http://127.0.0.1:5000'; // Replace with your API URL

    constructor(private http: HttpClient) { }

    getVideos(): Observable<Video[]> {
        return this.http.get<Video[]>(this.apiUrl + '/videos');
    }

    addComment(comment: Comment, video_id: number): Observable<boolean> {
        console.log('Adding comment isnide AddComment')
        console.log('URL is ' + this.apiUrl + '/videos/' + video_id +'/comments')

        console.log('Commens is ' + JSON.stringify(comment))
        return this.http.post<boolean>(this.apiUrl + '/videos/' + video_id +'/comments', comment)

    }

    addLikes(video_id: number): Observable<boolean> {
        return this.http.put<boolean>(this.apiUrl + '/videos/' + video_id +'/likes', video_id)
    }
}