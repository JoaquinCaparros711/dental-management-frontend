import { useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { loginUser, registerUser } from '@/services/authService';
import type { AuthResponse, LoginRequest, RegisterRequest } from '@/types/auth.types';

export function useLogin() {
  return useMutation<AuthResponse, AxiosError, LoginRequest>({
    mutationFn: loginUser,
  });
}

export function useRegister() {
  return useMutation<AuthResponse, AxiosError, RegisterRequest>({
    mutationFn: registerUser,
  });
}
