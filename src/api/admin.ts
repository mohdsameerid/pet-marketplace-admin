import client from './client';
import type { ApiResponse, PagedResult, DashboardStats, AdminListing, AdminUser } from '../types';

export const getDashboardStats = () =>
  client.get<ApiResponse<DashboardStats>>('/api/admin/dashboard');

export const getAllListings = (pageNumber: number, pageSize: number, status?: string) =>
  client.get<ApiResponse<PagedResult<AdminListing>>>('/api/admin/listings', {
    params: { pageNumber, pageSize, ...(status ? { status } : {}) },
  });

export const getPendingListings = (pageNumber: number, pageSize: number) =>
  client.get<ApiResponse<PagedResult<AdminListing>>>('/api/admin/listings/pending', {
    params: { pageNumber, pageSize },
  });

export const approveListing = (id: string) =>
  client.post<ApiResponse<null>>(`/api/admin/listings/${id}/approve`);

export const rejectListing = (id: string, reason: string) =>
  client.post<ApiResponse<null>>(`/api/admin/listings/${id}/reject`, { reason });

export const getAllUsers = (pageNumber: number, pageSize: number, role?: string) =>
  client.get<ApiResponse<PagedResult<AdminUser>>>('/api/users', {
    params: { pageNumber, pageSize, ...(role ? { role } : {}) },
  });

export interface UpdateUserPayload {
  fullName: string;
  email: string;
  phoneNumber?: string;
  city?: string;
  role: string;
}

export const updateUser = (id: string, payload: UpdateUserPayload) =>
  client.put<ApiResponse<AdminUser>>(`/api/users/${id}`, payload);

export const verifySeller = (id: string) =>
  client.post<ApiResponse<null>>(`/api/users/${id}/verify-seller`);

export const banUser = (id: string) =>
  client.post<ApiResponse<null>>(`/api/users/${id}/ban`);

export const unbanUser = (id: string) =>
  client.post<ApiResponse<null>>(`/api/users/${id}/unban`);
