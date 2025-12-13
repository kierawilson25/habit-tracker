-- =====================================================
-- Migration: Backfill User Profiles
-- Creates user_profiles for existing users who don't have one
-- =====================================================

-- Insert user_profiles for all auth.users who don't have a profile yet
INSERT INTO user_profiles (id, username, bio, habits_privacy, profile_picture_url)
SELECT
  u.id,
  -- Generate username from email (before @ sign, lowercase, replace non-alphanumeric with underscore)
  COALESCE(
    regexp_replace(
      lower(split_part(u.email, '@', 1)),
      '[^a-z0-9_]',
      '_',
      'g'
    ),
    'user_' || substring(u.id::text, 1, 8)
  ) as username,
  NULL as bio,
  'public' as habits_privacy,
  NULL as profile_picture_url
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.id
WHERE up.id IS NULL;

-- Handle potential username conflicts by appending user ID suffix
-- If the generated username already exists, append part of the user ID
DO $$
DECLARE
  profile_record RECORD;
  new_username TEXT;
  conflict_count INT;
BEGIN
  -- Find profiles with duplicate usernames
  FOR profile_record IN
    SELECT id, username
    FROM user_profiles
    WHERE username IN (
      SELECT username
      FROM user_profiles
      GROUP BY username
      HAVING COUNT(*) > 1
    )
    ORDER BY created_at DESC
  LOOP
    -- Generate unique username by appending user ID
    new_username := profile_record.username || '_' || substring(profile_record.id::text, 1, 8);

    -- Update the username
    UPDATE user_profiles
    SET username = new_username
    WHERE id = profile_record.id;

    RAISE NOTICE 'Updated duplicate username % to %', profile_record.username, new_username;
  END LOOP;
END $$;

-- =====================================================
-- Verification Query (run this to check results)
-- =====================================================
-- SELECT
--   COUNT(*) as total_users,
--   COUNT(up.id) as users_with_profiles,
--   COUNT(*) - COUNT(up.id) as users_without_profiles
-- FROM auth.users u
-- LEFT JOIN user_profiles up ON u.id = up.id;
-- =====================================================
