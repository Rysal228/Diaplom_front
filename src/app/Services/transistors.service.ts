import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environment/environment';
import { ITransistors } from '../models/transistors/transistors';
import { ITransistorsResponse } from '../models/transistors/transistors-response';
@Injectable({
  providedIn: 'root'
})
export class TransistorService {
  private apiUrl : string;

  constructor(private http: HttpClient) { 
    this.apiUrl = environment.apiUrl + '/'
  }
  getTransistors(body?: any): Observable<ITransistorsResponse> {
    return this.http.post<ITransistorsResponse>(this.apiUrl + 'transistors/list', body);
  }

  createTransistor(body?: ITransistors): Observable<ITransistors> {
    return this.http.post<ITransistors>(this.apiUrl + 'transistors/', body)
  }

  updateTransistor(body?: ITransistors): Observable<ITransistors> {
    return this.http.put<ITransistors>(this.apiUrl + 'transistors/' + body?.id, body)
  }

  deleteTransistor(body: ITransistors): Observable<ITransistors> {
    return this.http.delete<ITransistors>(this.apiUrl + 'transistors/' + body.id)
  }
}
