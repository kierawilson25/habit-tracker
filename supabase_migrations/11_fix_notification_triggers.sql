-- Migration: Fix Notification Triggers
-- Drops and recreates triggers with correct table names

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS on_activity_created_notify_friends ON activities;
DROP TRIGGER IF EXISTS on_activity_created_notify_friends ON feed_activities;
DROP TRIGGER IF EXISTS on_like_created_notify_owner ON likes;
DROP TRIGGER IF EXISTS on_like_created_notify_owner ON activity_likes;
DROP TRIGGER IF EXISTS on_comment_created_notify_owner ON comments;
DROP TRIGGER IF EXISTS on_comment_created_notify_owner ON activity_comments;

-- Recreate triggers with correct table names
CREATE TRIGGER on_activity_created_notify_friends
  AFTER INSERT ON feed_activities
  FOR EACH ROW
  EXECUTE FUNCTION notify_friend_activity();

CREATE TRIGGER on_like_created_notify_owner
  AFTER INSERT ON activity_likes
  FOR EACH ROW
  EXECUTE FUNCTION notify_activity_liked();

CREATE TRIGGER on_comment_created_notify_owner
  AFTER INSERT ON activity_comments
  FOR EACH ROW
  EXECUTE FUNCTION notify_activity_commented();
