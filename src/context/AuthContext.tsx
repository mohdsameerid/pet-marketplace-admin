import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMe } from '../api/auth';
import type { AuthUser, LoginResponse } from '../types';

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (data: LoginResponse) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('adminToken');
    if (!stored) {
      setIsLoading(false);
      return;
    }
    setToken(stored);
    getMe()
      .then((res) => {
        const u = res.data.data;
        if (u.role !== 'Admin') {
          logout();
        } else {
          setUser(u);
        }
      })
      .catch(() => {
        logout();
      })
      .finally(() => setIsLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = (data: LoginResponse) => {
    localStorage.setItem('adminToken', data.token);
    setToken(data.token);
    // API returns user fields + token at the same level
    setUser({ id: data.id, fullName: data.fullName, email: data.email, role: data.role });
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    setToken(null);
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
