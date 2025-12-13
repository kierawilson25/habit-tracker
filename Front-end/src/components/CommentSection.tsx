'use client';

import React, { useState } from 'react';
import { useActivityComments } from '@/hooks/data/useActivityComments';
import { CommentCard } from './CommentCard';
import { CommentInput } from './CommentInput';

export interface CommentSectionProps {
  /**
   * Activity ID to show comments for
   */
  activityId: string;

  /**
   * Current user ID
   */
  userId?: string | null;

  /**
   * Initial number of comments to show
   * @default 3
   */
  initialLimit?: number;
}

/**
 * CommentSection component
 *
 * Displays comments with add/edit/delete functionality
 */
export function CommentSection({ activityId, userId, initialLimit = 3 }: CommentSectionProps) {
  const [showAll, setShowAll] = useState(false);

  const {
    comments,
    loading,
    error,
    addComment,
    updateComment,
    deleteComment,
  } = useActivityComments({
    activityId,
    limit: 50, // Fetch more, but we'll limit display
    autoFetch: true,
  });

  const displayedComments = showAll ? comments : comments.slice(0, initialLimit);
  const hasMore = comments.length > initialLimit;

  if (error) {
    return (
      <div className="text-red-400 text-sm mt-3">
        Failed to load comments: {error.message}
      </div>
    );
  }

  return (
    <div className="mt-3 pt-3 border-t border-gray-700">
      {/* Comments list */}
      {loading && comments.length === 0 ? (
        <p className="text-gray-500 text-sm">Loading comments...</p>
      ) : comments.length === 0 ? (
        <p className="text-gray-500 text-sm">No comments yet. Be the first!</p>
      ) : (
        <>
          {displayedComments.map((comment) => (
            <CommentCard
              key={comment.id}
              comment={comment}
              currentUserId={userId}
              onUpdate={updateComment}
              onDelete={deleteComment}
            />
          ))}

          {hasMore && !showAll && (
            <button
              onClick={() => setShowAll(true)}
              className="text-sm text-green-400 hover:text-green-300 transition-colors mt-2"
            >
              View all {comments.length} comments
            </button>
          )}

          {showAll && hasMore && (
            <button
              onClick={() => setShowAll(false)}
              className="text-sm text-gray-400 hover:text-gray-300 transition-colors mt-2"
            >
              Show less
            </button>
          )}
        </>
      )}

      {/* Add comment input */}
      {userId && (
        <CommentInput onSubmit={addComment} />
      )}
    </div>
  );
}
