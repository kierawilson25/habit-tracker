-- =====================================================
-- Migration: Friend Stats Functions
-- Creates functions to fetch friend data with permission checks
-- Uses SECURITY DEFINER to bypass RLS
-- =====================================================

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS get_friend_habits(UUID);
DROP FUNCTION IF EXISTS get_friend_completions(UUID);

-- Function to get friend's habits
CREATE OR REPLACE FUNCTION get_friend_habits(friend_user_id UUID)
RETURNS SETOF habits
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the requesting user is friends with the target user
  IF NOT EXISTS (
    SELECT 1 FROM friendships
    WHERE friendships.user_id = auth.uid()
    AND friendships.friend_id = friend_user_id
  ) THEN
    RAISE EXCEPTION 'Not authorized to view this user''s habits';
  END IF;

  -- Return the friend's habits
  RETURN QUERY
  SELECT *
  FROM habits
  WHERE user_id = friend_user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get friend's habit completions
CREATE OR REPLACE FUNCTION get_friend_completions(friend_user_id UUID)
RETURNS SETOF habit_completions
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the requesting user is friends with the target user
  IF NOT EXISTS (
    SELECT 1 FROM friendships
    WHERE friendships.user_id = auth.uid()
    AND friendships.friend_id = friend_user_id
  ) THEN
    RAISE EXCEPTION 'Not authorized to view this user''s completions';
  END IF;

  -- Return the friend's completions
  RETURN QUERY
  SELECT *
  FROM habit_completions
  WHERE user_id = friend_user_id
  ORDER BY completion_date DESC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Usage:
-- SELECT * FROM get_friend_habits('friend-uuid-here');
-- SELECT * FROM get_friend_completions('friend-uuid-here');
-- =====================================================
