import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  baseURL = 'http://localhost:5001/api';
  private currentUserSubject: BehaviorSubject<string | null>;

  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<string | null>(
      localStorage.getItem('jwt_token')
    );
  }

  createUser(formData:any){
    return this.http.post(this.baseURL+'/signup',formData).pipe(
      tap((response : any) => {

      })
    );
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.baseURL}/signin`, credentials).pipe(
      tap((response: any) => {
        this.storeToken(response.token);
      })
    );
  }

  private storeToken(token: string): void {
    localStorage.setItem('jwt_token', token);
    this.currentUserSubject.next(token);
  }

  getToken(): string | null {
    return localStorage.getItem('jwt_token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    localStorage.removeItem('jwt_token');
    this.currentUserSubject.next(null);
  }

  get currentUser$(): Observable<string | null> {
    return this.currentUserSubject.asObservable();
  }

  isTokenExpired(): boolean {
    const helper = new JwtHelperService();
    return helper.isTokenExpired(this.getToken());
  }
}
