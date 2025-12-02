'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import type { User } from '@supabase/supabase-js';

interface UseSupabaseAuthOptions {
  /**
   * Path to redirect to if user is not authenticated
   * @default undefined (no redirect)
   */
  redirectTo?: string;
  /**
   * Whether authentication is required
   * If true and user is not authenticated, will redirect to redirectTo
   * @default false
   */
  requireAuth?: boolean;
}

interface UseSupabaseAuthReturn {
  /** The authenticated user object, or null if not authenticated */
  user: User | null;
  /** Loading state while fetching user */
  loading: boolean;
  /** Error if authentication check failed */
  error: Error | null;
  /** Convenience boolean for whether user is authenticated */
  isAuthenticated: boolean;
  /** Supabase client instance */
  supabase: ReturnType<typeof createClient>;
}

/**
 * Custom hook for Supabase authentication
 *
 * Handles user authentication state, loading, errors, and optional redirects.
 * SSR-safe implementation that only runs on the client.
 *
 * @param options - Configuration options
 * @returns Authentication state and supabase client
 *
 * @example
 * // Basic usage - just get user state
 * const { user, loading, isAuthenticated } = useSupabaseAuth();
 *
 * @example
 * // Require authentication with redirect
 * const { user, loading } = useSupabaseAuth({
 *   requireAuth: true,
 *   redirectTo: '/login'
 * });
 *
 * @example
 * // Access supabase client for queries
 * const { user, supabase } = useSupabaseAuth();
 * // Use supabase.from('table')...
 */
export function useSupabaseAuth(
  options: UseSupabaseAuthOptions = {}
): UseSupabaseAuthReturn {
  const { redirectTo, requireAuth = false } = options;
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: { user: fetchedUser }, error: userError } = await supabase.auth.getUser();

        if (!isMounted) return;

        if (userError) {
          setError(userError);
          setUser(null);

          if (requireAuth && redirectTo) {
            console.log('Authentication error, redirecting to:', redirectTo);
            router.push(redirectTo);
          }
          return;
        }

        if (!fetchedUser) {
          setUser(null);

          if (requireAuth && redirectTo) {
            console.log('Not authenticated, redirecting to:', redirectTo);
            router.push(redirectTo);
          }
          return;
        }

        setUser(fetchedUser);
      } catch (err) {
        if (!isMounted) return;

        const error = err instanceof Error ? err : new Error('Unknown authentication error');
        setError(error);
        setUser(null);

        if (requireAuth && redirectTo) {
          console.error('Authentication failed:', error);
          router.push(redirectTo);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchUser();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;

        if (event === 'SIGNED_OUT' || !session) {
          setUser(null);
          if (requireAuth && redirectTo) {
            router.push(redirectTo);
          }
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setUser(session.user);
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [redirectTo, requireAuth, router, supabase]);

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    supabase
  };
}
