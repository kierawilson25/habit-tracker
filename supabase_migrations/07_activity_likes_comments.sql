-- =====================================================
-- Migration: Activity Likes and Comments
-- Creates tables for social interactions on feed activities
-- =====================================================

-- Create activity_likes table
CREATE TABLE IF NOT EXISTS activity_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES feed_activities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(activity_id, user_id)
);

-- Create indexes for activity_likes
CREATE INDEX IF NOT EXISTS idx_activity_likes_activity_id ON activity_likes(activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_likes_user_id ON activity_likes(user_id);

-- RLS Policies for activity_likes
ALTER TABLE activity_likes ENABLE ROW LEVEL SECURITY;

-- Everyone can view likes
CREATE POLICY "Anyone can view likes" ON activity_likes
  FOR SELECT
  USING (true);

-- Users can insert their own likes
CREATE POLICY "Users can insert own likes" ON activity_likes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own likes
CREATE POLICY "Users can delete own likes" ON activity_likes
  FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================

-- Create activity_comments table
CREATE TABLE IF NOT EXISTS activity_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES feed_activities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  comment_text TEXT NOT NULL CHECK (length(comment_text) > 0 AND length(comment_text) <= 500),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for activity_comments
CREATE INDEX IF NOT EXISTS idx_activity_comments_activity_id ON activity_comments(activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_comments_user_id ON activity_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_comments_created_at ON activity_comments(created_at);

-- RLS Policies for activity_comments
ALTER TABLE activity_comments ENABLE ROW LEVEL SECURITY;

-- Everyone can view comments
CREATE POLICY "Anyone can view comments" ON activity_comments
  FOR SELECT
  USING (true);

-- Users can insert their own comments
CREATE POLICY "Users can insert own comments" ON activity_comments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own comments
CREATE POLICY "Users can update own comments" ON activity_comments
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete own comments" ON activity_comments
  FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- Trigger to update updated_at timestamp
-- =====================================================

CREATE OR REPLACE FUNCTION update_comment_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_comment_timestamp
  BEFORE UPDATE ON activity_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_comment_updated_at();

-- =====================================================
-- Verification Query (run this to check the tables)
-- =====================================================
-- SELECT * FROM activity_likes ORDER BY created_at DESC LIMIT 10;
-- SELECT * FROM activity_comments ORDER BY created_at DESC LIMIT 10;
-- =====================================================
