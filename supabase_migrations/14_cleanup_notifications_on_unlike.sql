-- Migration: Cleanup Notifications on Unlike/Uncomment
-- Adds DELETE triggers to remove notifications when likes/comments are deleted
--
-- Problem: When users unlike an activity or delete a comment, the notification
-- remains in in_app_notifications, causing orphaned notifications that can't be dismissed.
--
-- Solution: Add triggers that delete the corresponding notification when the
-- like or comment is removed.

-- =====================================================
-- Trigger: Delete notification when like is removed
-- =====================================================

CREATE OR REPLACE FUNCTION cleanup_like_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete the notification for this like
  DELETE FROM in_app_notifications
  WHERE type = 'like'
    AND actor_id = OLD.user_id
    AND activity_id = OLD.activity_id;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_like_deleted_cleanup_notification
  AFTER DELETE ON activity_likes
  FOR EACH ROW
  EXECUTE FUNCTION cleanup_like_notification();

-- =====================================================
-- Trigger: Delete notification when comment is removed
-- =====================================================

CREATE OR REPLACE FUNCTION cleanup_comment_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete the notification for this comment
  DELETE FROM in_app_notifications
  WHERE type = 'comment'
    AND actor_id = OLD.user_id
    AND activity_id = OLD.activity_id
    AND created_at >= OLD.created_at - interval '1 second'
    AND created_at <= OLD.created_at + interval '1 second';

  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_comment_deleted_cleanup_notification
  AFTER DELETE ON activity_comments
  FOR EACH ROW
  EXECUTE FUNCTION cleanup_comment_notification();
