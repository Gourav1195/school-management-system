'use client';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import NavInner from './NavInner';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith('/auth');

  const { token } = useAuth();
  const isPublicDashboard = pathname === '/' && !token;

  if (isAuthPage || isPublicDashboard) {
    return <>{children}</>;
  }

  return <NavInner>{children}</NavInner>;
}
