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
  client.get<ApiResponse<PagedResult<AdminUser>>>('/api/admin/users', {
    params: { pageNumber, pageSize, ...(role ? { role } : {}) },
  });

export const verifySeller = (id: string) =>
  client.post<ApiResponse<null>>(`/api/admin/users/${id}/verify-seller`);

export const banUser = (id: string) =>
  client.post<ApiResponse<null>>(`/api/admin/users/${id}/ban`);

export const unbanUser = (id: string) =>
  client.post<ApiResponse<null>>(`/api/admin/users/${id}/unban`);
