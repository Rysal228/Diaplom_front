import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environment/environment';
import { IArchiveResponseList } from '../models/archive-response';

@Injectable({ providedIn: 'root' })
export class ArchiveService {
    constructor(private http: HttpClient){
        this.apiUrl = environment.apiUrl + '/'
    }
    
    private apiUrl: string;
    UserArchivesList(body?: any): Observable<IArchiveResponseList> {
        return this.http.post<IArchiveResponseList>(`${this.apiUrl}archives`,body);
    }
    
    downloadArchive(id: number): Observable<Blob> {
        return this.http.get(`${this.apiUrl}archives/${id}/download`, {responseType: 'blob'});
    }

    deleteArchive(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}archives/${id}/`)
    }
}
