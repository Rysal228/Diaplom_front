import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../environment/environment";
import { BehaviorSubject, Observable } from "rxjs";

const user_key = "altium-token"

@Injectable({
    providedIn: 'root'
})

export class StorageService {
    constructor(){

    }
    
    getToken(){
       const user = window.localStorage.getItem(user_key);
       if (user) {
        return JSON.parse(user).access_token;
       }
    }
    getUserRole(){
        const user = window.localStorage.getItem(user_key);
        if (user) {
         return JSON.parse(user).role;
        }
    }

    saveToken(body: any): void{
        window.localStorage.setItem(user_key, JSON.stringify(body));
    }

    removeToken(){
        window.localStorage.removeItem(user_key);
    }

    onLogin(): boolean{
        const user = window.localStorage.getItem(user_key);
        return !!user
    }

    onLogout() {
        window.localStorage.removeItem(user_key);
    }
    
    getRefreshToken() {
        const user = window.localStorage.getItem(user_key);
        if (user){
        return JSON.parse(user).refresh_token;
        }
    }
    
    updateAccessToken(newAccessToken: string): void {
        const user = window.localStorage.getItem(user_key);
        if (user) {
          const parsed = JSON.parse(user);
          parsed.access_token = newAccessToken;
          window.localStorage.setItem(user_key, JSON.stringify(parsed));
        }
    }
}