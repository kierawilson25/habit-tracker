-- =====================================================
-- Migration: Feed Activities Table and Triggers
-- Creates the feed_activities table and auto-generation triggers
-- =====================================================

-- Create feed_activities table
CREATE TABLE IF NOT EXISTS feed_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL CHECK (activity_type IN (
    'habit_completion',
    'gold_star_day',
    'streak_milestone',
    'new_longest_streak'
  )),
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_feed_activities_user_id ON feed_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_feed_activities_created_at ON feed_activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feed_activities_type ON feed_activities(activity_type);

-- RLS Policies for feed_activities
ALTER TABLE feed_activities ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own activities" ON feed_activities;
DROP POLICY IF EXISTS "Users can view friends activities" ON feed_activities;
DROP POLICY IF EXISTS "Users can insert own activities" ON feed_activities;
DROP POLICY IF EXISTS "Users can delete own activities" ON feed_activities;

-- Users can view their own activities
CREATE POLICY "Users can view own activities" ON feed_activities
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can view activities from their friends
CREATE POLICY "Users can view friends activities" ON feed_activities
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM friendships
      WHERE friendships.user_id = auth.uid()
      AND friendships.friend_id = feed_activities.user_id
    )
  );

-- Users can insert their own activities
CREATE POLICY "Users can insert own activities" ON feed_activities
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own activities
CREATE POLICY "Users can delete own activities" ON feed_activities
  FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- Trigger Function: Auto-generate activities on habit completion
-- =====================================================

CREATE OR REPLACE FUNCTION generate_habit_completion_activity()
RETURNS TRIGGER
SECURITY DEFINER
AS $$
DECLARE
  habit_record habits;
  today_completions INT;
  user_streak INT;
  user_longest_streak INT;
BEGIN
  -- Get the habit details
  SELECT * INTO habit_record FROM habits WHERE id = NEW.habit_id;

  -- 1. Create habit completion activity
  INSERT INTO feed_activities (user_id, activity_type, habit_id, metadata)
  VALUES (
    NEW.user_id,
    'habit_completion',
    NEW.habit_id,
    jsonb_build_object(
      'habit_title', habit_record.title,
      'completion_date', NEW.completion_date
    )
  );

  -- 2. Check for gold star day (5+ habits completed today)
  SELECT COUNT(DISTINCT habit_id) INTO today_completions
  FROM habit_completions
  WHERE user_id = NEW.user_id
  AND completion_date = NEW.completion_date;

  IF today_completions >= 5 THEN
    -- Check if we already created a gold star activity for today
    IF NOT EXISTS (
      SELECT 1 FROM feed_activities
      WHERE user_id = NEW.user_id
      AND activity_type = 'gold_star_day'
      AND DATE(created_at) = NEW.completion_date
    ) THEN
      INSERT INTO feed_activities (user_id, activity_type, metadata)
      VALUES (
        NEW.user_id,
        'gold_star_day',
        jsonb_build_object(
          'total_habits', today_completions,
          'date', NEW.completion_date
        )
      );
    END IF;
  END IF;

  -- 3. Calculate current streak for this habit
  DECLARE
    current_streak INT := 0;
    check_date DATE := NEW.completion_date;
    days_checked INT := 0;
  BEGIN
    -- Count consecutive days backward from today
    LOOP
      IF EXISTS (
        SELECT 1 FROM habit_completions
        WHERE habit_id = NEW.habit_id
        AND user_id = NEW.user_id
        AND completion_date = check_date
      ) THEN
        current_streak := current_streak + 1;
        check_date := check_date - INTERVAL '1 day';
        days_checked := days_checked + 1;
      ELSE
        EXIT;
      END IF;

      -- Safety limit to prevent infinite loops
      IF days_checked > 365 THEN
        EXIT;
      END IF;
    END LOOP;

    -- Check for streak milestones (7, 14, 30, 60, 90, 180, 365 days)
    IF current_streak IN (7, 14, 30, 60, 90, 180, 365) THEN
      -- Only create if we haven't already created this milestone for this habit
      IF NOT EXISTS (
        SELECT 1 FROM feed_activities
        WHERE user_id = NEW.user_id
        AND activity_type = 'streak_milestone'
        AND habit_id = NEW.habit_id
        AND (metadata->>'streak_count')::int = current_streak
        AND created_at > NOW() - INTERVAL '24 hours'
      ) THEN
        INSERT INTO feed_activities (user_id, activity_type, habit_id, metadata)
        VALUES (
          NEW.user_id,
          'streak_milestone',
          NEW.habit_id,
          jsonb_build_object(
            'habit_title', habit_record.title,
            'streak_count', current_streak
          )
        );
      END IF;
    END IF;

    -- 4. Check for new longest streak
    -- Get the longest streak for this habit from previous activities
    SELECT COALESCE(MAX((metadata->>'streak_count')::int), 0)
    INTO user_longest_streak
    FROM feed_activities
    WHERE user_id = NEW.user_id
    AND habit_id = NEW.habit_id
    AND activity_type IN ('streak_milestone', 'new_longest_streak');

    IF current_streak > user_longest_streak AND current_streak >= 7 THEN
      INSERT INTO feed_activities (user_id, activity_type, habit_id, metadata)
      VALUES (
        NEW.user_id,
        'new_longest_streak',
        NEW.habit_id,
        jsonb_build_object(
          'habit_title', habit_record.title,
          'streak_count', current_streak,
          'previous_longest', user_longest_streak
        )
      );
    END IF;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on habit_completions
DROP TRIGGER IF EXISTS on_habit_completion_activity ON habit_completions;
CREATE TRIGGER on_habit_completion_activity
  AFTER INSERT ON habit_completions
  FOR EACH ROW
  EXECUTE FUNCTION generate_habit_completion_activity();

-- =====================================================
-- Verification Query (run this to check the table)
-- =====================================================
-- SELECT * FROM feed_activities ORDER BY created_at DESC LIMIT 10;
-- =====================================================
