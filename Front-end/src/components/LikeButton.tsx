'use client';

import React from 'react';
import { useActivityLikes } from '@/hooks/data/useActivityLikes';

export interface LikeButtonProps {
  /**
   * Activity ID to like
   */
  activityId: string;

  /**
   * Current user ID
   */
  userId?: string | null;
}

/**
 * LikeButton component
 *
 * Shows like count and allows toggling like status with optimistic updates
 */
export function LikeButton({ activityId, userId }: LikeButtonProps) {
  const { likeCount, isLiked, loading, toggleLike } = useActivityLikes({
    activityId,
    userId,
    autoFetch: true,
  });

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    if (!loading) {
      toggleLike();
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading || !userId}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors ${
        isLiked
          ? 'bg-red-600 text-white hover:bg-red-700'
          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      <span className="text-lg">{isLiked ? '❤️' : '🤍'}</span>
      <span className="text-sm font-medium">{likeCount}</span>
    </button>
  );
}
