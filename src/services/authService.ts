import apiClient from '@/api/apiClient';
import type { AuthResponse, LoginRequest, RegisterRequest } from '@/types/auth.types';

export async function loginUser(data: LoginRequest): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/auth/login', data);
  return response.data;
}

export async function registerUser(data: RegisterRequest): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/auth/register', data);
  return response.data;
}
