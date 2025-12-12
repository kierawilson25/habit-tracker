'use client';

import { useState } from 'react';
import { useSupabaseAuth } from '@/hooks/auth/useSupabaseAuth';
import { useFriendRequests } from '@/hooks/data/useFriendRequests';
import { useFriends } from '@/hooks/data/useFriends';
import {
  Container,
  H1,
  FriendRequestCard,
  UserSearchBar,
  UserSearchResult,
  Loading,
} from '@/components';
import type { UserSearchResult as UserSearchResultType } from '@/types/friend.types';

export default function FriendRequestsPage() {
  const { user, loading: authLoading } = useSupabaseAuth({
    requireAuth: true,
    redirectTo: '/login',
  });

  const {
    sentRequests,
    receivedRequests,
    loading: requestsLoading,
    sendRequest,
    acceptRequest,
    rejectRequest,
    cancelRequest,
  } = useFriendRequests(user?.id);

  const { searchUsers } = useFriends({ userId: user?.id });

  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [searchResults, setSearchResults] = useState<UserSearchResultType[]>([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    const results = await searchUsers(query);
    setSearchResults(results);
    setSearching(false);
  };

  const handleAddFriend = async (userId: string) => {
    const success = await sendRequest(userId);
    if (success) {
      // Update search results to reflect new status
      setSearchResults((prev) =>
        prev.map((user) =>
          user.id === userId
            ? { ...user, friendship_status: 'request_sent' }
            : user
        )
      );
    }
  };

  const handleAccept = async (requestId: string) => {
    await acceptRequest(requestId);
  };

  const handleReject = async (requestId: string) => {
    await rejectRequest(requestId);
  };

  const handleCancel = async (requestId: string) => {
    await cancelRequest(requestId);
  };

  if (authLoading || requestsLoading) {
    return <Loading />;
  }

  return (
    <Container>
      <H1 text="Friend Requests" />

      <div className="mt-6">
        <h2 className="text-lg font-semibold text-white mb-3">Search for Friends</h2>
        <UserSearchBar onSearch={handleSearch} />

        {searching && (
          <div className="mt-4 text-gray-400 text-center">Searching...</div>
        )}

        {searchResults.length > 0 && (
          <div className="mt-4 space-y-2">
            {searchResults.map((user) => (
              <UserSearchResult
                key={user.id}
                user={user}
                onAddFriend={handleAddFriend}
              />
            ))}
          </div>
        )}

        {!searching && searchResults.length === 0 && (
          <p className="text-gray-400 text-center mt-4 text-sm">
            Search for users by username to send friend requests
          </p>
        )}
      </div>

      <div className="mt-8">
        <div className="flex border-b border-gray-700 mb-6">
          <button
            onClick={() => setActiveTab('received')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'received'
                ? 'text-green-400 border-b-2 border-green-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Received ({receivedRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'sent'
                ? 'text-green-400 border-b-2 border-green-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Sent ({sentRequests.length})
          </button>
        </div>

        {activeTab === 'received' && (
          <div className="space-y-3">
            {receivedRequests.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400">No pending friend requests</p>
              </div>
            ) : (
              receivedRequests.map((request) => (
                <FriendRequestCard
                  key={request.id}
                  request={request}
                  type="received"
                  onAccept={handleAccept}
                  onReject={handleReject}
                />
              ))
            )}
          </div>
        )}

        {activeTab === 'sent' && (
          <div className="space-y-3">
            {sentRequests.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400">No pending sent requests</p>
              </div>
            ) : (
              sentRequests.map((request) => (
                <FriendRequestCard
                  key={request.id}
                  request={request}
                  type="sent"
                  onCancel={handleCancel}
                />
              ))
            )}
          </div>
        )}
      </div>
    </Container>
  );
}
