-- Migration: In-App Notifications System
-- Creates notification table, triggers, and extends preferences

-- =====================================================
-- Table: in_app_notifications
-- =====================================================

CREATE TABLE IF NOT EXISTS in_app_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Who gets this notification
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,

  -- Notification type and source
  type VARCHAR(50) NOT NULL CHECK (type IN ('friend_post', 'like', 'comment')),
  actor_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,

  -- What activity this relates to
  activity_id UUID NOT NULL,
  activity_type VARCHAR(50),
  activity_context TEXT, -- e.g., "completed Running" or "earned a Gold Star Day"

  -- For comment notifications
  comment_text TEXT,

  -- Metadata
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Prevent duplicate notifications
  CONSTRAINT unique_notification_per_action UNIQUE(user_id, type, actor_id, activity_id, created_at)
);

-- Indexes for query performance
CREATE INDEX idx_notifications_user_unread ON in_app_notifications(user_id, is_read, created_at DESC);
CREATE INDEX idx_notifications_user_type ON in_app_notifications(user_id, type, created_at DESC);
CREATE INDEX idx_notifications_created_at ON in_app_notifications(created_at DESC);

-- =====================================================
-- Row Level Security
-- =====================================================

ALTER TABLE in_app_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON in_app_notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON in_app_notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- =====================================================
-- Extend notification_preferences table
-- =====================================================

ALTER TABLE notification_preferences
  ADD COLUMN IF NOT EXISTS notify_friend_posts BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS notify_likes BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS notify_comments BOOLEAN DEFAULT true;

-- =====================================================
-- Trigger 1: Notify friends when activity is posted
-- =====================================================

CREATE OR REPLACE FUNCTION notify_friend_activity()
RETURNS TRIGGER AS $$
BEGIN
  -- Create notifications for all friends when user posts activity
  INSERT INTO in_app_notifications (user_id, type, actor_id, activity_id, activity_type, activity_context)
  SELECT
    f.user_id,
    'friend_post',
    NEW.user_id,
    NEW.id,
    NEW.activity_type,
    CASE
      WHEN NEW.activity_type = 'habit_completion' THEN 'completed ' || h.title
      WHEN NEW.activity_type = 'gold_star_day' THEN 'earned a Gold Star Day'
      ELSE NEW.activity_type
    END
  FROM friendships f
  LEFT JOIN habits h ON h.id = NEW.habit_id
  INNER JOIN notification_preferences np ON np.user_id = f.user_id
  WHERE (f.friend_id = NEW.user_id OR f.user_id = NEW.user_id)
    AND f.status = 'accepted'
    AND f.user_id != NEW.user_id
    AND np.notify_friend_posts = true
  ON CONFLICT (user_id, type, actor_id, activity_id, created_at) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_activity_created_notify_friends
  AFTER INSERT ON activities
  FOR EACH ROW
  EXECUTE FUNCTION notify_friend_activity();

-- =====================================================
-- Trigger 2: Notify activity owner when liked
-- =====================================================

CREATE OR REPLACE FUNCTION notify_activity_liked()
RETURNS TRIGGER AS $$
BEGIN
  -- Create notification for activity owner when liked (skip if user likes own activity)
  IF NEW.user_id != (SELECT user_id FROM activities WHERE id = NEW.activity_id) THEN
    INSERT INTO in_app_notifications (user_id, type, actor_id, activity_id, activity_type, activity_context)
    SELECT
      a.user_id,
      'like',
      NEW.user_id,
      NEW.activity_id,
      a.activity_type,
      CASE
        WHEN a.activity_type = 'habit_completion' THEN 'completed ' || h.title
        WHEN a.activity_type = 'gold_star_day' THEN 'earned a Gold Star Day'
        ELSE a.activity_type
      END
    FROM activities a
    LEFT JOIN habits h ON h.id = a.habit_id
    INNER JOIN notification_preferences np ON np.user_id = a.user_id
    WHERE a.id = NEW.activity_id
      AND np.notify_likes = true
    ON CONFLICT (user_id, type, actor_id, activity_id, created_at) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_like_created_notify_owner
  AFTER INSERT ON likes
  FOR EACH ROW
  EXECUTE FUNCTION notify_activity_liked();

-- =====================================================
-- Trigger 3: Notify activity owner when commented
-- =====================================================

CREATE OR REPLACE FUNCTION notify_activity_commented()
RETURNS TRIGGER AS $$
BEGIN
  -- Create notification for activity owner when commented (skip if user comments on own activity)
  IF NEW.user_id != (SELECT user_id FROM activities WHERE id = NEW.activity_id) THEN
    INSERT INTO in_app_notifications (user_id, type, actor_id, activity_id, activity_type, activity_context, comment_text)
    SELECT
      a.user_id,
      'comment',
      NEW.user_id,
      NEW.activity_id,
      a.activity_type,
      CASE
        WHEN a.activity_type = 'habit_completion' THEN 'completed ' || h.title
        WHEN a.activity_type = 'gold_star_day' THEN 'earned a Gold Star Day'
        ELSE a.activity_type
      END,
      NEW.comment_text
    FROM activities a
    LEFT JOIN habits h ON h.id = a.habit_id
    INNER JOIN notification_preferences np ON np.user_id = a.user_id
    WHERE a.id = NEW.activity_id
      AND np.notify_comments = true
    ON CONFLICT (user_id, type, actor_id, activity_id, created_at) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_comment_created_notify_owner
  AFTER INSERT ON comments
  FOR EACH ROW
  EXECUTE FUNCTION notify_activity_commented();
