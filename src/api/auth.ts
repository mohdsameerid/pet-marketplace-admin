import client from './client';
import type { ApiResponse, AuthUser, LoginResponse } from '../types';

export const login = (email: string, password: string) =>
  client.post<ApiResponse<LoginResponse>>('/api/auth/login', { email, password });

export const getMe = () =>
  client.get<ApiResponse<AuthUser>>('/api/auth/me');
