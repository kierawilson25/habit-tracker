import React from 'react';
import { Avatar, Button } from '@/components';
import type { FriendRequest } from '@/types/friend.types';

interface FriendRequestCardProps {
  request: FriendRequest;
  type: 'sent' | 'received';
  onAccept?: (requestId: string) => void;
  onReject?: (requestId: string) => void;
  onCancel?: (requestId: string) => void;
}

const FriendRequestCard: React.FC<FriendRequestCardProps> = ({
  request,
  type,
  onAccept,
  onReject,
  onCancel,
}) => {
  const user = type === 'sent' ? request.receiver : request.sender;

  if (!user) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 flex items-center gap-4">
      <Avatar
        src={user.profile_picture_url}
        alt={user.username}
        size="md"
      />

      <div className="flex-1">
        <p className="text-white font-medium">@{user.username}</p>
        <p className="text-sm text-gray-400">{formatDate(request.created_at)}</p>
      </div>

      <div className="flex gap-2">
        {type === 'received' && (
          <>
            {onAccept && (
              <Button
                onClick={() => onAccept(request.id)}
                type="primary"
              >
                Accept
              </Button>
            )}
            {onReject && (
              <Button
                onClick={() => onReject(request.id)}
                type="danger"
                variant="outline"
              >
                Reject
              </Button>
            )}
          </>
        )}

        {type === 'sent' && onCancel && (
          <Button
            onClick={() => onCancel(request.id)}
            type="secondary"
            variant="outline"
          >
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
};

export default FriendRequestCard;
