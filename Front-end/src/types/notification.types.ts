/**
 * Notification Preferences Types
 *
 * Types for managing user email notification preferences
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
   * Timestamp when preferences were created
   */
  created_at: string;

  /**
   * Timestamp when preferences were last updated
   */
  updated_at: string;
}
