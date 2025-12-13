-- =====================================================
-- Migration: Fix Friend Request Foreign Keys
-- Changes foreign keys to point to user_profiles instead of auth.users
-- This enables proper joins in PostgREST queries
-- =====================================================

-- Drop existing constraints from friend_requests
ALTER TABLE friend_requests
  DROP CONSTRAINT IF EXISTS friend_requests_sender_id_fkey;

ALTER TABLE friend_requests
  DROP CONSTRAINT IF EXISTS friend_requests_receiver_id_fkey;

-- Drop existing constraints from friendships
ALTER TABLE friendships
  DROP CONSTRAINT IF EXISTS friendships_user_id_fkey;

ALTER TABLE friendships
  DROP CONSTRAINT IF EXISTS friendships_friend_id_fkey;

-- Add new constraints to user_profiles instead of auth.users
ALTER TABLE friend_requests
  ADD CONSTRAINT friend_requests_sender_id_fkey
  FOREIGN KEY (sender_id) REFERENCES user_profiles(id) ON DELETE CASCADE;

ALTER TABLE friend_requests
  ADD CONSTRAINT friend_requests_receiver_id_fkey
  FOREIGN KEY (receiver_id) REFERENCES user_profiles(id) ON DELETE CASCADE;

ALTER TABLE friendships
  ADD CONSTRAINT friendships_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;

ALTER TABLE friendships
  ADD CONSTRAINT friendships_friend_id_fkey
  FOREIGN KEY (friend_id) REFERENCES user_profiles(id) ON DELETE CASCADE;

-- =====================================================
-- Verification: Check the new constraints
-- =====================================================
-- SELECT
--   conname AS constraint_name,
--   conrelid::regclass AS table_name,
--   confrelid::regclass AS referenced_table
-- FROM pg_constraint
-- WHERE conrelid IN ('friend_requests'::regclass, 'friendships'::regclass)
--   AND contype = 'f';
-- =====================================================
