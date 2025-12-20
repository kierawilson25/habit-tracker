-- =====================================================
-- Migration: Email Notification Preferences
-- Phase: Daily Habit Reminder Feature
-- =====================================================

-- Create notification_preferences table
-- =====================================================
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,

  -- Email notification toggles
  email_enabled BOOLEAN DEFAULT false,
  daily_reminder_enabled BOOLEAN DEFAULT false,
  reminder_if_incomplete_enabled BOOLEAN DEFAULT true,
  reminder_if_none_enabled BOOLEAN DEFAULT true,

  -- Timing preferences (future enhancement - not used in MVP)
  reminder_time TIME DEFAULT '20:00:00',
  timezone VARCHAR(50) DEFAULT 'America/New_York',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_user_notification_prefs UNIQUE(user_id)
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_notification_prefs_user_id ON notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_prefs_enabled ON notification_preferences(email_enabled, daily_reminder_enabled)
  WHERE email_enabled = true AND daily_reminder_enabled = true;

-- Enable Row Level Security
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notification_preferences
-- =====================================================

-- Users can view their own notification preferences
CREATE POLICY "Users can view own notification preferences"
  ON notification_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own notification preferences
CREATE POLICY "Users can insert own notification preferences"
  ON notification_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own notification preferences
CREATE POLICY "Users can update own notification preferences"
  ON notification_preferences
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Trigger to auto-create notification preferences
-- =====================================================

-- Function to create default notification preferences when user profile is created
CREATE OR REPLACE FUNCTION create_default_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on user_profiles insert
CREATE TRIGGER on_user_profile_created_notification_prefs
  AFTER INSERT ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_default_notification_preferences();

-- =====================================================
-- Instructions:
-- =====================================================
-- 1. Run this SQL in Supabase Dashboard > SQL Editor
-- 2. Verify table created: SELECT * FROM notification_preferences;
-- 3. Test trigger by creating a test user profile
-- 4. Verify default preferences were auto-created
-- =====================================================
