import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { BehaviorSubject, Observable, throwError, of, timer } from 'rxjs';
import { catchError, tap, switchMap, filter, map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  baseURL = 'http://localhost:5001/api';
  private accessTokenSubject = new BehaviorSubject<string | null>(null);
  private isRefreshing = false;
  private refreshTokenTimeout: any;
  private jwtHelper = new JwtHelperService();

  // Observable for components to subscribe to authentication state
  public isAuthenticated$ = this.accessTokenSubject.pipe(
    map(token => !!token && !this.jwtHelper.isTokenExpired(token))
  );

  constructor(private http: HttpClient, private router: Router) {
    this.initializeAuthState();
  }

  // public initializeAuthState(): Promise<void> {
  //   return new Promise(resolve => {
  //     const token = localStorage.getItem('access_token');

  //     if (token && this.jwtHelper.isTokenExpired(token)) {
  //       this.refreshToken().subscribe({
  //         next: () => resolve(),
  //         error: () => {
  //           console.warn('No valid refresh token or refresh failed');
  //           resolve();
  //         }
  //       });
  //     } else if (token) {
  //       this.startRefreshTokenTimer(token);
  //       resolve();
  //     } else {
  //       // No token at all, do nothing
  //       resolve();
  //     }
  //   });
  // }


  public initializeAuthState(): Promise<void> {
    return new Promise(resolve => {
      const token = localStorage.getItem('access_token');
      if (!token || this.jwtHelper.isTokenExpired(token)) {
        this.refreshToken().subscribe(() => resolve(), () => resolve());
      } else {
        this.accessTokenSubject.next(token);
        this.startRefreshTokenTimer(token);
        resolve();
      }
    });
  }



  createUser(formData: any): Observable<any> {
    return this.http.post(`${this.baseURL}/signup`, formData , {withCredentials : true}).pipe(
      tap((response: any) => {
        this.setSession(response);
        this.redirectToHome();
        this.startRefreshTokenTimer(response.token);
      })
    );
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.baseURL}/signin`, credentials , {withCredentials : true}).pipe(
      tap((response: any) => {
        this.setSession(response);
        this.redirectToHome();
        this.startRefreshTokenTimer(response.token);
      })
    );
  }

  // This sets up the session after login or token refresh
  private setSession(authResult: any) {
    // Store only the access token in local storage
    localStorage.setItem('access_token', authResult.token);
    this.accessTokenSubject.next(authResult.token);

    // Start the timer for automatic refresh
    this.startRefreshTokenTimer(authResult.token);
  }

  private redirectToHome() {
    this.router.navigate(['/home']);
  }

  // Get the token for HttpInterceptor
  getAccessToken(): string | null {
    return this.accessTokenSubject.value;
  }

  // For components to check auth state synchronously
  isAuthenticated(): boolean {
    const token = this.accessTokenSubject.value;
    return !!token && !this.jwtHelper.isTokenExpired(token);
  }

  // Refresh token process
  refreshToken(): Observable<any> {
    // Don't make multiple refresh requests
    if (this.isRefreshing) {
      return this.accessTokenSubject.pipe(
        filter(token => token !== null),
        take(1)
      );
    }

    this.isRefreshing = true;

    // The backend expects the token in a cookie, not in the request body
    return this.http.get(`${this.baseURL}/refreshToken` , {withCredentials : true}).pipe(
      tap((response: any) => {
        this.isRefreshing = false;
        this.setSession(response);
        this.startRefreshTokenTimer(response.token);
      }),
      catchError(error => {
        this.isRefreshing = false;
        // Clear potentially invalid cookies
        // document.cookie = 'refreshToken=;';
        this.logout();
        return throwError(() => error);
      })
    );
  }

  // Set up the automatic refresh timer based on token expiry
  private startRefreshTokenTimer(token: string) {
    // Clear any existing timer
    this.stopRefreshTokenTimer();

    // Get the token expiration date
    const expires = this.jwtHelper.getTokenExpirationDate(token);
    if (!expires) return;

    // Get milliseconds until expiry, minus a buffer (e.g., refresh 1 minute before expiry)
    const timeout = expires.getTime() - Date.now() - (60 * 1000);

    // Set timer to refresh before token expires
    this.refreshTokenTimeout = setTimeout(() => {
      this.refreshToken().subscribe();
    }, Math.max(0, timeout));
  }

  private stopRefreshTokenTimer() {
    if (this.refreshTokenTimeout) {
      clearTimeout(this.refreshTokenTimeout);
    }
  }

  logout(): Observable<any> {
    // Use the refresh token from cookies to revoke it on the server
    return this.http.post(`${this.baseURL}/revokeToken`, {}).pipe(
      tap(() => this.handleLogout()),
      catchError(error => {
        // Even if server-side logout fails, clear local state
        this.handleLogout();
        return of(null);
      })
    );
  }

  private handleLogout() {
    localStorage.removeItem('access_token');
    this.stopRefreshTokenTimer();
    this.accessTokenSubject.next(null);
    this.router.navigate(['/user/login']);
  }

  // Convenience method for components to get the current user from token
  getCurrentUser() {
    const token = this.accessTokenSubject.value;
    if (!token) return null;

    try {
      const decodedToken = this.jwtHelper.decodeToken(token);
      return {
        id: decodedToken.uid,
        email: decodedToken.email,
        username: decodedToken.sub,
        roles: decodedToken.roles
      };
    } catch (error) {
      return null;
    }
  }

  // For components to subscribe to user data changes
  get currentUser$(): Observable<any> {
    return this.accessTokenSubject.pipe(
      map(token => {
        if (!token) return null;
        try {
          const decodedToken = this.jwtHelper.decodeToken(token);
          return {
            id: decodedToken.uid,
            email: decodedToken.email,
            username: decodedToken.sub,
            roles: decodedToken.roles
          };
        } catch (error) {
          return null;
        }
      })
    );
  }
}
