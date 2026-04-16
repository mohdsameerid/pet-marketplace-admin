import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, ShoppingBag, Clock, CheckCircle, XCircle,
  List, Star, MessageSquare, TrendingUp, Ban,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { getDashboardStats } from '../api/admin';
import type { DashboardStats } from '../types';
import StatCard from '../components/ui/StatCard';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';

const PIE_COLORS = ['#6b7280', '#f59e0b', '#22c55e', '#ef4444', '#3b82f6'];

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchStats = () => {
    setLoading(true);
    setError('');
    getDashboardStats()
      .then((res) => {
        if (res.data.success) setStats(res.data.data);
        else setError('Failed to load dashboard stats');
      })
      .catch(() => setError('Failed to load dashboard stats'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-red-600">{error || 'Something went wrong'}</p>
        <Button onClick={fetchStats}>Retry</Button>
      </div>
    );
  }

  const listingsPieData = [
    { name: 'Draft', value: stats.draftListings },
    { name: 'Pending', value: stats.pendingListings },
    { name: 'Active', value: stats.activeListings },
    { name: 'Rejected', value: stats.rejectedListings },
    { name: 'Sold', value: stats.soldListings },
  ];

  const usersBarData = [
    { role: 'Buyers', count: stats.totalBuyers },
    { role: 'Sellers', count: stats.totalSellers },
  ];

  return (
    <div className="space-y-6">
      {/* Users Row */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Users</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard icon={Users} label="Total Users" value={stats.totalUsers} />
          <StatCard icon={ShoppingBag} label="Buyers" value={stats.totalBuyers} iconColor="text-purple-600" bgColor="bg-purple-50" />
          <StatCard icon={Star} label="Sellers" value={stats.totalSellers} iconColor="text-orange-600" bgColor="bg-orange-50" />
          <StatCard icon={CheckCircle} label="Verified Sellers" value={stats.verifiedSellers} iconColor="text-green-600" bgColor="bg-green-50" />
          <StatCard icon={Ban} label="Banned Users" value={stats.bannedUsers} iconColor="text-red-600" bgColor="bg-red-50" />
        </div>
      </div>

      {/* Listings Row */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Listings</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard icon={List} label="Total Listings" value={stats.totalListings} />
          <StatCard
            icon={Clock}
            label="Pending Approval"
            value={stats.pendingListings}
            iconColor="text-yellow-600"
            bgColor="bg-yellow-50"
            highlight={stats.pendingListings > 0}
          />
          <StatCard icon={CheckCircle} label="Active" value={stats.activeListings} iconColor="text-green-600" bgColor="bg-green-50" />
          <StatCard icon={XCircle} label="Rejected" value={stats.rejectedListings} iconColor="text-red-600" bgColor="bg-red-50" />
          <StatCard icon={TrendingUp} label="Sold" value={stats.soldListings} iconColor="text-blue-600" bgColor="bg-blue-50" />
        </div>
      </div>

      {/* Activity Row */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Activity</h2>
        <div className="grid grid-cols-2 gap-4 max-w-sm">
          <StatCard icon={MessageSquare} label="Total Inquiries" value={stats.totalInquiries} iconColor="text-indigo-600" bgColor="bg-indigo-50" />
          <StatCard icon={Star} label="Total Favorites" value={stats.totalFavorites} iconColor="text-pink-600" bgColor="bg-pink-50" />
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Listings by Status</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={listingsPieData}
                cx="50%"
                cy="50%"
                outerRadius={90}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
                labelLine={false}
              >
                {listingsPieData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Users by Role</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={usersBarData}>
              <XAxis dataKey="role" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="flex items-center gap-4">
          <Button
            variant="primary"
            onClick={() => navigate('/listings/pending')}
            className="flex items-center gap-2"
          >
            <Clock className="w-4 h-4" />
            Review Pending Listings
            {stats.pendingListings > 0 && (
              <span className="bg-yellow-400 text-gray-900 text-xs font-bold px-2 py-0.5 rounded-full">
                {stats.pendingListings}
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
