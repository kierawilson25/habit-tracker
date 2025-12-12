-- =====================================================
-- Migration: Friend Requests and Friendships
-- Phase 3: Friend Request System
-- =====================================================

-- Create friend_requests table
-- =====================================================
CREATE TABLE IF NOT EXISTS friend_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure unique request between two users
  UNIQUE(sender_id, receiver_id),

  -- Prevent self-requests
  CHECK (sender_id != receiver_id)
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_friend_requests_sender_id ON friend_requests(sender_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_receiver_id ON friend_requests(receiver_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_status ON friend_requests(status);

-- Enable Row Level Security
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for friend_requests
-- =====================================================

-- Users can view requests they sent or received
CREATE POLICY "Users can view own friend requests"
  ON friend_requests
  FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Users can send friend requests
CREATE POLICY "Users can send friend requests"
  ON friend_requests
  FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Users can update requests they received (accept/reject)
CREATE POLICY "Users can update received requests"
  ON friend_requests
  FOR UPDATE
  USING (auth.uid() = receiver_id);

-- Users can delete requests they sent (cancel)
CREATE POLICY "Users can delete sent requests"
  ON friend_requests
  FOR DELETE
  USING (auth.uid() = sender_id);

-- Create friendships table (bidirectional)
-- =====================================================
CREATE TABLE IF NOT EXISTS friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure unique friendship
  UNIQUE(user_id, friend_id),

  -- Prevent self-friendship
  CHECK (user_id != friend_id)
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_friendships_user_id ON friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend_id ON friendships(friend_id);

-- Enable Row Level Security
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

-- RLS Policies for friendships
-- =====================================================

-- Users can view their own friendships
CREATE POLICY "Users can view own friendships"
  ON friendships
  FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Users can delete their own friendships (unfriend)
CREATE POLICY "Users can delete own friendships"
  ON friendships
  FOR DELETE
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Database Function: Create bidirectional friendship on request acceptance
-- =====================================================
CREATE OR REPLACE FUNCTION create_friendship_from_request(request_id UUID)
RETURNS VOID AS $$
DECLARE
  req friend_requests;
BEGIN
  -- Get the request
  SELECT * INTO req FROM friend_requests WHERE id = request_id;

  -- Verify request exists and is pending
  IF req.id IS NULL THEN
    RAISE EXCEPTION 'Friend request not found';
  END IF;

  IF req.status != 'pending' THEN
    RAISE EXCEPTION 'Friend request is not pending';
  END IF;

  -- Create bidirectional friendship
  INSERT INTO friendships (user_id, friend_id)
  VALUES (req.sender_id, req.receiver_id);

  INSERT INTO friendships (user_id, friend_id)
  VALUES (req.receiver_id, req.sender_id);

  -- Update request status
  UPDATE friend_requests
  SET status = 'accepted', updated_at = NOW()
  WHERE id = request_id;

EXCEPTION
  WHEN unique_violation THEN
    -- If friendship already exists, just update the request
    UPDATE friend_requests
    SET status = 'accepted', updated_at = NOW()
    WHERE id = request_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Instructions:
-- =====================================================
-- Run this SQL in Supabase Dashboard > SQL Editor
-- =====================================================
