-- =====================================================
-- Migration: Allow Friends to View Habits and Completions
-- Updates RLS policies to allow users to view their friends' data
-- =====================================================

-- Drop existing SELECT policies on habits table
DROP POLICY IF EXISTS "Users can view own habits" ON habits;
DROP POLICY IF EXISTS "Users can view their own habits" ON habits;

-- Create new SELECT policy for habits that allows viewing own habits OR friends' habits
CREATE POLICY "Users can view own and friends habits" ON habits
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR
    EXISTS (
      SELECT 1 FROM friendships
      WHERE friendships.user_id = auth.uid()
      AND friendships.friend_id = habits.user_id
    )
  );

-- Drop existing SELECT policies on habit_completions table
DROP POLICY IF EXISTS "Users can view own completions" ON habit_completions;
DROP POLICY IF EXISTS "Users can view their own completions" ON habit_completions;

-- Create new SELECT policy for habit_completions that allows viewing own OR friends' completions
CREATE POLICY "Users can view own and friends completions" ON habit_completions
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR
    EXISTS (
      SELECT 1 FROM friendships
      WHERE friendships.user_id = auth.uid()
      AND friendships.friend_id = habit_completions.user_id
    )
  );

-- =====================================================
-- Note: This allows friends to see each other's habits and completions
-- The frontend should still respect the habits_privacy setting when
-- displaying habit details (showing habit names vs generic messages)
-- =====================================================
