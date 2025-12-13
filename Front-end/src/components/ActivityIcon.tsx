import React from 'react';
import type { ActivityType } from '@/types/activity.types';

export interface ActivityIconProps {
  /**
   * Type of activity
   */
  type: ActivityType;

  /**
   * Size of the icon
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * ActivityIcon component
 *
 * Displays an icon/emoji representing different activity types
 */
export function ActivityIcon({ type, size = 'md' }: ActivityIconProps) {
  const sizeClasses = {
    sm: 'text-2xl w-8 h-8',
    md: 'text-3xl w-10 h-10',
    lg: 'text-4xl w-12 h-12',
  };

  const icons: Record<ActivityType, string> = {
    habit_completion: '✓',
    gold_star_day: '⭐',
    streak_milestone: '🔥',
    new_longest_streak: '🏆',
  };

  const bgColors: Record<ActivityType, string> = {
    habit_completion: 'bg-green-600',
    gold_star_day: 'bg-yellow-500',
    streak_milestone: 'bg-orange-500',
    new_longest_streak: 'bg-purple-600',
  };

  return (
    <div
      className={`${sizeClasses[size]} ${bgColors[type]} rounded-full flex items-center justify-center flex-shrink-0`}
    >
      <span className="leading-none">{icons[type]}</span>
    </div>
  );
}
