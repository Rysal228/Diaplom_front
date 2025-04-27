// import { Injectable } from "@angular/core";
// import { CanActivate, Router } from "@angular/router";
// import { AuthService } from "../../Services/auth.service";
// import { StorageService } from "../../Services/storage.service";

// @Injectable({
//     providedIn: 'root'
// })
// export class AuthGuard implements CanActivate {
//     constructor(private storageService: StorageService, private router: Router) {}

//     canActivate(): boolean {
//         const isLoggedIn = this.storageService.onLogin(); 
//         if (!isLoggedIn) {
//             this.router.navigate(['/auth']); 
//             return false;
//         }
//         return true; 
//     }
// }

import { Injectable } from "@angular/core";
import { CanActivate, ActivatedRouteSnapshot, Router } from "@angular/router";
import { StorageService } from "../../Services/storage.service";

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {
    constructor(
        private storageService: StorageService,
        private router: Router
    ) {}

    canActivate(route: ActivatedRouteSnapshot): boolean {
        const isLoggedIn = this.storageService.onLogin();
        const userRole = this.storageService.getUserRole();

        if (!isLoggedIn) {
            this.router.navigate(['/auth']);
            return false;
        }

        const allowedRoles = route.data['roles'] as string[] | undefined;

        if (allowedRoles && !allowedRoles.includes(userRole)) {
            this.router.navigate(['/auth']);
            return false;
        }

        return true;
    }
}
