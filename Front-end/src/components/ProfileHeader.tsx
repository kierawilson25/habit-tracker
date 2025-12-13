import React from 'react';
import { Avatar, Button } from '@/components';

interface ProfileHeaderProps {
  username: string;
  bio?: string | null;
  profilePictureUrl?: string | null;
  isOwner?: boolean;
  isFriend?: boolean;
  onEditProfile?: () => void;
  onAddFriend?: () => void;
  onRemoveFriend?: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  username,
  bio,
  profilePictureUrl,
  isOwner = false,
  isFriend = false,
  onEditProfile,
  onAddFriend,
  onRemoveFriend,
}) => {
  return (
    <div className="flex flex-col items-center gap-4 py-6">
      <Avatar src={profilePictureUrl} alt={username} size="xl" />

      <div className="text-center">
        <h1 className="text-2xl font-bold text-white">@{username}</h1>
        {bio && (
          <p className="text-gray-400 mt-2 max-w-md">{bio}</p>
        )}
      </div>

      <div className="flex gap-2">
        {isOwner && onEditProfile && (
          <Button onClick={onEditProfile} type="primary">
            Edit Profile
          </Button>
        )}

        {!isOwner && !isFriend && onAddFriend && (
          <Button onClick={onAddFriend} type="primary">
            Add Friend
          </Button>
        )}

        {!isOwner && isFriend && onRemoveFriend && (
          <Button onClick={onRemoveFriend} type="danger" variant="outline">
            Remove Friend
          </Button>
        )}
      </div>
    </div>
  );
};

export default ProfileHeader;
