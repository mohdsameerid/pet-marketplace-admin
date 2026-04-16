import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useEffect, useState } from 'react';
import { getDashboardStats } from '../../api/admin';

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/listings': 'All Listings',
  '/listings/pending': 'Pending Approval',
  '/users': 'Users',
  '/sellers': 'Sellers',
};

export default function Layout() {
  const location = useLocation();
  const title = pageTitles[location.pathname] ?? 'Admin Panel';
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    getDashboardStats()
      .then((res) => {
        if (res.data.success) {
          setPendingCount(res.data.data.pendingListings);
        }
      })
      .catch(() => {});
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar pendingCount={pendingCount} />
      <div className="flex-1 flex flex-col ml-64">
        <Header title={title} />
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
