import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environment/environment';
import { StorageService } from './storage.service';
@Injectable({
  providedIn: 'root'
})
export class ExportAndImportService {
  private apiUrl : string;
  constructor(private http: HttpClient,
  ) { 
    this.apiUrl = environment.apiUrl + '/';
  }

  exportBD(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}API/v1/export/`, { responseType: 'blob' })
  }
  importBD(file: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}API/v1/upload/`, file);
  }
}
