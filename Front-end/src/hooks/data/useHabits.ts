'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import type { Habit } from '@/types/habit.types';

/**
 * Options for configuring the useHabits hook
 */
export interface UseHabitsOptions {
  /**
   * User ID to fetch habits for
   */
  userId?: string | null;

  /**
   * Whether to automatically fetch habits on mount
   * @default true
   */
  autoFetch?: boolean;

  /**
   * Whether to include archived habits
   * @default false
   */
  includeArchived?: boolean;
}

/**
 * Return type for the useHabits hook
 */
export interface UseHabitsReturn {
  /**
   * Array of user habits
   */
  habits: Habit[];

  /**
   * Whether habits are currently loading
   */
  loading: boolean;

  /**
   * Error that occurred during fetch or operations
   */
  error: Error | null;

  /**
   * Manually refetch habits from the database
   */
  refetch: () => Promise<void>;

  /**
   * Add a new habit
   * @param title - The title/name of the habit
   */
  addHabit: (title: string) => Promise<Habit | null>;

  /**
   * Update an existing habit
   * @param id - The habit ID
   * @param updates - Partial habit object with fields to update
   */
  updateHabit: (id: string, updates: Partial<Habit>) => Promise<boolean>;

  /**
   * Delete a habit (archives it)
   * @param id - The habit ID
   */
  deleteHabit: (id: string) => Promise<boolean>;

  /**
   * Toggle habit completion for today
   * @param id - The habit ID
   * @param completed - Whether the habit should be marked as completed
   */
  toggleHabit: (id: string, completed: boolean) => Promise<boolean>;
}

/**
 * Hook for managing user habits data
 *
 * Provides CRUD operations and state management for habits.
 * Automatically fetches habits on mount and provides methods
 * to add, update, delete, and toggle habit completion.
 *
 * @param options - Configuration options for the hook
 * @returns Habit data, loading state, and CRUD operations
 *
 * @example
 * function HabitsPage() {
 *   const { user } = useSupabaseAuth();
 *   const { habits, loading, error, toggleHabit } = useHabits({ userId: user?.id });
 *
 *   if (loading) return <Loading />;
 *   if (error) return <div>Error: {error.message}</div>;
 *
 *   return (
 *     <div>
 *       {habits.map(habit => (
 *         <div key={habit.id}>
 *           <input
 *             type="checkbox"
 *             checked={habit.completed}
 *             onChange={(e) => toggleHabit(habit.id, e.target.checked)}
 *           />
 *           {habit.title}
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 */
export function useHabits(options: UseHabitsOptions = {}): UseHabitsReturn {
  const { userId, autoFetch = true, includeArchived = false } = options;

  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState<Error | null>(null);

  const supabase = createClient();

  /**
   * Fetch habits from the database
   */
  const fetchHabits = useCallback(async () => {
    if (!userId) {
      setHabits([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('habits')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (!includeArchived) {
        query = query.eq('is_archived', false);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setHabits(data || []);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch habits');
      setError(error);
      console.error('Error fetching habits:', error);
    } finally {
      setLoading(false);
    }
  }, [userId, includeArchived, supabase]);

  /**
   * Add a new habit
   */
  const addHabit = useCallback(async (title: string): Promise<Habit | null> => {
    if (!userId) {
      setError(new Error('User ID is required to add a habit'));
      return null;
    }

    try {
      setError(null);

      const newHabit = {
        user_id: userId,
        title,
        completed: false,
        current_streak: 0,
        longest_streak: 0,
        last_completed: null,
        is_archived: false,
      };

      const { data, error: insertError } = await supabase
        .from('habits')
        .insert(newHabit)
        .select()
        .single();

      if (insertError) throw insertError;

      // Update local state
      if (data) {
        setHabits((prev) => [...prev, data]);
      }

      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to add habit');
      setError(error);
      console.error('Error adding habit:', error);
      return null;
    }
  }, [userId, supabase]);

  /**
   * Update an existing habit
   */
  const updateHabit = useCallback(async (id: string, updates: Partial<Habit>): Promise<boolean> => {
    try {
      setError(null);

      const { error: updateError } = await supabase
        .from('habits')
        .update(updates)
        .eq('id', id);

      if (updateError) throw updateError;

      // Update local state
      setHabits((prev) =>
        prev.map((habit) =>
          habit.id === id ? { ...habit, ...updates } : habit
        )
      );

      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update habit');
      setError(error);
      console.error('Error updating habit:', error);
      return false;
    }
  }, [supabase]);

  /**
   * Delete (archive) a habit
   */
  const deleteHabit = useCallback(async (id: string): Promise<boolean> => {
    try {
      setError(null);

      const { error: deleteError } = await supabase
        .from('habits')
        .update({ is_archived: true })
        .eq('id', id);

      if (deleteError) throw deleteError;

      // Remove from local state
      setHabits((prev) => prev.filter((habit) => habit.id !== id));

      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete habit');
      setError(error);
      console.error('Error deleting habit:', error);
      return false;
    }
  }, [supabase]);

  /**
   * Toggle habit completion for today
   * Note: This is a simplified version. For complex streak calculations,
   * use the streak logic directly in your component or create a useStreakCalculation hook.
   */
  const toggleHabit = useCallback(async (id: string, completed: boolean): Promise<boolean> => {
    if (!userId) {
      setError(new Error('User ID is required to toggle habit'));
      return false;
    }

    try {
      setError(null);
      const today = new Date().toLocaleDateString('en-CA');

      if (completed) {
        // Add completion record
        const { error: insertError } = await supabase
          .from('habit_completions')
          .insert({
            habit_id: id,
            user_id: userId,
            completion_date: today,
          });

        if (insertError && insertError.code !== '23505') {
          // Ignore duplicate key errors
          throw insertError;
        }
      } else {
        // Remove completion record
        const { error: deleteError } = await supabase
          .from('habit_completions')
          .delete()
          .eq('habit_id', id)
          .eq('completion_date', today);

        if (deleteError) throw deleteError;
      }

      // Update local state
      setHabits((prev) =>
        prev.map((habit) =>
          habit.id === id
            ? {
                ...habit,
                completed,
                last_completed: completed ? today : habit.last_completed,
              }
            : habit
        )
      );

      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to toggle habit');
      setError(error);
      console.error('Error toggling habit:', error);
      return false;
    }
  }, [userId, supabase]);

  /**
   * Auto-fetch habits on mount if autoFetch is true
   */
  useEffect(() => {
    if (autoFetch && userId) {
      fetchHabits();
    }
  }, [autoFetch, userId, fetchHabits]);

  return {
    habits,
    loading,
    error,
    refetch: fetchHabits,
    addHabit,
    updateHabit,
    deleteHabit,
    toggleHabit,
  };
}
