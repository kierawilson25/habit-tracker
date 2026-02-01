-- Disable email notifications for all users
-- Run this in the Supabase SQL Editor if you want to turn off emails temporarily

UPDATE notification_preferences
SET
  email_enabled = false,
  daily_reminder_enabled = false;

-- Verify the changes
SELECT
  COUNT(*) as total_users,
  SUM(CASE WHEN email_enabled THEN 1 ELSE 0 END) as email_enabled_count,
  SUM(CASE WHEN daily_reminder_enabled THEN 1 ELSE 0 END) as daily_reminder_enabled_count
FROM notification_preferences;
