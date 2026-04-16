import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  List,
  Clock,
  Users,
  Store,
  LogOut,
  PawPrint,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

interface SidebarProps {
  pendingCount?: number;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ pendingCount = 0, isOpen = false, onClose }: SidebarProps) {
  const { logout } = useAuth();

  const navItems: NavItem[] = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/listings', label: 'All Listings', icon: List },
    { to: '/listings/pending', label: 'Pending Approval', icon: Clock, badge: pendingCount },
    { to: '/users', label: 'Users', icon: Users },
    { to: '/sellers', label: 'Sellers', icon: Store },
  ];

  return (
    <aside
      className={`
        fixed left-0 top-0 h-full w-64 bg-gray-900 text-white flex flex-col z-40
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}
    >
      {/* Logo + mobile close button */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <PawPrint className="w-7 h-7 text-blue-400 flex-shrink-0" />
          <div>
            <p className="font-bold text-sm leading-tight">PetMarketplace</p>
            <p className="text-xs text-gray-400">Admin Panel</p>
          </div>
        </div>
        {/* Close button — only shown on mobile */}
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
          aria-label="Close sidebar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-4 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <span className="flex items-center gap-3">
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </span>
            {badge !== undefined && badge > 0 && (
              <span className="bg-yellow-500 text-gray-900 text-xs font-bold px-1.5 py-0.5 rounded-full">
                {badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-4 py-4 border-t border-gray-700">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
