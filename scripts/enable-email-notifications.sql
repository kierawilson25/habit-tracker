-- Enable email notifications for all users
-- Run this in the Supabase SQL Editor

-- Step 1: Update existing notification_preferences to enable email notifications
UPDATE notification_preferences
SET
  email_enabled = true,
  daily_reminder_enabled = true,
  reminder_if_incomplete_enabled = true,
  reminder_if_none_enabled = true
WHERE email_enabled = false OR daily_reminder_enabled = false;

-- Step 2: Create notification_preferences for users who don't have them yet
-- This ensures all users in user_profiles have notification preferences
INSERT INTO notification_preferences (
  user_id,
  email_enabled,
  daily_reminder_enabled,
  reminder_if_incomplete_enabled,
  reminder_if_none_enabled,
  reminder_time,
  timezone
)
SELECT
  id,
  true,  -- email_enabled
  true,  -- daily_reminder_enabled
  true,  -- reminder_if_incomplete_enabled
  true,  -- reminder_if_none_enabled
  '20:00:00',  -- Default reminder time: 8 PM
  'America/New_York'  -- Default timezone
FROM user_profiles
WHERE id NOT IN (SELECT user_id FROM notification_preferences)
ON CONFLICT (user_id) DO NOTHING;

-- Step 3: Verify the changes
SELECT
  COUNT(*) as total_users,
  SUM(CASE WHEN email_enabled THEN 1 ELSE 0 END) as email_enabled_count,
  SUM(CASE WHEN daily_reminder_enabled THEN 1 ELSE 0 END) as daily_reminder_enabled_count
FROM notification_preferences;
