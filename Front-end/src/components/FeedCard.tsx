import React, { useState, useMemo, useCallback, memo } from 'react';
import type { FeedActivity } from '@/types/activity.types';
import Avatar from './Avatar';
import { ActivityIcon } from './ActivityIcon';
import { LikeButton } from './LikeButton';
import { CommentSection } from './CommentSection';
import {
  getHabitCompletionFeedMessage,
  getGoldStarDayFeedMessage,
  getStreakMilestoneFeedMessage,
  getNewLongestStreakFeedMessage
} from '@/utils/feedMessages';

export interface FeedCardProps {
  /**
   * The activity to display
   */
  activity: FeedActivity;

  /**
   * Current user ID (for likes and comments)
   */
  userId?: string | null;
}

/**
 * FeedCard component
 *
 * Displays a single feed activity with dynamic content based on activity type
 * Optimized with React.memo to prevent unnecessary re-renders
 */
export const FeedCard = memo(function FeedCard({ activity, userId }: FeedCardProps) {
  const { activity_type, user, habit, metadata, created_at } = activity;
  const [showComments, setShowComments] = useState(false);

  // Format timestamp (memoized)
  const formattedTimestamp = useMemo(() => {
    const date = new Date(created_at);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  }, [created_at]);

  // Get activity message based on type (memoized)
  const activityMessage = useMemo(() => {
    // Check if habits are private - if so, don't show habit titles
    const isPrivate = user?.habits_privacy === 'private';

    switch (activity_type) {
      case 'habit_completion':
        const habitCompletionMsg = getHabitCompletionFeedMessage(
          isPrivate ? undefined : (habit?.title || undefined)
        );
        return habitCompletionMsg.message;

      case 'gold_star_day':
        const totalHabits = metadata?.total_habits || 5;
        const goldStarMsg = getGoldStarDayFeedMessage(totalHabits);
        return goldStarMsg.message;

      case 'streak_milestone':
        const milestoneCount = metadata?.streak_count || 0;
        const habitTitle = isPrivate ? undefined : (habit?.title || metadata?.habit_title || undefined);
        const milestoneMsg = getStreakMilestoneFeedMessage(milestoneCount, habitTitle);
        return milestoneMsg.message;

      case 'new_longest_streak':
        const newStreakCount = metadata?.streak_count || 0;
        const prevLongest = metadata?.previous_longest || 0;
        const longestHabitTitle = isPrivate ? undefined : (habit?.title || metadata?.habit_title || undefined);
        const longestStreakMsg = getNewLongestStreakFeedMessage(newStreakCount, prevLongest, longestHabitTitle);
        return longestStreakMsg.message;

      default:
        return 'did something (mysterious energy ✨)';
    }
  }, [activity_type, habit, metadata, user]);

  // Toggle comments handler (memoized)
  const toggleComments = useCallback(() => {
    setShowComments(prev => !prev);
  }, []);

  return (
    <div className="flex gap-4 p-4 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors">
      {/* Activity Icon */}
      <div className="flex-shrink-0">
        <ActivityIcon type={activity_type} size="md" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Header with avatar and username */}
        <div className="flex items-center gap-2 mb-2">
          <Avatar
            src={user?.profile_picture_url}
            alt={user?.username || 'User'}
            size="sm"
          />
          <span className="font-semibold text-white">{user?.username}</span>
          <span className="text-gray-500">•</span>
          <span className="text-gray-400 text-sm">{formattedTimestamp}</span>
        </div>

        {/* Activity message */}
        <p className="text-gray-200">{activityMessage}</p>

        {/* Likes and Comments */}
        <div className="flex items-center gap-4 mt-3">
          <LikeButton activityId={activity.id} userId={userId} />
          <button
            onClick={toggleComments}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
          >
            <span className="text-lg">💬</span>
            <span className="text-sm font-medium">
              {showComments ? 'Hide' : 'Comment'}
            </span>
          </button>
        </div>

        {/* Comment Section */}
        {showComments && (
          <CommentSection activityId={activity.id} userId={userId} />
        )}
      </div>
    </div>
  );
});
