import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, ReplaySubject } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshingToken = false;
  private tokenSubject = new ReplaySubject<string | null>(1);

  constructor(private authService: AuthService , private router : Router) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Add token to all requests except auth endpoints
    let modifiedRequest = request;

    // First, ensure all requests include credentials
    modifiedRequest = request.clone({
      withCredentials: true
    });

    // Then add token for authorized endpoints
    if (!this.isAuthEndpoint(request.url)) {
      const token = this.authService.getAccessToken();
      if (token) {
        modifiedRequest = modifiedRequest.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
      }
    }

    return next.handle(modifiedRequest).pipe(
      catchError(error => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          return this.handle401Error(modifiedRequest, next);
        }
        return throwError(() => error);
      })
    );
  }

  private isAuthEndpoint(url: string): boolean {
    return url.includes('/signin') || url.includes('/signup') || url.includes('/refreshToken');
  }

  private refreshTokenAttempts = 0;
  private readonly MAX_REFRESH_ATTEMPTS = 2;

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this.refreshTokenAttempts >= this.MAX_REFRESH_ATTEMPTS) {
      this.authService.logout().subscribe();
      return throwError(() => new Error('Max refresh attempts reached'));
    }

    if (!this.isRefreshingToken) {
      this.isRefreshingToken = true;
      this.tokenSubject.next(null);
      this.refreshTokenAttempts++;

      return this.authService.refreshToken().pipe(
        switchMap(() => {
          this.isRefreshingToken = false;
          this.refreshTokenAttempts = 0;
          const token = this.authService.getAccessToken();
          this.tokenSubject.next(token);
          return next.handle(this.addTokenToRequest(request, token));
        }),
        catchError(err => {
          this.isRefreshingToken = false;
          if (this.refreshTokenAttempts >= this.MAX_REFRESH_ATTEMPTS || err.status === 401) {
            this.authService.logout().subscribe(() => {
              this.router.navigate(['/user/login']);
            });
          }
          return throwError(() => err);
        })
      );
    }
    // wait for the refresh
    return this.tokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap(token => next.handle(this.addTokenToRequest(request, token)))
    );
  }


  private addTokenToRequest(request: HttpRequest<any>, token: string | null): HttpRequest<any> {
    if (token) {
      return request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
    return request;
  }
}
