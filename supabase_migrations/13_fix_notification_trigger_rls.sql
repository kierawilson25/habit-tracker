-- Migration: Fix Notification Trigger RLS Policy
-- Adds SECURITY DEFINER to trigger functions so they can bypass RLS when creating notifications
--
-- Problem: Trigger functions were failing with "new row violates row-level security policy"
-- because they were trying to INSERT notifications for other users (activity owners)
-- while running in the context of the user performing the action (liker/commenter).
--
-- Solution: SECURITY DEFINER makes the functions run with elevated privileges,
-- bypassing RLS policies. This is safe because the triggers only create notifications
-- for valid actions (likes, comments, posts) that are already authorized.

-- Allow the trigger functions to bypass RLS when inserting notifications
ALTER FUNCTION notify_activity_liked() SECURITY DEFINER;
ALTER FUNCTION notify_activity_commented() SECURITY DEFINER;
ALTER FUNCTION notify_friend_activity() SECURITY DEFINER;
