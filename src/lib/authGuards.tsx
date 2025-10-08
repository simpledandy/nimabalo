'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from './useSession';

/**
 * Hook to protect routes that require authentication
 * Redirects to /auth if user is not logged in
 */
export function useRequireAuth(redirectTo: string = '/auth') {
  const { user, loading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      console.log('User not authenticated, redirecting to', redirectTo);
      router.push(redirectTo);
    }
  }, [user, loading, router, redirectTo]);

  return { user, loading, isAuthenticated: !!user };
}

/**
 * Hook to redirect authenticated users away from auth pages
 * Redirects to redirectTo if user is already logged in
 */
export function useRedirectIfAuthenticated(redirectTo: string = '/') {
  const { user, loading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      console.log('User already authenticated, redirecting to', redirectTo);
      router.push(redirectTo);
    }
  }, [user, loading, router, redirectTo]);

  return { user, loading, isAuthenticated: !!user };
}

/**
 * Higher-order component to protect pages that require authentication
 */
export function withAuth<P extends Record<string, unknown>>(
  Component: React.ComponentType<P>,
  redirectTo: string = '/auth'
): React.ComponentType<P> {
  const ProtectedRoute: React.ComponentType<P> = (props: P) => {
    const { user, loading } = useRequireAuth(redirectTo);

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-sky-50">
          <div className="text-center">
            <div className="text-5xl mb-4 animate-bounce-slow">⏳</div>
            <p className="text-lg text-neutral">Yuklanmoqda...</p>
          </div>
        </div>
      );
    }

    if (!user) {
      return null; // Will redirect via useRequireAuth
    }

    return <Component {...props} />;
  };

  return ProtectedRoute;
}

/**
 * Check if user has required permissions
 * Can be extended to check for specific roles or permissions
 */
export function useHasPermission(permission?: string): boolean {
  const { user } = useSession();
  
  if (!user) return false;
  
  // Add your permission logic here
  // For now, just check if user is authenticated
  if (!permission) return true;
  
  // Example: check user metadata for roles
  // const userRoles = user.user_metadata?.roles || [];
  // return userRoles.includes(permission);
  
  return true;
}
