'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import type { FeedActivity } from '@/types/activity.types';

/**
 * Options for configuring the useFeedActivities hook
 */
export interface UseFeedActivitiesOptions {
  /**
   * User ID to fetch activities for (current user)
   */
  userId?: string | null;

  /**
   * Number of activities to fetch per page
   * @default 20
   */
  pageSize?: number;

  /**
   * Whether to automatically fetch activities on mount
   * @default true
   */
  autoFetch?: boolean;
}

/**
 * Return type for the useFeedActivities hook
 */
export interface UseFeedActivitiesReturn {
  /**
   * List of feed activities
   */
  activities: FeedActivity[];

  /**
   * Whether activities are currently loading
   */
  loading: boolean;

  /**
   * Error that occurred during fetch
   */
  error: Error | null;

  /**
   * Whether there are more activities to load
   */
  hasMore: boolean;

  /**
   * Load more activities (pagination)
   */
  loadMore: () => Promise<void>;

  /**
   * Manually refetch activities from the beginning
   */
  refetch: () => Promise<void>;
}

/**
 * Hook for managing feed activities
 *
 * Fetches activities from the user and their friends, with pagination support.
 * Automatically applies privacy filtering based on user settings.
 *
 * @param options - Configuration options
 * @returns Feed activities, loading state, and pagination controls
 */
export function useFeedActivities(options: UseFeedActivitiesOptions = {}): UseFeedActivitiesReturn {
  const { userId, pageSize = 20, autoFetch = true } = options;

  const [activities, setActivities] = useState<FeedActivity[]>([]);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const supabase = createClient();

  /**
   * Fetch activities with pagination
   */
  const fetchActivities = useCallback(async (isLoadMore: boolean = false) => {
    if (!userId) {
      setActivities([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Build query
      let query = supabase
        .from('feed_activities')
        .select(`
          *,
          user:user_profiles(
            id,
            username,
            profile_picture_url,
            habits_privacy
          ),
          habit:habits(id, title)
        `)
        .order('created_at', { ascending: false })
        .limit(pageSize);

      // If loading more, use cursor-based pagination
      if (isLoadMore && activities.length > 0) {
        const lastActivity = activities[activities.length - 1];
        query = query.lt('created_at', lastActivity.created_at);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        console.error('Error fetching activities:', fetchError);
        throw fetchError;
      }

      // Apply privacy filtering
      const filteredData = (data || []).map((activity) => {
        // If the user has private habits and this is a habit completion, hide habit details
        if (
          activity.user?.habits_privacy === 'private' &&
          activity.activity_type === 'habit_completion' &&
          activity.user_id !== userId
        ) {
          return {
            ...activity,
            habit: null,
            metadata: {
              ...activity.metadata,
              habit_title: null,
            },
          };
        }
        return activity;
      });

      // Update state
      if (isLoadMore) {
        setActivities((prev) => [...prev, ...filteredData]);
      } else {
        setActivities(filteredData);
      }

      // Check if there are more activities
      setHasMore(filteredData.length === pageSize);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch activities');
      setError(error);
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  }, [userId, pageSize, activities, supabase]);

  /**
   * Load more activities
   */
  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    await fetchActivities(true);
  }, [hasMore, loading, fetchActivities]);

  /**
   * Refetch from the beginning
   */
  const refetch = useCallback(async () => {
    setActivities([]);
    setHasMore(true);
    await fetchActivities(false);
  }, [fetchActivities]);

  /**
   * Auto-fetch on mount
   */
  useEffect(() => {
    if (autoFetch && userId) {
      fetchActivities(false);
    }
  }, [autoFetch, userId]); // Note: fetchActivities is intentionally excluded to prevent infinite loop

  return {
    activities,
    loading,
    error,
    hasMore,
    loadMore,
    refetch,
  };
}
