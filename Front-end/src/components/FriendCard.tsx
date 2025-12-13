'use client';

import React from 'react';
import { Avatar, Button } from '@/components';
import type { Friendship } from '@/types/friend.types';

interface FriendCardProps {
  friendship: Friendship;
  onRemove: (friendId: string) => void;
  onViewProfile?: (username: string) => void;
}

const FriendCard: React.FC<FriendCardProps> = ({
  friendship,
  onRemove,
  onViewProfile,
}) => {
  const friend = friendship.friend;

  if (!friend) {
    return null;
  }

  const handleRemove = () => {
    if (window.confirm(`Remove ${friend.username} from your friends?`)) {
      onRemove(friendship.friend_id);
    }
  };

  const handleViewProfile = () => {
    if (onViewProfile) {
      onViewProfile(friend.username);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <Avatar
          src={friend.profile_picture_url}
          alt={friend.username}
          size="md"
        />

        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold truncate">
            {friend.username}
          </h3>
          {friend.bio && (
            <p className="text-gray-400 text-sm truncate">
              {friend.bio}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 sm:flex-shrink-0">
        {onViewProfile && (
          <Button
            onClick={handleViewProfile}
            type="secondary"
          >
            View Profile
          </Button>
        )}

        <Button
          onClick={handleRemove}
          type="danger"
        >
          Remove
        </Button>
      </div>
    </div>
  );
};

export default FriendCard;
