-- Migration: Friend Request Notifications
-- Adds friend_request notification type and trigger

-- =====================================================
-- Update notification type constraint
-- =====================================================

ALTER TABLE in_app_notifications
  DROP CONSTRAINT IF EXISTS in_app_notifications_type_check;

ALTER TABLE in_app_notifications
  ADD CONSTRAINT in_app_notifications_type_check
  CHECK (type IN ('friend_post', 'like', 'comment', 'friend_request'));

-- =====================================================
-- Add friend request notification preference
-- =====================================================

ALTER TABLE notification_preferences
  ADD COLUMN IF NOT EXISTS notify_friend_requests BOOLEAN DEFAULT true;

-- =====================================================
-- Trigger: Notify user when they receive a friend request
-- =====================================================

CREATE OR REPLACE FUNCTION notify_friend_request()
RETURNS TRIGGER AS $$
BEGIN
  -- Create notification for receiver when friend request is sent
  -- Only for pending requests, not when status changes to accepted/rejected
  IF NEW.status = 'pending' THEN
    INSERT INTO in_app_notifications (
      user_id,
      type,
      actor_id,
      activity_id,
      activity_type,
      activity_context
    )
    SELECT
      NEW.receiver_id,
      'friend_request',
      NEW.sender_id,
      NEW.id, -- Use friend_request id as activity_id for uniqueness
      'friend_request',
      'sent you a friend request'
    FROM notification_preferences np
    WHERE np.user_id = NEW.receiver_id
      AND np.notify_friend_requests = true
    ON CONFLICT (user_id, type, actor_id, activity_id, created_at) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_friend_request_notify_receiver
  AFTER INSERT ON friend_requests
  FOR EACH ROW
  EXECUTE FUNCTION notify_friend_request();

-- =====================================================
-- Cleanup trigger: Remove notification when request is handled
-- =====================================================

CREATE OR REPLACE FUNCTION cleanup_friend_request_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete notification when friend request is accepted, rejected, or deleted
  -- Keep notification if it's still pending
  IF OLD.status = 'pending' AND (NEW.status IN ('accepted', 'rejected') OR TG_OP = 'DELETE') THEN
    DELETE FROM in_app_notifications
    WHERE type = 'friend_request'
      AND activity_id = OLD.id
      AND actor_id = OLD.sender_id
      AND user_id = OLD.receiver_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_friend_request_handled_cleanup_notification
  AFTER UPDATE OR DELETE ON friend_requests
  FOR EACH ROW
  EXECUTE FUNCTION cleanup_friend_request_notification();
