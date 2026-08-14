export interface AuthUser {
  id: number;
  email: string;
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}