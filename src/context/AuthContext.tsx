'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

type DecodedToken = {
  userId: string;
  role: string;
  tenantId: string;
  exp: number;
  plan: string;
  memberId: string;
};

type AuthContextType = {
  token: string | null;
  role: string | null;
  tenantId: string;
  isPremium: boolean;
  login: (token: string) => void;
  logout: () => void;
  loading: boolean;
  memberId: string | null;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [memberId, setMemberId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [tenantId, setTenantId] = useState('');
  const router = useRouter();

  useEffect(() => {
    const t = localStorage.getItem('token');
    if (t) {
      try {
        const decoded = jwtDecode<DecodedToken>(t);
        setToken(t);
        setTenantId(decoded.tenantId);
        setRole(decoded.role);
        setMemberId(decoded.memberId);
        setIsPremium(decoded.plan === 'Premium');
      } catch (err) {
        console.error('Invalid token:', err);
        localStorage.removeItem('token');
        router.push('/auth/login');
      }
    } else {
      // router.push('/auth/login'); // ⛔️ No token, force login
    }
    setLoading(false);
  }, [router]);

  const login = (newToken: string) => {
    const decoded = jwtDecode<DecodedToken>(newToken);
    setToken(newToken);
    setTenantId(decoded.tenantId);
    setIsPremium(decoded.plan === 'Premium');
    setRole(decoded.role);
    setMemberId(decoded.memberId);
    localStorage.setItem('token', newToken);
    window.dispatchEvent(new Event('token-changed')); // Optional: for syncing
    router.push('/');
  };

  const logout = () => {
    setToken(null);
    setTenantId('');
    setRole('');
    setMemberId('');
    setIsPremium(false);
    localStorage.removeItem('token');
    window.dispatchEvent(new Event('token-changed'));
    router.push('/auth/login');
  };

  return (
    <AuthContext.Provider value={{ tenantId, token, role, isPremium, login, logout, loading, memberId }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
