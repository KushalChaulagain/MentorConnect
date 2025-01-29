import { UserRole } from '@/types';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function useAuth(requiredRole?: UserRole) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/login');
      return;
    }

    if (requiredRole && session.user.role !== requiredRole) {
      router.push('/');
      return;
    }
  }, [session, status, requiredRole, router]);

  return {
    session,
    status,
    isAuthenticated: !!session,
    isLoading: status === 'loading',
    user: session?.user,
  };
} 