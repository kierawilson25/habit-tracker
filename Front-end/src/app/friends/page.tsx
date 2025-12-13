'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabaseAuth } from '@/hooks/auth/useSupabaseAuth';
import { useFriends } from '@/hooks/data/useFriends';
import {
  Container,
  H1,
  FriendCard,
  Button,
  Loading,
} from '@/components';

export default function FriendsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useSupabaseAuth({
    requireAuth: true,
    redirectTo: '/login',
  });

  const {
    friends,
    loading: friendsLoading,
    removeFriend,
  } = useFriends({ userId: user?.id });

  const [searchQuery, setSearchQuery] = useState('');

  const handleRemoveFriend = async (friendId: string) => {
    const success = await removeFriend(friendId);
    if (success) {
      // Friend removed successfully - state will update via refetch in the hook
    }
  };

  const handleViewProfile = (username: string) => {
    router.push(`/friends/${username}`);
  };

  if (authLoading || friendsLoading) {
    return <Loading />;
  }

  // Filter friends based on search query
  const filteredFriends = friends.filter((friendship) => {
    if (!searchQuery.trim()) return true;
    const friend = friendship.friend;
    return friend?.username.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex justify-center px-4 py-8">
        <div className="w-full max-w-2xl space-y-6">
          <Container>
            <H1 text="Friends" />
            <p className="text-gray-400 text-center mt-2">
              {friends.length} {friends.length === 1 ? 'friend' : 'friends'}
            </p>
          </Container>

          <Container>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search friends..."
                className="flex-1 px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-green-600 focus:outline-none"
              />
              <Button
                onClick={() => router.push('/friends/requests')}
                type="secondary"
              >
                Add Friends
              </Button>
            </div>

            {filteredFriends.length === 0 ? (
              <div className="text-center py-12">
                {searchQuery.trim() ? (
                  <>
                    <p className="text-gray-400 mb-4">
                      No friends found matching "{searchQuery}"
                    </p>
                    <Button
                      onClick={() => setSearchQuery('')}
                      type="secondary"
                    >
                      Clear Search
                    </Button>
                  </>
                ) : friends.length === 0 ? (
                  <>
                    <p className="text-gray-400 mb-4">
                      You don't have any friends yet
                    </p>
                    <Button
                      onClick={() => router.push('/friends/requests')}
                      type="primary"
                    >
                      Find Friends
                    </Button>
                  </>
                ) : null}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredFriends.map((friendship) => (
                  <FriendCard
                    key={friendship.id}
                    friendship={friendship}
                    onRemove={handleRemoveFriend}
                    onViewProfile={handleViewProfile}
                  />
                ))}
              </div>
            )}
          </Container>
        </div>
      </div>
    </div>
  );
}
