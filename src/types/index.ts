export type UserRole = 'Buyer' | 'Seller' | 'Admin';
export type ListingStatus = 'Draft' | 'PendingApproval' | 'Active' | 'Rejected' | 'Sold';
export type Species = 'Dog' | 'Cat' | 'Bird' | 'Fish' | 'Rabbit' | 'Other';

export interface DashboardStats {
  totalUsers: number;
  totalBuyers: number;
  totalSellers: number;
  verifiedSellers: number;
  bannedUsers: number;
  totalListings: number;
  draftListings: number;
  pendingListings: number;
  activeListings: number;
  rejectedListings: number;
  soldListings: number;
  totalInquiries: number;
  totalFavorites: number;
}

export interface AdminListing {
  id: string;
  title: string;
  species: string;
  breed?: string;
  price: number;
  city: string;
  status: ListingStatus;
  rejectionReason?: string;
  isVaccinated: boolean;
  isVetChecked: boolean;
  sellerId: string;
  sellerName: string;
  sellerEmail: string;
  isSellerVerified: boolean;
  imageCount: number;
  createdAt: string;
}

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  city?: string;
  role: UserRole;
  isVerified: boolean;
  isBanned: boolean;
  totalListings: number;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
}

// Actual shape returned by POST /api/auth/login — token + user fields at the same level
export interface LoginResponse {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  isVerified: boolean;
  token: string;
}
