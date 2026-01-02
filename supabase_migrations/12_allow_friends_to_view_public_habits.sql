-- Migration: Allow friends to view public habits
-- Adds RLS policy so friends can see habit details when privacy is set to public

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Friends can view public habits" ON habits;

-- Create policy that allows viewing habits when:
-- 1. You own the habit, OR
-- 2. The habit owner is your friend AND their habits_privacy is 'public'
CREATE POLICY "Friends can view public habits"
  ON habits FOR SELECT
  USING (
    -- User can view their own habits
    auth.uid() = user_id
    OR
    -- User can view friend's habits if privacy is public
    (
      -- Check if users are friends
      EXISTS (
        SELECT 1 FROM friendships
        WHERE (
          (user_id = auth.uid() AND friend_id = habits.user_id)
          OR
          (user_id = habits.user_id AND friend_id = auth.uid())
        )
      )
      AND
      -- Check if habit owner has public privacy setting
      EXISTS (
        SELECT 1 FROM user_profiles
        WHERE id = habits.user_id
        AND habits_privacy = 'public'
      )
    )
  );
