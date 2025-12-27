/**
 * useNotifications Hook
 *
 * Custom hook for managing in-app notifications with pagination,
 * filtering, and mark as read functionality.
 *
 * @example
 * const { notifications, unreadCount, loading, markAsRead, loadMore } = useNotifications({
 *   userId: user?.id,
 *   filter: 'all',
 *   autoFetch: true,
 * });
 */

import { useState, useCallback, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import type { InAppNotification, NotificationType } from '@/types/notification.types';

// ============================================
// Types
// ============================================

export interface UseNotificationsOptions {
  /**
   * User ID to fetch notifications for
   */
  userId?: string;

  /**
   * Filter notifications by type
   * @default 'all'
   */
  filter?: 'all' | 'posts' | 'likes' | 'comments';

  /**
   * Number of notifications to fetch per page
   * @default 20
   */
  pageSize?: number;

  /**
   * Whether to fetch notifications automatically on mount
   * @default false
   */
  autoFetch?: boolean;
}

export interface UseNotificationsReturn {
  /**
   * Array of notifications
   */
  notifications: InAppNotification[];

  /**
   * Count of unread notifications
   */
  unreadCount: number;

  /**
   * Whether notifications are currently being fetched
   */
  loading: boolean;

  /**
   * Error object if fetch failed
   */
  error: Error | null;

  /**
   * Whether there are more notifications to load
   */
  hasMore: boolean;

  /**
   * Load more notifications (pagination)
   */
  loadMore: () => Promise<void>;

  /**
   * Mark a single notification as read
   */
  markAsRead: (id: string) => Promise<boolean>;

  /**
   * Mark all notifications as read
   */
  markAllAsRead: () => Promise<boolean>;

  /**
   * Refetch notifications from the beginning
   */
  refetch: () => Promise<void>;
}

// ============================================
// Hook Implementation
// ============================================

export function useNotifications(
  options: UseNotificationsOptions = {}
): UseNotificationsReturn {
  const {
    userId,
    filter = 'all',
    pageSize = 20,
    autoFetch = false,
  } = options;

  // State
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [offset, setOffset] = useState<number>(0);

  const supabase = createClient();

  /**
   * Fetch notifications with pagination
   */
  const fetchNotifications = useCallback(
    async (reset: boolean = false) => {
      if (!userId) {
        setNotifications([]);
        setUnreadCount(0);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const currentOffset = reset ? 0 : offset;

        // Build query
        let query = supabase
          .from('in_app_notifications')
          .select(`
            *,
            actor:user_profiles!actor_id (
              username,
              profile_picture_url
            )
          `)
          .eq('user_id', userId);

        // Apply filter
        if (filter !== 'all') {
          const typeMap: Record<string, NotificationType> = {
            posts: 'friend_post',
            likes: 'like',
            comments: 'comment',
          };
          const notificationType = typeMap[filter];
          if (notificationType) {
            query = query.eq('type', notificationType);
          }
        }

        // Order and paginate
        query = query
          .order('created_at', { ascending: false })
          .range(currentOffset, currentOffset + pageSize - 1);

        const { data, error: fetchError } = await query;

        if (fetchError) throw fetchError;

        if (data) {
          // Transform data to match InAppNotification interface
          const transformedData: InAppNotification[] = data.map((item: any) => ({
            ...item,
            actor_username: item.actor?.username || 'Unknown',
            actor_avatar: item.actor?.profile_picture_url,
          }));

          if (reset) {
            setNotifications(transformedData);
            setOffset(transformedData.length);
          } else {
            setNotifications((prev) => [...prev, ...transformedData]);
            setOffset((prev) => prev + transformedData.length);
          }

          // Check if there are more notifications
          setHasMore(transformedData.length === pageSize);
        }

        // Fetch unread count separately (more efficient)
        const { count, error: countError } = await supabase
          .from('in_app_notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('is_read', false);

        if (!countError && count !== null) {
          setUnreadCount(count);
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to fetch notifications');
        setError(error);
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    },
    [userId, filter, pageSize, offset, supabase]
  );

  /**
   * Load more notifications (pagination)
   */
  const loadMore = useCallback(async () => {
    if (!loading && hasMore) {
      await fetchNotifications(false);
    }
  }, [loading, hasMore, fetchNotifications]);

  /**
   * Mark a single notification as read
   */
  const markAsRead = useCallback(
    async (id: string): Promise<boolean> => {
      if (!userId) return false;

      try {
        // Optimistic update
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));

        const { error: updateError } = await supabase
          .from('in_app_notifications')
          .update({ is_read: true })
          .eq('id', id)
          .eq('user_id', userId);

        if (updateError) throw updateError;

        return true;
      } catch (err) {
        // Revert optimistic update on error
        await fetchNotifications(true);
        console.error('Error marking notification as read:', err);
        return false;
      }
    },
    [userId, supabase, fetchNotifications]
  );

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = useCallback(async (): Promise<boolean> => {
    if (!userId) return false;

    try {
      // Optimistic update
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);

      const { error: updateError } = await supabase
        .from('in_app_notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (updateError) throw updateError;

      return true;
    } catch (err) {
      // Revert optimistic update on error
      await fetchNotifications(true);
      console.error('Error marking all notifications as read:', err);
      return false;
    }
  }, [userId, supabase, fetchNotifications]);

  /**
   * Refetch notifications from the beginning
   */
  const refetch = useCallback(async () => {
    await fetchNotifications(true);
  }, [fetchNotifications]);

  // Auto-fetch on mount or when dependencies change
  useEffect(() => {
    if (autoFetch) {
      fetchNotifications(true);
    }
  }, [autoFetch, userId, filter]); // Only refetch when these change

  return {
    notifications,
    unreadCount,
    loading,
    error,
    hasMore,
    loadMore,
    markAsRead,
    markAllAsRead,
    refetch,
  };
}
