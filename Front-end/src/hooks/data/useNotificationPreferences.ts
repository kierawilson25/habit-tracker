'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import type { NotificationPreferences } from '@/types/notification.types';

/**
 * Options for configuring the useNotificationPreferences hook
 */
export interface UseNotificationPreferencesOptions {
  /**
   * User ID to fetch notification preferences for
   */
  userId?: string | null;

  /**
   * Whether to automatically fetch preferences on mount
   * @default true
   */
  autoFetch?: boolean;
}

/**
 * Return type for the useNotificationPreferences hook
 */
export interface UseNotificationPreferencesReturn {
  /**
   * User notification preferences data
   */
  preferences: NotificationPreferences | null;

  /**
   * Whether preferences are currently loading
   */
  loading: boolean;

  /**
   * Error that occurred during fetch or operations
   */
  error: Error | null;

  /**
   * Manually refetch preferences from the database
   */
  refetch: () => Promise<void>;

  /**
   * Update user notification preferences
   * @param updates - Partial preferences object with fields to update
   */
  updatePreferences: (updates: Partial<NotificationPreferences>) => Promise<boolean>;
}

/**
 * Hook for managing user notification preferences
 *
 * Provides CRUD operations and state management for notification preferences.
 * Automatically fetches preferences on mount and provides methods to update them.
 *
 * @param options - Configuration options for the hook
 * @returns Preferences data, loading state, and CRUD operations
 *
 * @example
 * function NotificationSettings() {
 *   const { user } = useSupabaseAuth();
 *   const { preferences, loading, error, updatePreferences } = useNotificationPreferences({ userId: user?.id });
 *
 *   if (loading) return <Loading />;
 *   if (error) return <div>Error: {error.message}</div>;
 *
 *   return (
 *     <Toggle
 *       enabled={preferences?.email_enabled ?? false}
 *       onChange={(enabled) => updatePreferences({ email_enabled: enabled })}
 *     />
 *   );
 * }
 */
export function useNotificationPreferences(options: UseNotificationPreferencesOptions = {}): UseNotificationPreferencesReturn {
  const { userId, autoFetch = true } = options;

  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState<Error | null>(null);

  const supabase = createClient();

  /**
   * Fetch notification preferences from the database
   */
  const fetchPreferences = useCallback(async () => {
    if (!userId) {
      setPreferences(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (fetchError) {
        // PGRST116 means no rows found - this is valid (preferences not created yet)
        // This shouldn't happen because of the trigger, but handle it gracefully
        if (fetchError.code === 'PGRST116') {
          setPreferences(null);
          setError(null);
        } else {
          throw fetchError;
        }
      } else {
        setPreferences(data);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch notification preferences');
      setError(error);
      console.error('Error fetching notification preferences:', error);
    } finally {
      setLoading(false);
    }
  }, [userId, supabase]);

  /**
   * Update user notification preferences (creates if doesn't exist)
   */
  const updatePreferences = useCallback(async (updates: Partial<NotificationPreferences>): Promise<boolean> => {
    if (!userId) {
      setError(new Error('User ID is required to update notification preferences'));
      return false;
    }

    try {
      setError(null);

      // Use upsert to insert if doesn't exist, update if it does
      const { data, error: upsertError } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: userId,
          ...updates,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (upsertError) throw upsertError;

      // Update local state with the returned data
      setPreferences(data);

      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update notification preferences');
      setError(error);
      console.error('Error updating notification preferences:', error);
      return false;
    }
  }, [userId, supabase]);

  /**
   * Auto-fetch preferences on mount if autoFetch is true
   */
  useEffect(() => {
    if (autoFetch && userId) {
      fetchPreferences();
    }
  }, [autoFetch, userId, fetchPreferences]);

  return {
    preferences,
    loading,
    error,
    refetch: fetchPreferences,
    updatePreferences,
  };
}
