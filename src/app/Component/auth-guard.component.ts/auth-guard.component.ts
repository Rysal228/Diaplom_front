import { Injectable } from "@angular/core";
import { CanActivate, Router } from "@angular/router";
import { AuthService } from "../../Services/auth.service";
import { StorageService } from "../../Services/storage.service";

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {
    constructor(private storageService: StorageService, private router: Router) {}

    canActivate(): boolean {
        const isLoggedIn = this.storageService.onLogin(); 
        if (!isLoggedIn) {
            this.router.navigate(['/auth']); 
            return false;
        }
        return true; 
    }
}
