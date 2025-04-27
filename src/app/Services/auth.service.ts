import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../environment/environment";
import { Observable } from "rxjs";
import { StorageService } from "./storage.service";
import { Router } from "@angular/router";
@Injectable({
    providedIn: 'root'
})

export class AuthService {
    constructor(private http: HttpClient,
        private storageService: StorageService,
        private router: Router
    ){
        this.apiUrl = environment.apiUrl + '/'
    }
    private apiUrl : string;
    loginUser(user: any): Observable<any> {
        return this.http.post<any>(this.apiUrl + 'login/', user)
    }

    logout() {
        this.storageService.onLogout();
        window.localStorage.removeItem('altium-username');
        this.router.navigate(['/auth']);
    }

    refreshToken(): Observable<any> {
        const refresh_token = this.storageService.getRefreshToken();
        return this.http.post<any>(this.apiUrl + 'refresh', { refresh_token });
    }
}