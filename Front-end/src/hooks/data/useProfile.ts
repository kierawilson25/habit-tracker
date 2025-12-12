'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import type { UserProfile } from '@/types/profile.types';

/**
 * Options for configuring the useProfile hook
 */
export interface UseProfileOptions {
  /**
   * User ID to fetch profile for
   */
  userId?: string | null;

  /**
   * Whether to automatically fetch profile on mount
   * @default true
   */
  autoFetch?: boolean;
}

/**
 * Return type for the useProfile hook
 */
export interface UseProfileReturn {
  /**
   * User profile data
   */
  profile: UserProfile | null;

  /**
   * Whether profile is currently loading
   */
  loading: boolean;

  /**
   * Error that occurred during fetch or operations
   */
  error: Error | null;

  /**
   * Manually refetch profile from the database
   */
  refetch: () => Promise<void>;

  /**
   * Update user profile
   * @param updates - Partial profile object with fields to update
   */
  updateProfile: (updates: Partial<UserProfile>) => Promise<boolean>;

  /**
   * Upload profile picture to Supabase Storage
   * @param file - Image file to upload
   */
  uploadProfilePicture: (file: File) => Promise<string | null>;
}

/**
 * Hook for managing user profile data
 *
 * Provides CRUD operations and state management for user profiles.
 * Automatically fetches profile on mount and provides methods
 * to update profile and upload profile pictures.
 *
 * @param options - Configuration options for the hook
 * @returns Profile data, loading state, and CRUD operations
 *
 * @example
 * function ProfilePage() {
 *   const { user } = useSupabaseAuth();
 *   const { profile, loading, error, updateProfile } = useProfile({ userId: user?.id });
 *
 *   if (loading) return <Loading />;
 *   if (error) return <div>Error: {error.message}</div>;
 *
 *   return (
 *     <div>
 *       <h1>{profile?.username}</h1>
 *       <p>{profile?.bio}</p>
 *     </div>
 *   );
 * }
 */
export function useProfile(options: UseProfileOptions = {}): UseProfileReturn {
  const { userId, autoFetch = true } = options;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState<Error | null>(null);

  const supabase = createClient();

  /**
   * Fetch profile from the database
   */
  const fetchProfile = useCallback(async () => {
    if (!userId) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (fetchError) throw fetchError;

      setProfile(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch profile');
      setError(error);
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  }, [userId, supabase]);

  /**
   * Update user profile
   */
  const updateProfile = useCallback(async (updates: Partial<UserProfile>): Promise<boolean> => {
    if (!userId) {
      setError(new Error('User ID is required to update profile'));
      return false;
    }

    try {
      setError(null);

      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (updateError) throw updateError;

      // Update local state
      setProfile((prev) => (prev ? { ...prev, ...updates } : null));

      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update profile');
      setError(error);
      console.error('Error updating profile:', error);
      return false;
    }
  }, [userId, supabase]);

  /**
   * Upload profile picture to Supabase Storage
   */
  const uploadProfilePicture = useCallback(async (file: File): Promise<string | null> => {
    if (!userId) {
      setError(new Error('User ID is required to upload profile picture'));
      return null;
    }

    try {
      setError(null);

      // Validate file
      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image');
      }
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File must be less than 5MB');
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);

      // Update profile with new URL
      await updateProfile({ profile_picture_url: publicUrl });

      return publicUrl;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to upload profile picture');
      setError(error);
      console.error('Error uploading profile picture:', error);
      return null;
    }
  }, [userId, supabase, updateProfile]);

  /**
   * Auto-fetch profile on mount if autoFetch is true
   */
  useEffect(() => {
    if (autoFetch && userId) {
      fetchProfile();
    }
  }, [autoFetch, userId, fetchProfile]);

  return {
    profile,
    loading,
    error,
    refetch: fetchProfile,
    updateProfile,
    uploadProfilePicture,
  };
}
