'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import type { Friendship, UserSearchResult, FriendshipStatus } from '@/types/friend.types';
import type { UserProfile } from '@/types/profile.types';

/**
 * Options for configuring the useFriends hook
 */
export interface UseFriendsOptions {
  /**
   * User ID to fetch friends for
   */
  userId?: string | null;

  /**
   * Whether to automatically fetch friends on mount
   * @default true
   */
  autoFetch?: boolean;
}

/**
 * Return type for the useFriends hook
 */
export interface UseFriendsReturn {
  /**
   * List of friends
   */
  friends: Friendship[];

  /**
   * Whether friends are currently loading
   */
  loading: boolean;

  /**
   * Error that occurred during fetch or operations
   */
  error: Error | null;

  /**
   * Manually refetch friends
   */
  refetch: () => Promise<void>;

  /**
   * Remove a friend
   * @param friendId - ID of the friend to remove
   */
  removeFriend: (friendId: string) => Promise<boolean>;

  /**
   * Search for users by username
   * @param query - Search query
   */
  searchUsers: (query: string) => Promise<UserSearchResult[]>;

  /**
   * Get friendship status with a user
   * @param targetUserId - ID of the user to check
   */
  getFriendshipStatus: (targetUserId: string) => Promise<FriendshipStatus>;
}

/**
 * Hook for managing friends
 *
 * Provides operations for fetching friends, removing friends, and searching users.
 *
 * @param options - Configuration options
 * @returns Friend data, loading state, and operations
 */
export function useFriends(options: UseFriendsOptions = {}): UseFriendsReturn {
  const { userId, autoFetch = true } = options;

  const [friends, setFriends] = useState<Friendship[]>([]);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState<Error | null>(null);

  const supabase = createClient();

  /**
   * Fetch friends
   */
  const fetchFriends = useCallback(async () => {
    if (!userId) {
      setFriends([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('friendships')
        .select(`
          *,
          friend:user_profiles!friendships_friend_id_fkey(id, username, profile_picture_url, bio)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setFriends(data || []);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch friends');
      setError(error);
      console.error('Error fetching friends:', error);
    } finally {
      setLoading(false);
    }
  }, [userId, supabase]);

  /**
   * Remove a friend
   */
  const removeFriend = useCallback(async (friendId: string): Promise<boolean> => {
    if (!userId) {
      setError(new Error('User ID is required to remove friend'));
      return false;
    }

    try {
      setError(null);

      // Delete both friendship records (bidirectional)
      const { error: deleteError1 } = await supabase
        .from('friendships')
        .delete()
        .eq('user_id', userId)
        .eq('friend_id', friendId);

      if (deleteError1) throw deleteError1;

      const { error: deleteError2 } = await supabase
        .from('friendships')
        .delete()
        .eq('user_id', friendId)
        .eq('friend_id', userId);

      if (deleteError2) throw deleteError2;

      // Update local state
      setFriends((prev) => prev.filter((f) => f.friend_id !== friendId));

      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to remove friend');
      setError(error);
      console.error('Error removing friend:', error);
      return false;
    }
  }, [userId, supabase]);

  /**
   * Search for users by username
   */
  const searchUsers = useCallback(async (query: string): Promise<UserSearchResult[]> => {
    if (!query.trim() || !userId) {
      return [];
    }

    try {
      // Search for users matching the query
      const { data: users, error: searchError } = await supabase
        .from('user_profiles')
        .select('id, username, profile_picture_url')
        .ilike('username', `%${query.trim()}%`)
        .neq('id', userId)
        .limit(10);

      if (searchError) throw searchError;

      if (!users || users.length === 0) {
        return [];
      }

      // Get friendship status for each user
      const userIds = users.map((u) => u.id);

      // Check friendships
      const { data: friendships, error: friendshipError } = await supabase
        .from('friendships')
        .select('friend_id')
        .eq('user_id', userId)
        .in('friend_id', userIds);

      if (friendshipError) throw friendshipError;

      const friendIds = new Set(friendships?.map((f) => f.friend_id) || []);

      // Check pending requests (sent and received)
      const { data: sentRequests, error: sentError } = await supabase
        .from('friend_requests')
        .select('receiver_id')
        .eq('sender_id', userId)
        .eq('status', 'pending')
        .in('receiver_id', userIds);

      if (sentError) throw sentError;

      const sentRequestIds = new Set(sentRequests?.map((r) => r.receiver_id) || []);

      const { data: receivedRequests, error: receivedError } = await supabase
        .from('friend_requests')
        .select('sender_id')
        .eq('receiver_id', userId)
        .eq('status', 'pending')
        .in('sender_id', userIds);

      if (receivedError) throw receivedError;

      const receivedRequestIds = new Set(receivedRequests?.map((r) => r.sender_id) || []);

      // Map users to search results with friendship status
      const results: UserSearchResult[] = users.map((user) => {
        let friendshipStatus: FriendshipStatus = 'none';

        if (friendIds.has(user.id)) {
          friendshipStatus = 'friends';
        } else if (sentRequestIds.has(user.id)) {
          friendshipStatus = 'request_sent';
        } else if (receivedRequestIds.has(user.id)) {
          friendshipStatus = 'request_received';
        }

        return {
          id: user.id,
          username: user.username,
          profile_picture_url: user.profile_picture_url,
          friendship_status: friendshipStatus,
        };
      });

      return results;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to search users');
      console.error('Error searching users:', error);
      return [];
    }
  }, [userId, supabase]);

  /**
   * Get friendship status with a specific user
   */
  const getFriendshipStatus = useCallback(async (targetUserId: string): Promise<FriendshipStatus> => {
    if (!userId) {
      return 'none';
    }

    try {
      // Check if friends
      const { data: friendship, error: friendshipError } = await supabase
        .from('friendships')
        .select('id')
        .eq('user_id', userId)
        .eq('friend_id', targetUserId)
        .maybeSingle();

      if (friendshipError) throw friendshipError;

      if (friendship) {
        return 'friends';
      }

      // Check if request sent
      const { data: sentRequest, error: sentError } = await supabase
        .from('friend_requests')
        .select('id')
        .eq('sender_id', userId)
        .eq('receiver_id', targetUserId)
        .eq('status', 'pending')
        .maybeSingle();

      if (sentError) throw sentError;

      if (sentRequest) {
        return 'request_sent';
      }

      // Check if request received
      const { data: receivedRequest, error: receivedError } = await supabase
        .from('friend_requests')
        .select('id')
        .eq('sender_id', targetUserId)
        .eq('receiver_id', userId)
        .eq('status', 'pending')
        .maybeSingle();

      if (receivedError) throw receivedError;

      if (receivedRequest) {
        return 'request_received';
      }

      return 'none';
    } catch (err) {
      console.error('Error getting friendship status:', err);
      return 'none';
    }
  }, [userId, supabase]);

  /**
   * Auto-fetch friends on mount
   */
  useEffect(() => {
    if (autoFetch && userId) {
      fetchFriends();
    }
  }, [autoFetch, userId, fetchFriends]);

  return {
    friends,
    loading,
    error,
    refetch: fetchFriends,
    removeFriend,
    searchUsers,
    getFriendshipStatus,
  };
}
