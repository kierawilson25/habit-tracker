'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';

export interface UseActivityLikesOptions {
  /**
   * Activity ID to manage likes for
   */
  activityId: string;

  /**
   * Current user ID
   */
  userId?: string | null;

  /**
   * Whether to automatically fetch likes on mount
   * @default true
   */
  autoFetch?: boolean;
}

export interface UseActivityLikesReturn {
  /**
   * Total number of likes
   */
  likeCount: number;

  /**
   * Whether the current user has liked this activity
   */
  isLiked: boolean;

  /**
   * Whether currently loading
   */
  loading: boolean;

  /**
   * Error that occurred
   */
  error: Error | null;

  /**
   * Toggle like (add if not liked, remove if liked)
   */
  toggleLike: () => Promise<void>;
}

/**
 * Hook for managing likes on activities
 *
 * Handles like/unlike with optimistic updates
 */
export function useActivityLikes(options: UseActivityLikesOptions): UseActivityLikesReturn {
  const { activityId, userId, autoFetch = true } = options;

  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const supabase = createClient();

  /**
   * Fetch like count and user's like status
   */
  const fetchLikes = useCallback(async () => {
    try {
      setError(null);

      // Get total like count
      const { count, error: countError } = await supabase
        .from('activity_likes')
        .select('*', { count: 'exact', head: true })
        .eq('activity_id', activityId);

      if (countError) throw countError;

      setLikeCount(count || 0);

      // Check if user has liked
      if (userId) {
        const { data, error: likeError } = await supabase
          .from('activity_likes')
          .select('id')
          .eq('activity_id', activityId)
          .eq('user_id', userId)
          .maybeSingle();

        if (likeError) throw likeError;

        setIsLiked(!!data);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch likes');
      setError(error);
      console.error('Error fetching likes:', error);
    }
  }, [activityId, userId, supabase]);

  /**
   * Toggle like (optimistic update)
   */
  const toggleLike = useCallback(async () => {
    console.log('❤️ LIKE BUTTON CLICKED', {
      activityId,
      userId,
      currentlyLiked: isLiked
    });

    if (!userId) {
      console.error('❌ No userId - user must log in');
      setError(new Error('Must be logged in to like'));
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Optimistic update
      const wasLiked = isLiked;
      console.log(`⚡ Optimistic update: ${wasLiked ? 'UNLIKING' : 'LIKING'}`);
      setIsLiked(!wasLiked);
      setLikeCount((prev) => (wasLiked ? prev - 1 : prev + 1));

      if (wasLiked) {
        // Unlike
        console.log('🗑️  UNLIKE: Deleting from activity_likes', {
          activity_id: activityId,
          user_id: userId
        });

        const { data, error: deleteError } = await supabase
          .from('activity_likes')
          .delete()
          .eq('activity_id', activityId)
          .eq('user_id', userId)
          .select();

        console.log('🗑️  UNLIKE RESPONSE:', { data, error: deleteError });

        if (deleteError) throw deleteError;
      } else {
        // Like
        console.log('➕ LIKE: Inserting into activity_likes', {
          activity_id: activityId,
          user_id: userId
        });

        const { data, error: insertError } = await supabase
          .from('activity_likes')
          .insert({
            activity_id: activityId,
            user_id: userId,
          })
          .select();

        console.log('➕ LIKE RESPONSE:', { data, error: insertError });

        if (insertError) throw insertError;

        console.log('✅ LIKE SUCCESS - Trigger should have fired on database');
      }
    } catch (err) {
      // Revert optimistic update on error
      console.error('❌ LIKE FAILED - Reverting optimistic update', err);
      setIsLiked(!isLiked);
      setLikeCount((prev) => (isLiked ? prev + 1 : prev - 1));

      const error = err instanceof Error ? err : new Error('Failed to toggle like');
      setError(error);
      console.error('Error toggling like:', error);
    } finally {
      setLoading(false);
      console.log('✅ toggleLike completed');
    }
  }, [activityId, userId, isLiked, supabase]);

  /**
   * Auto-fetch on mount
   */
  useEffect(() => {
    if (autoFetch) {
      fetchLikes();
    }
  }, [autoFetch, fetchLikes]);

  return {
    likeCount,
    isLiked,
    loading,
    error,
    toggleLike,
  };
}
