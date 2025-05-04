import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../environment/environment";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})

export class UserService {
    constructor(
        private http: HttpClient
    ){
        this.apiUrl = environment.apiUrl + '/'
    }

    private apiUrl: string;

    getUserById(id: number){
        return this.http.get(this.apiUrl + `users/${id}`)
    }

    getUsers(body?: any){
        return this.http.post<any>(this.apiUrl + 'users', body)
    }

    updateUserById(body?: any): Observable<any>{
        return this.http.put<any>(this.apiUrl + `users/${body?.id}`, body)
        
    }
}