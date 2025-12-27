/**
 * NotificationCard Component
 *
 * Displays a single notification with actor avatar, message, timestamp, and type icon.
 * Supports keyboard navigation and accessibility.
 *
 * @example
 * <NotificationCard
 *   notification={notification}
 *   onClick={handleNotificationClick}
 * />
 */

import React from 'react';
import type { InAppNotification, NotificationType } from '@/types/notification.types';
import Avatar from './Avatar';

export interface NotificationCardProps {
  /**
   * Notification to display
   */
  notification: InAppNotification;

  /**
   * Click handler
   */
  onClick: (notification: InAppNotification) => void;
}

/**
 * Format timestamp to relative time
 */
function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

/**
 * Get notification message based on type
 */
function getNotificationMessage(notification: InAppNotification): string {
  switch (notification.type) {
    case 'friend_post':
      return 'posted an activity';
    case 'like':
      return 'liked your activity';
    case 'comment':
      if (notification.comment_text) {
        const truncated = notification.comment_text.slice(0, 60);
        const suffix = notification.comment_text.length > 60 ? '...' : '';
        return `commented: "${truncated}${suffix}"`;
      }
      return 'commented on your activity';
    default:
      return 'interacted with your activity';
  }
}

/**
 * Get notification type icon
 */
function getNotificationIcon(type: NotificationType): React.JSX.Element {
  switch (type) {
    case 'friend_post':
      return <span className="text-xl" aria-label="New post">✨</span>;
    case 'like':
      return <span className="text-xl" aria-label="Like">❤️</span>;
    case 'comment':
      return <span className="text-xl" aria-label="Comment">💬</span>;
  }
}

/**
 * Get accessible aria-label for notification
 */
function getAriaLabel(notification: InAppNotification): string {
  const message = getNotificationMessage(notification);
  const time = formatTimestamp(notification.created_at);
  const readStatus = notification.is_read ? 'Read' : 'Unread';
  return `${readStatus}. ${notification.actor_username} ${message}, ${time}`;
}

export default function NotificationCard({
  notification,
  onClick,
}: NotificationCardProps) {
  const handleClick = () => {
    onClick(notification);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(notification);
    }
  };

  return (
    <div
      className={`flex gap-4 p-4 rounded-lg transition-all duration-150 cursor-pointer focus-green ${
        notification.is_read
          ? 'bg-gray-800 hover:bg-gray-750'
          : 'bg-gray-700 hover:bg-gray-650 border-l-4 border-green-500'
      }`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label={getAriaLabel(notification)}
    >
      {/* Actor avatar */}
      <div className="flex-shrink-0">
        <Avatar
          src={notification.actor_avatar}
          alt={notification.actor_username}
          size="sm"
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Notification message */}
        <p className="text-gray-200 text-sm">
          <span className="font-semibold text-white">
            {notification.actor_username}
          </span>{' '}
          {getNotificationMessage(notification)}
        </p>

        {/* Context (what was liked/commented on) */}
        {notification.activity_context && (
          <p className="text-gray-400 text-xs mt-1">
            {notification.activity_context}
          </p>
        )}

        {/* Timestamp */}
        <p
          className="text-gray-500 text-xs mt-2"
          title={new Date(notification.created_at).toLocaleString()}
        >
          {formatTimestamp(notification.created_at)}
        </p>
      </div>

      {/* Type icon */}
      <div className="flex-shrink-0 self-start">
        {getNotificationIcon(notification.type)}
      </div>
    </div>
  );
}
