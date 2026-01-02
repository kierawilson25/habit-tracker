-- Migration: Set Default In-App Notification Preferences
-- Updates all existing notification_preferences rows to enable in-app notifications by default

-- Update all existing rows to have in-app notifications enabled
UPDATE notification_preferences
SET
  notify_friend_posts = COALESCE(notify_friend_posts, true),
  notify_likes = COALESCE(notify_likes, true),
  notify_comments = COALESCE(notify_comments, true)
WHERE
  notify_friend_posts IS NULL
  OR notify_likes IS NULL
  OR notify_comments IS NULL;
