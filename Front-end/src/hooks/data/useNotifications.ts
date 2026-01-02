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
        console.log('📬 useNotifications: No userId, skipping fetch');
        setNotifications([]);
        setUnreadCount(0);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const currentOffset = reset ? 0 : offset;

        console.log('📬 useNotifications: Fetching notifications', {
          userId,
          filter,
          offset: currentOffset,
          pageSize,
          reset
        });

        let transformedData: InAppNotification[] = [];

        // For likes only, query activity_likes directly
        if (filter === 'likes') {
          console.log('📬 useNotifications: Fetching likes from activity_likes table');

          const { data: likesData, error: likesError } = await supabase
            .from('activity_likes')
            .select(`
              id,
              activity_id,
              user_id,
              created_at,
              feed_activities!inner (
                id,
                user_id,
                activity_type,
                habit_id,
                habits (
                  title
                )
              )
            `)
            .eq('feed_activities.user_id', userId)
            .order('created_at', { ascending: false })
            .range(currentOffset, currentOffset + pageSize - 1);

          console.log('📬 useNotifications: Likes query response', {
            dataLength: likesData?.length || 0,
            error: likesError,
            data: likesData
          });

          if (likesError) throw likesError;

          if (likesData) {
            // Get unique user IDs who liked
            const likerIds = [...new Set(likesData.map(like => like.user_id))];

            // Fetch liker profiles
            const { data: profilesData } = await supabase
              .from('user_profiles')
              .select('id, username, profile_picture_url')
              .in('id', likerIds);

            const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);

            // Transform likes to notification format
            transformedData = likesData.map((like: any) => {
              const activity = like.feed_activities;
              const liker = profilesMap.get(like.user_id);

              return {
                id: like.id,
                user_id: userId,
                type: 'like' as NotificationType,
                actor_id: like.user_id,
                actor_username: liker?.username || 'Unknown',
                actor_avatar: liker?.profile_picture_url,
                activity_id: like.activity_id,
                activity_type: activity?.activity_type || 'habit_completion',
                activity_context: activity?.habits?.title ? `completed ${activity.habits.title}` : activity?.activity_type || '',
                comment_text: undefined,
                is_read: true, // Likes are always considered "seen"
                created_at: like.created_at,
              };
            });
          }

          setHasMore((likesData?.length || 0) === pageSize);
        } else if (filter === 'all') {
          // For 'all', fetch from BOTH sources and merge
          console.log('📬 useNotifications: Fetching ALL notifications (posts, comments, likes)');

          // 1. Fetch posts and comments from in_app_notifications
          const { data: notificationsData, error: notificationsError } = await supabase
            .from('in_app_notifications')
            .select(`
              *,
              actor:user_profiles!actor_id (
                username,
                profile_picture_url
              )
            `)
            .eq('user_id', userId)
            .neq('type', 'like')
            .order('created_at', { ascending: false })
            .range(currentOffset, currentOffset + pageSize - 1);

          console.log('📬 useNotifications: Notifications query response', {
            dataLength: notificationsData?.length || 0,
            error: notificationsError,
            data: notificationsData
          });

          if (notificationsError) throw notificationsError;

          // 2. Fetch likes from activity_likes
          const { data: likesData, error: likesError } = await supabase
            .from('activity_likes')
            .select(`
              id,
              activity_id,
              user_id,
              created_at,
              feed_activities!inner (
                id,
                user_id,
                activity_type,
                habit_id,
                habits (
                  title
                )
              )
            `)
            .eq('feed_activities.user_id', userId)
            .order('created_at', { ascending: false })
            .range(currentOffset, currentOffset + pageSize - 1);

          console.log('📬 useNotifications: Likes query response (for all)', {
            dataLength: likesData?.length || 0,
            error: likesError,
            data: likesData
          });

          if (likesError) throw likesError;

          // 3. Transform notifications from in_app_notifications
          const notificationsTransformed = notificationsData?.map((item: any) => ({
            ...item,
            actor_username: item.actor?.username || 'Unknown',
            actor_avatar: item.actor?.profile_picture_url,
          })) || [];

          // 4. Transform likes from activity_likes
          let likesTransformed: InAppNotification[] = [];
          if (likesData) {
            // Get unique user IDs who liked
            const likerIds = [...new Set(likesData.map(like => like.user_id))];

            // Fetch liker profiles
            const { data: profilesData } = await supabase
              .from('user_profiles')
              .select('id, username, profile_picture_url')
              .in('id', likerIds);

            const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);

            likesTransformed = likesData.map((like: any) => {
              const activity = like.feed_activities;
              const liker = profilesMap.get(like.user_id);

              return {
                id: like.id,
                user_id: userId,
                type: 'like' as NotificationType,
                actor_id: like.user_id,
                actor_username: liker?.username || 'Unknown',
                actor_avatar: liker?.profile_picture_url,
                activity_id: like.activity_id,
                activity_type: activity?.activity_type || 'habit_completion',
                activity_context: activity?.habits?.title ? `completed ${activity.habits.title}` : activity?.activity_type || '',
                comment_text: undefined,
                is_read: true,
                created_at: like.created_at,
              };
            });
          }

          // 5. Merge and sort by created_at DESC
          transformedData = [...notificationsTransformed, ...likesTransformed]
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

          console.log('📬 useNotifications: Merged results', {
            notificationsCount: notificationsTransformed.length,
            likesCount: likesTransformed.length,
            totalCount: transformedData.length
          });

          setHasMore(
            (notificationsData?.length || 0) === pageSize ||
            (likesData?.length || 0) === pageSize
          );
        } else {
          // For specific filters (posts or comments), query in_app_notifications only
          const typeMap: Record<string, NotificationType> = {
            posts: 'friend_post',
            comments: 'comment',
          };
          const notificationType = typeMap[filter];

          if (notificationType) {
            console.log('📬 useNotifications: Applying filter:', notificationType);

            const { data, error: fetchError } = await supabase
              .from('in_app_notifications')
              .select(`
                *,
                actor:user_profiles!actor_id (
                  username,
                  profile_picture_url
                )
              `)
              .eq('user_id', userId)
              .eq('type', notificationType)
              .order('created_at', { ascending: false })
              .range(currentOffset, currentOffset + pageSize - 1);

            console.log('📬 useNotifications: Query response', {
              dataLength: data?.length || 0,
              error: fetchError,
              data
            });

            if (fetchError) throw fetchError;

            if (data) {
              transformedData = data.map((item: any) => ({
                ...item,
                actor_username: item.actor?.username || 'Unknown',
                actor_avatar: item.actor?.profile_picture_url,
              }));

              setHasMore(transformedData.length === pageSize);
            }
          }
        }

        // Set notifications state
        if (reset) {
          setNotifications(transformedData);
          setOffset(transformedData.length);
        } else {
          setNotifications((prev) => [...prev, ...transformedData]);
          setOffset((prev) => prev + transformedData.length);
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
