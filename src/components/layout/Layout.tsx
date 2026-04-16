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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar whenever the route changes (mobile nav tap)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

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
      {/* Mobile overlay — shown when sidebar is open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        pendingCount={pendingCount}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content — on desktop pushed right by sidebar width, on mobile full width */}
      <div className="flex-1 flex flex-col lg:ml-64 min-w-0">
        <Header title={title} onMenuToggle={() => setSidebarOpen((o) => !o)} />
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
