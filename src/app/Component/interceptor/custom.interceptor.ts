import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HTTP_INTERCEPTORS,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

import { StorageService } from '../../Services/storage.service';
import { AuthService } from '../../Services/auth.service';

@Injectable()
export class HttpRequestInterceptor implements HttpInterceptor {
  private isRefreshing = false;

  constructor(
    private storageService: StorageService,
    private authService: AuthService
  ) {}

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
        // Если ошибка авторизации (например, 401 или 403)
        if (
          error instanceof HttpErrorResponse &&
          !req.url.includes('auth/') &&
          (error.status === 401 || error.status === 403)
        ) {
          if (error.error && typeof error.error === 'object' && error.error.detail) {
            const errorDetail = error.error.detail.toLowerCase();
            if (errorDetail.includes('expired') || errorDetail.includes('просрочен')) {
              // Если токен просрочен – выходим из аккаунта
              return this.handle401Error(req, next);
            }
          } else {
            return this.handle401Error(req, next);
          }
        }
        return throwError(() => error);
      })
    );
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
  
      return this.authService.refreshToken().pipe(
        switchMap((res: any) => {
          this.isRefreshing = false;
          this.storageService.updateAccessToken(res.access_token);
          const clonedRequest = request.clone({
            setHeaders: {
              Authorization: `Bearer ${res.access_token}`
            }
          });
          return next.handle(clonedRequest);
        }),
        catchError((err) => {
          this.isRefreshing = false;
          this.authService.logout();
          return throwError(() => err);
        })
      );
    } else {
      return throwError(() => new Error('Token refresh already in progress.'));
    }
  }
  
}

export const JwtInterceptorProviders = [{
  provide: HTTP_INTERCEPTORS,
  useClass: HttpRequestInterceptor,
  multi: true
}];
