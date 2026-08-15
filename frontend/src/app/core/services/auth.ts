import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { tap } from 'rxjs';

import { environment } from '../../../environments/environment';

import {
  AuthResponse,
  AuthenticatedTrainer,
  LoginRequest,
  RegisterRequest,
} from '../models/auth.model';

@Service()
export class Auth {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/auth`;

  private readonly tokenKey = 'accessToken';

  register(data: RegisterRequest) {
    return this.http
      .post<AuthResponse>(
        `${this.apiUrl}/register`,
        data,
      )
      .pipe(
        tap((response) => {
          this.saveToken(response.accessToken);
        }),
      );
  }

  login(data: LoginRequest) {
    return this.http
      .post<AuthResponse>(
        `${this.apiUrl}/login`,
        data,
      )
      .pipe(
        tap((response) => {
          this.saveToken(response.accessToken);
        }),
      );
  }

  getCurrentTrainer() {
    return this.http.get<AuthenticatedTrainer>(`${this.apiUrl}/me`);
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }

  private saveToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }
}
