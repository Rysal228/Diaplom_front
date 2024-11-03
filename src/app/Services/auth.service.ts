import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../environment/environment";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})

export class AuthService {
    constructor(private http: HttpClient){
        this.apiUrl = environment.apiUrl + '/'
    }
    private apiUrl : string;
    loginUser(user: any): Observable<any> {
        return this.http.post<any>(this.apiUrl + '/login', user)
    }
}