export type UserRole = 'ODONTOLOGO' | 'ADMINISTRADOR';

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  role: UserRole;
}
