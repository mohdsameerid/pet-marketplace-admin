import type { ListingStatus } from '../../types';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-700',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-yellow-100 text-yellow-700',
  danger: 'bg-red-100 text-red-700',
  info: 'bg-blue-100 text-blue-700',
};

export default function Badge({ variant = 'default', children }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]}`}>
      {children}
    </span>
  );
}

export function listingStatusVariant(status: ListingStatus): BadgeVariant {
  switch (status) {
    case 'Active': return 'success';
    case 'PendingApproval': return 'warning';
    case 'Rejected': return 'danger';
    case 'Draft': return 'default';
    case 'Sold': return 'info';
  }
}

export function userStatusVariant(isVerified: boolean, isBanned: boolean): BadgeVariant {
  if (isBanned) return 'danger';
  if (isVerified) return 'success';
  return 'default';
}
