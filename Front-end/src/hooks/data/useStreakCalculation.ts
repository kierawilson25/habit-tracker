'use client';

import { useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import type { StreakData } from '@/types/habit.types';

/**
 * Return type for the useStreakCalculation hook
 */
export interface UseStreakCalculationReturn {
  /**
   * Calculate current and longest streak for a habit
   * @param habitId - The habit ID to calculate streaks for
   * @returns Object with current and longest streak counts
   */
  calculateStreak: (habitId: string) => Promise<StreakData>;

  /**
   * Check if a habit was completed today
   * @param habitId - The habit ID to check
   * @returns True if habit was completed today, false otherwise
   */
  isCompletedToday: (habitId: string) => Promise<boolean>;

  /**
   * Get the most recent completion date for a habit
   * @param habitId - The habit ID
   * @returns The completion date string or null if no completions
   */
  getLastCompletionDate: (habitId: string) => Promise<string | null>;
}

/**
 * Hook for calculating habit streaks
 *
 * Provides a unified, consistent algorithm for calculating current and longest
 * streaks across the entire application. This ensures streak data is calculated
 * the same way everywhere, preventing inconsistencies.
 *
 * The algorithm:
 * - Current streak: Counts consecutive days from most recent completion, breaks if >1 day gap
 * - Longest streak: Finds the longest consecutive sequence in entire completion history
 * - Uses completion_date from habit_completions table
 * - Dates are compared in YYYY-MM-DD format (en-CA locale)
 *
 * @returns Streak calculation functions
 *
 * @example
 * function HabitsPage() {
 *   const { calculateStreak, isCompletedToday } = useStreakCalculation();
 *
 *   const handleComplete = async (habitId: string) => {
 *     // Mark as complete in database...
 *     const streaks = await calculateStreak(habitId);
 *     console.log(`Current: ${streaks.current}, Longest: ${streaks.longest}`);
 *   };
 *
 *   return <div>...</div>;
 * }
 */
export function useStreakCalculation(): UseStreakCalculationReturn {
  const supabase = createClient();

  /**
   * Calculate current and longest streak for a habit
   * This is the authoritative streak calculation algorithm used across the app
   */
  const calculateStreak = useCallback(async (habitId: string): Promise<StreakData> => {
    console.log(`📊 calculateStreak called for habitId: ${habitId}`);

    const { data: completions, error } = await supabase
      .from('habit_completions')
      .select('completion_date')
      .eq('habit_id', habitId)
      .order('completion_date', { ascending: false });

    if (error || !completions?.length) {
      console.log(`❌ No completions found for habit ${habitId}`);
      return { current: 0, longest: 0 };
    }

    console.log(`📅 Found ${completions.length} completions for habit ${habitId}`);

    let currentStreak = 0;
    let longestStreak = 0;

    const completionDates = completions.map(c => new Date(c.completion_date).toISOString().split('T')[0]);
    const today = new Date().toLocaleDateString('en-CA');

    console.log(`📅 Today's date: ${today}`);
    console.log(`📅 Most recent completion: ${completionDates[0]}`);

    // Calculate current streak
    if (completionDates.length > 0) {
      const mostRecentCompletion = completionDates[0];
      const mostRecentDate = new Date(mostRecentCompletion);
      const todayDate = new Date(today);

      const daysDiff = Math.floor((todayDate.getTime() - mostRecentDate.getTime()) / (1000 * 60 * 60 * 24));
      console.log(`📅 Days since last completion: ${daysDiff}`);

      if (daysDiff > 1) {
        console.log(`❌ Streak broken - last completion was ${daysDiff} days ago`);
        currentStreak = 0;
      } else {
        currentStreak = 1;
        console.log(`✅ Starting streak count from most recent completion`);

        // Count consecutive days backward from most recent
        for (let i = 1; i < completionDates.length; i++) {
          const currentCompDate = new Date(completionDates[i - 1]);
          const nextCompDate = new Date(completionDates[i]);
          const daysDifference = Math.floor((currentCompDate.getTime() - nextCompDate.getTime()) / (1000 * 60 * 60 * 24));

          console.log(`  Comparing ${completionDates[i-1]} to ${completionDates[i]}: ${daysDifference} days apart`);

          if (daysDifference === 1) {
            currentStreak++;
            console.log(`  ✅ Consecutive! Streak now: ${currentStreak}`);
          } else {
            console.log(`  ❌ Gap found! Final current streak: ${currentStreak}`);
            break;
          }
        }
      }
    }

    // Calculate longest streak in entire history
    console.log(`📊 Calculating longest streak...`);
    let i = 0;
    while (i < completionDates.length) {
      let tempStreak = 1;
      let j = i;

      while (j < completionDates.length - 1) {
        const currentDate = new Date(completionDates[j]);
        const nextDate = new Date(completionDates[j + 1]);
        const daysDiff = Math.floor((currentDate.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24));

        if (daysDiff === 1) {
          tempStreak++;
          j++;
        } else {
          break;
        }
      }

      if (tempStreak > longestStreak) {
        console.log(`  New longest streak found: ${tempStreak} (starting from ${completionDates[i]})`);
        longestStreak = tempStreak;
      }

      i = j + 1;
    }

    console.log(`📊 Final streaks - Current: ${currentStreak}, Longest: ${longestStreak}`);
    return { current: currentStreak, longest: longestStreak };
  }, [supabase]);

  /**
   * Check if a habit was completed today
   */
  const isCompletedToday = useCallback(async (habitId: string): Promise<boolean> => {
    const today = new Date().toLocaleDateString('en-CA');
    console.log(`🔍 Checking if habit ${habitId} was completed today (${today})`);

    const { data, error } = await supabase
      .from('habit_completions')
      .select('id')
      .eq('habit_id', habitId)
      .eq('completion_date', today)
      .single();

    const result = !!data && !error;
    console.log(`🔍 Habit ${habitId} completed today: ${result}`);
    return result;
  }, [supabase]);

  /**
   * Get the most recent completion date for a habit
   */
  const getLastCompletionDate = useCallback(async (habitId: string): Promise<string | null> => {
    const { data } = await supabase
      .from('habit_completions')
      .select('completion_date')
      .eq('habit_id', habitId)
      .order('completion_date', { ascending: false })
      .limit(1)
      .single();

    return data?.completion_date || null;
  }, [supabase]);

  return {
    calculateStreak,
    isCompletedToday,
    getLastCompletionDate,
  };
}
