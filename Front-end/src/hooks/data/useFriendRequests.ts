'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import type { FriendRequest } from '@/types/friend.types';

/**
 * Return type for the useFriendRequests hook
 */
export interface UseFriendRequestsReturn {
  /**
   * Friend requests sent by the current user
   */
  sentRequests: FriendRequest[];

  /**
   * Friend requests received by the current user
   */
  receivedRequests: FriendRequest[];

  /**
   * Whether requests are currently loading
   */
  loading: boolean;

  /**
   * Error that occurred during fetch or operations
   */
  error: Error | null;

  /**
   * Send a friend request to another user
   * @param receiverId - ID of the user to send request to
   */
  sendRequest: (receiverId: string) => Promise<boolean>;

  /**
   * Accept a friend request
   * @param requestId - ID of the request to accept
   */
  acceptRequest: (requestId: string) => Promise<boolean>;

  /**
   * Reject a friend request
   * @param requestId - ID of the request to reject
   */
  rejectRequest: (requestId: string) => Promise<boolean>;

  /**
   * Cancel a sent friend request
   * @param requestId - ID of the request to cancel
   */
  cancelRequest: (requestId: string) => Promise<boolean>;

  /**
   * Manually refetch friend requests
   */
  refetch: () => Promise<void>;
}

/**
 * Hook for managing friend requests
 *
 * Provides operations for sending, accepting, rejecting, and canceling friend requests.
 *
 * @param userId - The current user's ID
 * @returns Friend request data, loading state, and operations
 */
export function useFriendRequests(userId?: string | null): UseFriendRequestsReturn {
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const supabase = createClient();

  /**
   * Fetch friend requests
   */
  const fetchRequests = useCallback(async () => {
    if (!userId) {
      setSentRequests([]);
      setReceivedRequests([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch sent requests
      const { data: sent, error: sentError } = await supabase
        .from('friend_requests')
        .select(`
          *,
          receiver:user_profiles!receiver_id(id, username, profile_picture_url)
        `)
        .eq('sender_id', userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (sentError) {
        console.error('Error fetching sent requests:', sentError);
        throw sentError;
      }

      // Fetch received requests
      const { data: received, error: receivedError } = await supabase
        .from('friend_requests')
        .select(`
          *,
          sender:user_profiles!sender_id(id, username, profile_picture_url)
        `)
        .eq('receiver_id', userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (receivedError) {
        console.error('Error fetching received requests:', receivedError);
        throw receivedError;
      }

      setSentRequests(sent || []);
      setReceivedRequests(received || []);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch friend requests');
      setError(error);
      console.error('Error fetching friend requests:', error);
    } finally {
      setLoading(false);
    }
  }, [userId, supabase]);

  /**
   * Send a friend request
   */
  const sendRequest = useCallback(async (receiverId: string): Promise<boolean> => {
    if (!userId) {
      setError(new Error('User ID is required to send friend request'));
      return false;
    }

    try {
      setError(null);

      const { error: insertError } = await supabase
        .from('friend_requests')
        .insert({
          sender_id: userId,
          receiver_id: receiverId,
          status: 'pending',
        });

      if (insertError) throw insertError;

      // Refetch to update state
      await fetchRequests();

      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to send friend request');
      setError(error);
      console.error('Error sending friend request:', error);
      return false;
    }
  }, [userId, supabase, fetchRequests]);

  /**
   * Accept a friend request
   */
  const acceptRequest = useCallback(async (requestId: string): Promise<boolean> => {
    try {
      setError(null);

      // Call the database function to create friendship
      const { error: acceptError } = await supabase.rpc(
        'create_friendship_from_request',
        { request_id: requestId }
      );

      if (acceptError) throw acceptError;

      // Refetch to update state
      await fetchRequests();

      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to accept friend request');
      setError(error);
      console.error('Error accepting friend request:', error);
      return false;
    }
  }, [supabase, fetchRequests]);

  /**
   * Reject a friend request
   */
  const rejectRequest = useCallback(async (requestId: string): Promise<boolean> => {
    try {
      setError(null);

      const { error: updateError } = await supabase
        .from('friend_requests')
        .update({ status: 'rejected', updated_at: new Date().toISOString() })
        .eq('id', requestId);

      if (updateError) throw updateError;

      // Remove from state
      setReceivedRequests((prev) => prev.filter((req) => req.id !== requestId));

      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to reject friend request');
      setError(error);
      console.error('Error rejecting friend request:', error);
      return false;
    }
  }, [supabase]);

  /**
   * Cancel a sent friend request
   */
  const cancelRequest = useCallback(async (requestId: string): Promise<boolean> => {
    try {
      setError(null);

      const { error: deleteError } = await supabase
        .from('friend_requests')
        .delete()
        .eq('id', requestId);

      if (deleteError) throw deleteError;

      // Remove from state
      setSentRequests((prev) => prev.filter((req) => req.id !== requestId));

      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to cancel friend request');
      setError(error);
      console.error('Error canceling friend request:', error);
      return false;
    }
  }, [supabase]);

  /**
   * Auto-fetch requests on mount
   */
  useEffect(() => {
    if (userId) {
      fetchRequests();
    }
  }, [userId, fetchRequests]);

  return {
    sentRequests,
    receivedRequests,
    loading,
    error,
    sendRequest,
    acceptRequest,
    rejectRequest,
    cancelRequest,
    refetch: fetchRequests,
  };
}
