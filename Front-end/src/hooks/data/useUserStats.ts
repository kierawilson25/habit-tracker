'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';

export interface UserStats {
  /**
   * Total number of active habits
   */
  total_habits: number;

  /**
   * Total number of habit completions (all time)
   */
  total_completions: number;

  /**
   * Current active streak (consecutive days with at least 1 completion)
   */
  current_streak: number;

  /**
   * Longest streak in history (consecutive days with at least 1 completion)
   */
  longest_streak: number;

  /**
   * Number of gold star days (days with 5+ completions)
   */
  gold_star_days: number;

  /**
   * Average habits completed per day (only counting active days)
   */
  avg_habits_per_day: number;

  /**
   * Weekly progress (average completion rate for last 7 days)
   */
  weekly_progress: number;

  /**
   * Total number of days with at least one completion
   */
  total_active_days: number;

  /**
   * Number of habits completed today
   */
  completed_today: number;
}

export interface UseUserStatsOptions {
  /**
   * User ID to fetch stats for
   */
  userId?: string | null;

  /**
   * Number of habits for percentage calculations
   */
  totalHabits?: number;

  /**
   * Whether to automatically fetch on mount
   * @default true
   */
  autoFetch?: boolean;
}

export interface UseUserStatsReturn {
  /**
   * User statistics
   */
  stats: UserStats;

  /**
   * Whether stats are currently loading
   */
  loading: boolean;

  /**
   * Error that occurred during fetch
   */
  error: Error | null;

  /**
   * Manually refetch stats
   */
  refetch: () => Promise<void>;
}

/**
 * Hook for calculating user-level statistics
 *
 * Provides a unified, consistent source for all user stats across the app.
 * This ensures stats like longest streak, completion rate, etc. are calculated
 * the same way on home, stats, and profile pages.
 *
 * @param options - Configuration options
 * @returns User stats, loading state, and refetch function
 *
 * @example
 * function HomePage() {
 *   const { stats, loading } = useUserStats({ userId: user?.id, totalHabits: habits.length });
 *
 *   if (loading) return <Loading />;
 *
 *   return (
 *     <div>
 *       <StatCard value={stats.current_streak} label="Day Streak" />
 *       <StatCard value={stats.longest_streak} label="Longest Streak" />
 *     </div>
 *   );
 * }
 */
