'use client';

import React, { useState, useMemo, useCallback, memo } from 'react';
import type { ActivityComment } from '@/types/activity.types';
import Avatar from './Avatar';
import Button from './Button';

export interface CommentCardProps {
  /**
   * The comment to display
   */
  comment: ActivityComment;

  /**
   * Current user ID (to show edit/delete buttons)
   */
  currentUserId?: string | null;

  /**
   * Callback when comment is updated
   */
  onUpdate?: (commentId: string, newText: string) => Promise<boolean>;

  /**
   * Callback when comment is deleted
   */
  onDelete?: (commentId: string) => Promise<boolean>;
}

/**
 * CommentCard component
 *
 * Displays a single comment with edit/delete options for owner
 * Optimized with React.memo to prevent unnecessary re-renders
 */
export const CommentCard = memo(function CommentCard({ comment, currentUserId, onUpdate, onDelete }: CommentCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.comment_text);
  const [loading, setLoading] = useState(false);

  const isOwner = currentUserId === comment.user_id;

  const handleSaveEdit = useCallback(async () => {
    if (!editText.trim() || !onUpdate) return;

    setLoading(true);
    const success = await onUpdate(comment.id, editText);
    setLoading(false);

    if (success) {
      setIsEditing(false);
    }
  }, [editText, onUpdate, comment.id]);

  const handleCancelEdit = useCallback(() => {
    setEditText(comment.comment_text);
    setIsEditing(false);
  }, [comment.comment_text]);

  const handleDelete = useCallback(async () => {
    if (!onDelete) return;

    const confirmed = window.confirm('Delete this comment?');
    if (!confirmed) return;

    setLoading(true);
    await onDelete(comment.id);
    setLoading(false);
  }, [onDelete, comment.id]);

  // Format timestamp (memoized)
  const formattedTimestamp = useMemo(() => {
    const date = new Date(comment.created_at);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  }, [comment.created_at]);

  return (
    <div className="flex gap-3 py-3">
      {/* Avatar */}
      <Avatar
        src={comment.user?.profile_picture_url}
        alt={comment.user?.username || 'User'}
        size="sm"
      />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-white text-sm">{comment.user?.username}</span>
          <span className="text-gray-500 text-xs">{formattedTimestamp}</span>
          {comment.updated_at !== comment.created_at && (
            <span className="text-gray-500 text-xs">(edited)</span>
          )}
        </div>

        {isEditing ? (
          <div>
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-green-600 focus:outline-none text-sm resize-none"
              rows={2}
              maxLength={500}
              disabled={loading}
            />
            <div className="flex gap-2 mt-2">
              <Button
                onClick={handleSaveEdit}
                type="primary"
                loading={loading}
                disabled={loading || !editText.trim()}
              >
                Save
              </Button>
              <Button
                onClick={handleCancelEdit}
                type="secondary"
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-gray-200 text-sm break-words">{comment.comment_text}</p>

            {isOwner && (
              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-xs text-gray-400 hover:text-green-400 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="text-xs text-gray-400 hover:text-red-400 transition-colors disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
});
