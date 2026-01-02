/**
 * useUnreadCount Hook
 *
 * Lightweight hook for tracking unread notification count with polling.
 * Used in AppHeader to show the notification badge.
 *
 * @example
 * const { unreadCount, loading, refetch } = useUnreadCount({
 *   userId: user?.id,
 *   pollInterval: 30000, // Poll every 30 seconds
 * });
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';

// ============================================
// Types
// ============================================

export interface UseUnreadCountOptions {
  /**
   * User ID to fetch unread count for
   */
  userId?: string;

  /**
   * Interval in milliseconds to poll for updates
   * @default 30000 (30 seconds)
   */
  pollInterval?: number;
}

export interface UseUnreadCountReturn {
  /**
   * Count of unread notifications
   */
  unreadCount: number;

  /**
   * Whether the count is currently being fetched
   */
  loading: boolean;

  /**
   * Error object if fetch failed
   */
  error: Error | null;

  /**
   * Manually refetch the count
   */
  refetch: () => Promise<void>;
}

// ============================================
// Hook Implementation
// ============================================

export function useUnreadCount(
  options: UseUnreadCountOptions = {}
): UseUnreadCountReturn {
  const {
    userId,
    pollInterval = 30000, // 30 seconds
  } = options;

  // State
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Ref to store interval ID
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const supabase = createClient();

  /**
   * Fetch unread notification count
   */
  const fetchUnreadCount = useCallback(async () => {
    if (!userId) {
      console.log('🔔 useUnreadCount: No userId, skipping fetch');
      setUnreadCount(0);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('🔔 useUnreadCount: Fetching for userId:', userId);

      const { count, error: countError } = await supabase
        .from('in_app_notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      console.log('🔔 useUnreadCount: Response -', { count, error: countError });

      if (countError) throw countError;

      setUnreadCount(count || 0);
      console.log('🔔 useUnreadCount: Set unreadCount to:', count || 0);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch unread count');
      setError(error);
      console.error('❌ useUnreadCount: Error fetching unread count:', error);
    } finally {
      setLoading(false);
    }
  }, [userId, supabase]);

  /**
   * Manually refetch the count
   */
  const refetch = useCallback(async () => {
    await fetchUnreadCount();
  }, [fetchUnreadCount]);

  // Set up polling
  useEffect(() => {
    // Fetch immediately on mount
    if (userId) {
      fetchUnreadCount();
    }

    // Set up interval
    if (userId && pollInterval > 0) {
      intervalRef.current = setInterval(() => {
        fetchUnreadCount();
      }, pollInterval);
    }

    // Cleanup on unmount or when dependencies change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [userId, pollInterval, fetchUnreadCount]);

  return {
    unreadCount,
    loading,
    error,
    refetch,
  };
}
