import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CapacitorsService {
  private apiUrl = 'http://127.0.0.1:8000/capacitors/';

  constructor(private http: HttpClient) { }

  // getCapacitors(): Observable<any> {
  //   return this.http.get<any>(this.apiUrl);
  // }
}
