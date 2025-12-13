'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import type { ActivityComment } from '@/types/activity.types';

export interface UseActivityCommentsOptions {
  /**
   * Activity ID to manage comments for
   */
  activityId: string;

  /**
   * Number of comments to fetch
   * @default 10
   */
  limit?: number;

  /**
   * Whether to automatically fetch comments on mount
   * @default true
   */
  autoFetch?: boolean;
}

export interface UseActivityCommentsReturn {
  /**
   * List of comments
   */
  comments: ActivityComment[];

  /**
   * Whether currently loading
   */
  loading: boolean;

  /**
   * Error that occurred
   */
  error: Error | null;

  /**
   * Add a new comment
   */
  addComment: (text: string) => Promise<boolean>;

  /**
   * Update an existing comment
   */
  updateComment: (commentId: string, text: string) => Promise<boolean>;

  /**
   * Delete a comment
   */
  deleteComment: (commentId: string) => Promise<boolean>;

  /**
   * Refetch comments
   */
  refetch: () => Promise<void>;
}

/**
 * Hook for managing comments on activities
 *
 * Handles CRUD operations for comments with user data
 */
export function useActivityComments(options: UseActivityCommentsOptions): UseActivityCommentsReturn {
  const { activityId, limit = 10, autoFetch = true } = options;

  const [comments, setComments] = useState<ActivityComment[]>([]);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState<Error | null>(null);

  const supabase = createClient();

  /**
   * Fetch comments with user data
   */
  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('activity_comments')
        .select(`
          *,
          user:user_profiles(
            id,
            username,
            profile_picture_url
          )
        `)
        .eq('activity_id', activityId)
        .order('created_at', { ascending: true })
        .limit(limit);

      if (fetchError) throw fetchError;

      setComments(data || []);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch comments');
      setError(error);
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  }, [activityId, limit, supabase]);

  /**
   * Add a new comment
   */
  const addComment = useCallback(async (text: string): Promise<boolean> => {
    if (!text.trim()) {
      setError(new Error('Comment cannot be empty'));
      return false;
    }

    if (text.length > 500) {
      setError(new Error('Comment must be 500 characters or less'));
      return false;
    }

    try {
      setError(null);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Must be logged in to comment');
      }

      const { error: insertError } = await supabase
        .from('activity_comments')
        .insert({
          activity_id: activityId,
          user_id: user.id,
          comment_text: text.trim(),
        });

      if (insertError) throw insertError;

      // Refetch to get the new comment with user data
      await fetchComments();
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to add comment');
      setError(error);
      console.error('Error adding comment:', error);
      return false;
    }
  }, [activityId, supabase, fetchComments]);

  /**
   * Update an existing comment
   */
  const updateComment = useCallback(async (commentId: string, text: string): Promise<boolean> => {
    if (!text.trim()) {
      setError(new Error('Comment cannot be empty'));
      return false;
    }

    if (text.length > 500) {
      setError(new Error('Comment must be 500 characters or less'));
      return false;
    }

    try {
      setError(null);

      const { error: updateError } = await supabase
        .from('activity_comments')
        .update({
          comment_text: text.trim(),
        })
        .eq('id', commentId);

      if (updateError) throw updateError;

      // Update local state
      setComments((prev) =>
        prev.map((comment) =>
          comment.id === commentId
            ? { ...comment, comment_text: text.trim(), updated_at: new Date().toISOString() }
            : comment
        )
      );

      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update comment');
      setError(error);
      console.error('Error updating comment:', error);
      return false;
    }
  }, [supabase]);

  /**
   * Delete a comment
   */
  const deleteComment = useCallback(async (commentId: string): Promise<boolean> => {
    try {
      setError(null);

      const { error: deleteError } = await supabase
        .from('activity_comments')
        .delete()
        .eq('id', commentId);

      if (deleteError) throw deleteError;

      // Update local state
      setComments((prev) => prev.filter((comment) => comment.id !== commentId));

      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete comment');
      setError(error);
      console.error('Error deleting comment:', error);
      return false;
    }
  }, [supabase]);

  /**
   * Auto-fetch on mount
   */
  useEffect(() => {
    if (autoFetch) {
      fetchComments();
    }
  }, [autoFetch, fetchComments]);

  return {
    comments,
    loading,
    error,
    addComment,
    updateComment,
    deleteComment,
    refetch: fetchComments,
  };
}
