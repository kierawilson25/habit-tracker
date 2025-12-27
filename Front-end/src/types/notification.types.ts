/**
 * Notification Types
 *
 * Types for managing user notification preferences and in-app notifications
 */

/**
 * Type of in-app notification
 */
export type NotificationType = 'friend_post' | 'like' | 'comment';

/**
 * In-App Notification
 *
 * Represents a single notification shown in the notification center
 */
export interface InAppNotification {
  /**
   * Unique identifier for the notification
   */
  id: string;

  /**
   * User ID who receives this notification
   */
  user_id: string;

  /**
   * Type of notification
   */
  type: NotificationType;

  /**
   * User ID who triggered this notification (e.g., who liked, commented, posted)
   */
  actor_id: string;

  /**
   * Username of the actor (joined from user_profiles)
   */
  actor_username: string;

  /**
   * Profile picture URL of the actor (joined from user_profiles)
   */
  actor_avatar?: string;

  /**
   * Activity ID this notification relates to
   */
  activity_id: string;

  /**
   * Type of activity (habit_completion, gold_star_day, etc.)
   */
  activity_type?: string;

  /**
   * Human-readable context (e.g., "completed Running" or "earned a Gold Star Day")
   */
  activity_context?: string;

  /**
   * Text of comment (only for comment notifications)
   */
  comment_text?: string;

  /**
   * Whether the notification has been read
   */
  is_read: boolean;

  /**
   * Timestamp when notification was created
   */
  created_at: string;
}

/**
 * Notification Preferences
 *
 * User preferences for email and in-app notifications
 */
export interface NotificationPreferences {
  /**
   * Unique identifier for the notification preference record
   */
  id: string;

  /**
   * User ID this preference belongs to (references user_profiles.id)
   */
  user_id: string;

  /**
   * Master toggle for all email notifications
   */
  email_enabled: boolean;

  /**
   * Toggle for daily habit reminder emails
   */
  daily_reminder_enabled: boolean;

  /**
   * Send reminder if some habits tracked but not all
   */
  reminder_if_incomplete_enabled: boolean;

  /**
   * Send reminder if no habits tracked at all
   */
  reminder_if_none_enabled: boolean;

  /**
   * Time to send daily reminders (HH:MM:SS format)
   * @default '20:00:00' (8 PM)
   * @future Will be used when user-selectable reminder time is implemented
   */
  reminder_time: string;

  /**
   * User's timezone for sending reminders at correct local time
   * @default 'America/New_York'
   * @future Will be used when timezone selection is implemented
   */
  timezone: string;

  /**
   * Get notified when friends post activities
   * @default true
   */
  notify_friend_posts: boolean;

  /**
   * Get notified when someone likes your activity
   * @default true
   */
  notify_likes: boolean;

  /**
   * Get notified when someone comments on your activity
   * @default true
   */
  notify_comments: boolean;

  /**
   * Timestamp when preferences were created
   */
  created_at: string;

  /**
   * Timestamp when preferences were last updated
   */
  updated_at: string;
}