export function useUserStats(options: UseUserStatsOptions = {}): UseUserStatsReturn {
  const { userId, totalHabits = 0, autoFetch = true } = options;

  const [stats, setStats] = useState<UserStats>({
    total_habits: 0,
    total_completions: 0,
    current_streak: 0,
    longest_streak: 0,
    gold_star_days: 0,
    avg_habits_per_day: 0,
    weekly_progress: 0,
    total_active_days: 0,
    completed_today: 0,
  });

  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState<Error | null>(null);

  const supabase = createClient();

  /**
   * Fetch and calculate all user stats
   */
  const fetchStats = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch all completions
      const { data: completions, error: completionsError } = await supabase
        .from('habit_completions')
        .select('completion_date, habit_id')
        .eq('user_id', userId)
        .order('completion_date', { ascending: false });

      if (completionsError) throw completionsError;

      if (!completions || completions.length === 0) {
        setStats({
          total_habits: totalHabits,
          total_completions: 0,
          current_streak: 0,
          longest_streak: 0,
          gold_star_days: 0,
          avg_habits_per_day: 0,
          weekly_progress: 0,
          total_active_days: 0,
          completed_today: 0,
        });
        setLoading(false);
        return;
      }

      const totalCompletions = completions.length;

      // Get unique dates (days with activity) - normalize to ISO format for consistent comparison
      const completionDates = completions.map(c => new Date(c.completion_date).toISOString().split('T')[0]);
      const uniqueDates = [...new Set(completionDates)];
      // uniqueDates is now in descending order (most recent first) since completions was ordered descending
      const totalActiveDays = uniqueDates.length;

      // Today's date in ISO format
      const today = new Date().toISOString().split('T')[0];

      // Count completions today
      const completedToday = completions.filter(c => {
        const compDate = new Date(c.completion_date).toISOString().split('T')[0];
        return compDate === today;
      }).length;

      // Calculate current streak (consecutive days with at least 1 completion)
      let currentStreak = 0;
      if (uniqueDates.length > 0) {
        const mostRecentCompletion = uniqueDates[0];
        const mostRecentDate = new Date(mostRecentCompletion);
        const todayDate = new Date(today);

        const daysDiff = Math.floor((todayDate.getTime() - mostRecentDate.getTime()) / (1000 * 60 * 60 * 24));

        // Streak is active if last completion was today or yesterday (0 or 1 days ago)
        if (daysDiff > 1) {
          currentStreak = 0; // Streak broken
        } else {
          currentStreak = 1; // Start counting from most recent

          // Count consecutive days backward from most recent
          for (let i = 1; i < uniqueDates.length; i++) {
            const currentDate = new Date(uniqueDates[i - 1]);
            const nextDate = new Date(uniqueDates[i]);
            const daysDifference = Math.floor((currentDate.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24));

            if (daysDifference === 1) {
              currentStreak++;
            } else {
              break; // Gap found, stop counting
            }
          }
        }
      }

      // Calculate longest streak in entire history using two-pointer approach
      let longestStreak = 0;
      let i = 0;

      while (i < uniqueDates.length) {
        let tempStreak = 1;
        let j = i;

        // Count consecutive days from this starting point
        while (j < uniqueDates.length - 1) {
          const currentDate = new Date(uniqueDates[j]);
          const nextDate = new Date(uniqueDates[j + 1]);
          const daysDiff = Math.floor((currentDate.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24));

          if (daysDiff === 1) {
            tempStreak++;
            j++;
          } else {
            break; // Gap found
          }
        }

        longestStreak = Math.max(longestStreak, tempStreak);
        i = j + 1; // Move to next potential sequence start
      }

      // Calculate gold star days (days with 5+ completions)
      const completionsByDate: Record<string, number> = {};
      completions.forEach(c => {
        completionsByDate[c.completion_date] = (completionsByDate[c.completion_date] || 0) + 1;
      });
      const goldStarDays = Object.values(completionsByDate).filter(count => count >= 5).length;

      // Calculate average habits per day (only counting active days)
      const avgPerDay = totalActiveDays > 0 ? totalCompletions / totalActiveDays : 0;

      // Calculate weekly progress (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const sevenDaysAgoStr = sevenDaysAgo.toLocaleDateString('en-CA');

      const weeklyCompletions = completions.filter(
        c => c.completion_date >= sevenDaysAgoStr
      );

      let weeklyProgress = 0;
      if (totalHabits > 0 && weeklyCompletions.length > 0) {
        // Group by date and count unique habits per day
        const weeklyByDate: Record<string, Set<string>> = {};
        weeklyCompletions.forEach(c => {
          if (!weeklyByDate[c.completion_date]) {
            weeklyByDate[c.completion_date] = new Set();
          }
          weeklyByDate[c.completion_date].add(c.habit_id);
        });

        // Calculate average daily completion rate for the week
        const daysWithData = Object.keys(weeklyByDate);
        if (daysWithData.length > 0) {
          const totalCompletionRate = daysWithData.reduce((sum, date) => {
            const habitsCompletedThatDay = weeklyByDate[date].size;
            return sum + (habitsCompletedThatDay / totalHabits);
          }, 0);

          weeklyProgress = Math.round((totalCompletionRate / daysWithData.length) * 100);
        }
      }

      setStats({
        total_habits: totalHabits,
        total_completions: totalCompletions,
        current_streak: currentStreak,
        longest_streak: longestStreak,
        gold_star_days: goldStarDays,
        avg_habits_per_day: Math.round(avgPerDay * 10) / 10,
        weekly_progress: weeklyProgress,
        total_active_days: totalActiveDays,
        completed_today: completedToday,
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch user stats');
      setError(error);
      console.error('Error fetching user stats:', error);
    } finally {
      setLoading(false);
    }
  }, [userId, totalHabits, supabase]);

  /**
   * Refetch stats
   */
  const refetch = useCallback(async () => {
    await fetchStats();
  }, [fetchStats]);

  /**
   * Auto-fetch on mount
   */
  useEffect(() => {
    if (autoFetch && userId) {
      fetchStats();
    }
  }, [autoFetch, userId, totalHabits]); // Include totalHabits to recalculate when habits change

  return {
    stats,
    loading,
    error,
    refetch,
  };
}
