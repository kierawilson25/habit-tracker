import React from 'react';
import Avatar from './Avatar';
import Button from './Button';
import type { UserSearchResult as UserSearchResultType } from '@/types/friend.types';

interface UserSearchResultProps {
  user: UserSearchResultType;
  onAddFriend?: (userId: string) => void;
}

const UserSearchResult: React.FC<UserSearchResultProps> = ({
  user,
  onAddFriend,
}) => {
  const getButtonText = () => {
    switch (user.friendship_status) {
      case 'friends':
        return 'Friends';
      case 'request_sent':
        return 'Request Sent';
      case 'request_received':
        return 'Request Received';
      default:
        return 'Add Friend';
    }
  };

  const isDisabled = user.friendship_status !== 'none';

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 flex items-center gap-4">
      <Avatar
        src={user.profile_picture_url}
        alt={user.username}
        size="md"
      />

      <div className="flex-1">
        <p className="text-white font-medium">@{user.username}</p>
      </div>

      {onAddFriend && (
        <Button
          onClick={() => onAddFriend(user.id)}
          type={isDisabled ? 'secondary' : 'primary'}
          variant={isDisabled ? 'outline' : 'solid'}
          disabled={isDisabled}
        >
          {getButtonText()}
        </Button>
      )}
    </div>
  );
};

export default UserSearchResult;
