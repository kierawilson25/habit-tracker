-- =====================================================
-- Migration: User Profiles Infrastructure
-- Phase 1: Foundation for Friends & Profile Feature
-- =====================================================

-- Create user_profiles table
-- =====================================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(30) UNIQUE NOT NULL,
  bio TEXT,
  habits_privacy VARCHAR(10) DEFAULT 'public' CHECK (habits_privacy IN ('public', 'private')),
  profile_picture_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for username search
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
-- =====================================================

-- Everyone can view all profiles (for friend search)
CREATE POLICY "Public profiles are viewable by everyone"
  ON user_profiles
  FOR SELECT
  USING (true);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Storage Bucket for Profile Pictures
-- =====================================================
-- Note: This must be run in Supabase Dashboard > Storage > Create Bucket
-- Bucket name: profile-pictures
-- Public: Yes

-- Storage Policies
-- =====================================================
-- Note: These must be run in Supabase Dashboard > Storage > Policies

-- Policy 1: Public Access (SELECT)
-- Allow anyone to view profile pictures
-- SQL:
-- CREATE POLICY "Public Access"
-- ON storage.objects FOR SELECT
-- USING (bucket_id = 'profile-pictures');

-- Policy 2: Authenticated Upload (INSERT)
-- Allow authenticated users to upload to their own folder
-- SQL:
-- CREATE POLICY "Authenticated users can upload"
-- ON storage.objects FOR INSERT
-- WITH CHECK (
--   bucket_id = 'profile-pictures'
--   AND auth.role() = 'authenticated'
--   AND (storage.foldername(name))[1] = auth.uid()::text
-- );

-- Policy 3: Users can update own images (UPDATE)
-- SQL:
-- CREATE POLICY "Users can update own images"
-- ON storage.objects FOR UPDATE
-- USING (
--   bucket_id = 'profile-pictures'
--   AND auth.uid()::text = (storage.foldername(name))[1]
-- );

-- Policy 4: Users can delete own images (DELETE)
-- SQL:
-- CREATE POLICY "Users can delete own images"
-- ON storage.objects FOR DELETE
-- USING (
--   bucket_id = 'profile-pictures'
--   AND auth.uid()::text = (storage.foldername(name))[1]
-- );

-- =====================================================
-- Instructions:
-- =====================================================
-- 1. Run this SQL in Supabase Dashboard > SQL Editor
-- 2. Create storage bucket:
--    - Go to Storage > Create Bucket
--    - Name: profile-pictures
--    - Public: Yes
-- 3. Add storage policies:
--    - Go to Storage > profile-pictures > Policies
--    - Click "New Policy" and add each policy above
-- =====================================================
