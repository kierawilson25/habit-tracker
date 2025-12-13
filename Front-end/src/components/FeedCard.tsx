import React, { useState } from 'react';
import type { FeedActivity } from '@/types/activity.types';
import Avatar from './Avatar';
import { ActivityIcon } from './ActivityIcon';
import { LikeButton } from './LikeButton';
import { CommentSection } from './CommentSection';

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
 */
export function FeedCard({ activity, userId }: FeedCardProps) {
  const { activity_type, user, habit, metadata, created_at } = activity;
  const [showComments, setShowComments] = useState(false);

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
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
  };

  // Get activity message based on type
  const getActivityMessage = () => {
    switch (activity_type) {
      case 'habit_completion':
        if (habit?.title) {
          return (
            <>
              completed <span className="font-semibold text-green-400">{habit.title}</span>
            </>
          );
        } else {
          // Private habit - show generic message with count if available
          const totalToday = metadata?.total_today;
          if (totalToday) {
            return `checked off a habit (${totalToday}/5)`;
          }
          return 'checked off a habit';
        }

      case 'gold_star_day':
        const totalHabits = metadata?.total_habits || 5;
        return (
          <>
            earned a <span className="font-semibold text-yellow-400">Gold Star Day</span>! ({totalHabits}+ habits)
          </>
        );

      case 'streak_milestone':
        const milestoneCount = metadata?.streak_count || 0;
        const habitTitle = habit?.title || metadata?.habit_title;
        if (habitTitle) {
          return (
            <>
              reached a <span className="font-semibold text-orange-400">{milestoneCount}-day streak</span> on {habitTitle}
            </>
          );
        } else {
          return (
            <>
              reached a <span className="font-semibold text-orange-400">{milestoneCount}-day streak</span>
            </>
          );
        }

      case 'new_longest_streak':
        const newStreakCount = metadata?.streak_count || 0;
        const prevLongest = metadata?.previous_longest || 0;
        const longestHabitTitle = habit?.title || metadata?.habit_title;
        if (longestHabitTitle) {
          return (
            <>
              set a <span className="font-semibold text-purple-400">new longest streak</span> of {newStreakCount} days on {longestHabitTitle} (previous: {prevLongest})
            </>
          );
        } else {
          return (
            <>
              set a <span className="font-semibold text-purple-400">new longest streak</span> of {newStreakCount} days
            </>
          );
        }

      default:
        return 'did something';
    }
  };

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
          <span className="text-gray-400 text-sm">{formatTimestamp(created_at)}</span>
        </div>

        {/* Activity message */}
        <p className="text-gray-200">{getActivityMessage()}</p>

        {/* Likes and Comments */}
        <div className="flex items-center gap-4 mt-3">
          <LikeButton activityId={activity.id} userId={userId} />
          <button
            onClick={() => setShowComments(!showComments)}
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
}
