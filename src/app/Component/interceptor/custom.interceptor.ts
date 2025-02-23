// import { Injectable } from '@angular/core';
// import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HTTP_INTERCEPTORS, HttpErrorResponse } from '@angular/common/http';
// import { Observable, throwError } from 'rxjs';
// import { catchError } from 'rxjs/operators';

// import { StorageService } from '../../Services/storage.service';
// import { AuthService } from '../../Services/auth.service';


// @Injectable()
// export class HttpRequestInterceptor implements HttpInterceptor {
//   private isRefreshing = false;

//   constructor(private storageService: StorageService, private authService: AuthService) { }

//   intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
//     req = req.clone({
//       withCredentials: true,
//     });

//     return next.handle(req).pipe(
//       catchError((error) => {
//         if (
//           error instanceof HttpErrorResponse &&
//           !req.url.includes('auth/signin') &&
//           error.status === 401
//         ) {
//           return this.handle401Error(req, next);
//         }

//         return throwError(() => error);
//       })
//     );
//   }

//   private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
//     if (!this.isRefreshing) {
//       this.isRefreshing = true;

//       if (this.authService.logout()) {

//       }
//     }

//     return next.handle(request);
//   }
// }

// export const JwtInterceptorProviders =  [ {
//   provide: HTTP_INTERCEPTORS,
//   useClass: HttpRequestInterceptor,
//   multi: true
// }
// ]

import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HTTP_INTERCEPTORS, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { StorageService } from '../../Services/storage.service';
import { AuthService } from '../../Services/auth.service';

@Injectable()
export class HttpRequestInterceptor implements HttpInterceptor {
  private isRefreshing = false;

  constructor(private storageService: StorageService, private authService: AuthService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.storageService.getToken(); 

    if (token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(req).pipe(
      catchError((error) => {
        if (
          error instanceof HttpErrorResponse &&
          !req.url.includes('auth/') &&
          error.status === 401
        ) {
          return this.handle401Error(req, next);
        }

        return throwError(() => error);
      })
    );
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
    if (!this.isRefreshing) {
      this.isRefreshing = true;

      this.authService.logout();
    }

    return next.handle(request);
  }
}

export const JwtInterceptorProviders = [{
  provide: HTTP_INTERCEPTORS,
  useClass: HttpRequestInterceptor,
  multi: true
}];
