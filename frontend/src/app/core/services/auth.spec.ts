import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { Auth } from './auth';

describe('Auth', () => {
  let service: Auth;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(Auth);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
    localStorage.clear();
  });

  it('registers a trainer and stores the access token', () => {
    const credentials = {
      email: 'trainer@example.com',
      password: 'password',
    };

    service.register(credentials).subscribe();

    const request = httpTesting.expectOne(
      `${environment.apiUrl}/auth/register`,
    );
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(credentials);
    request.flush({
      user: { id: 1, email: credentials.email },
      accessToken: 'trainer-token',
    });

    expect(service.getToken()).toBe('trainer-token');
  });

  it('logs in a trainer and stores the access token', () => {
    const credentials = {
      email: 'trainer@example.com',
      password: 'password',
    };

    service.login(credentials).subscribe();

    const request = httpTesting.expectOne(
      `${environment.apiUrl}/auth/login`,
    );
    expect(request.request.method).toBe('POST');
    request.flush({
      user: { id: 1, email: credentials.email },
      accessToken: 'trainer-token',
    });

    expect(service.isAuthenticated()).toBe(true);
  });

  it('loads the authenticated trainer identity', () => {
    service.getCurrentTrainer().subscribe();

    const request = httpTesting.expectOne(`${environment.apiUrl}/auth/me`);
    expect(request.request.method).toBe('GET');
    request.flush({ sub: 1, email: 'trainer@example.com' });
  });

  it('logs out by removing the access token', () => {
    localStorage.setItem('accessToken', 'trainer-token');

    service.logout();

    expect(service.isAuthenticated()).toBe(false);
  });
});
