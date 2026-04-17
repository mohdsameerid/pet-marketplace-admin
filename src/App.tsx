import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Listings from './pages/Listings';
import PendingListings from './pages/PendingListings';
import Users from './pages/Users';
import Sellers from './pages/Sellers';
import Spinner from './components/ui/Spinner';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="listings" element={<Listings />} />
        <Route path="listings/pending" element={<PendingListings />} />
        <Route path="users" element={<Users />} />
        <Route path="sellers" element={<Sellers />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          gutter={8}
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: '8px',
              padding: '12px 16px',
              fontSize: '14px',
              fontWeight: '500',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              maxWidth: '380px',
            },
            success: {
              style: {
                background: '#f0fdf4',
                color: '#15803d',
                border: '1px solid #bbf7d0',
              },
              iconTheme: { primary: '#16a34a', secondary: '#f0fdf4' },
            },
            error: {
              duration: 5000,
              style: {
                background: '#fef2f2',
                color: '#b91c1c',
                border: '1px solid #fecaca',
              },
              iconTheme: { primary: '#dc2626', secondary: '#fef2f2' },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
