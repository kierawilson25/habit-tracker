"use client";
import Image from "next/image";
import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Checkbox from "@/app/components/Checkbox";
import Link from "next/link";
import { useEffect } from "react";
import "../../utils/styles/global.css";
import { createClient } from "@/utils/supabase/client";
import type { 
  Habit, 
  HabitAnalysis, 
  UpdateStrategy, 
  HabitUpdate 
} from '../../types/habit.types';


export default function Home() {
  const [habits, setHabits] = useState<Habit[]>([]);
  //const [checkedStates, setCheckedStates] = useState<boolean[]>([]);
  const [habitIds, setHabitIds] = useState<string[]>([]);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationAnimating, setCelebrationAnimating] = useState(false);
  const [confetti, setConfetti] = useState<Array<{ id: number; left: number; delay: number; duration: number }>>([]);
  const [fetchedHabits, setFetchedHabits] = useState(false);
  const activeButtonClass = "bg-green-600 text-white rounded px-4 py-2 hover:bg-green-700 transition-colors duration-200"
  
  const supabase = createClient();

  // Celebration effect
  useEffect(() => {
    const completedCount = habits.filter(h => h.completed).length;
    const totalCount = habits.length;
    
    if (totalCount > 0 && completedCount === totalCount && !showCelebration && !celebrationAnimating) {
      setShowCelebration(true);
      setCelebrationAnimating(true);
      
      // Generate confetti
      const newConfetti = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: 2 + Math.random() * 1
      }));
      setConfetti(newConfetti);
      
      // Start slide up animation after 3 seconds
      setTimeout(() => {
        setShowCelebration(false);
      }, 3000);
      
      // Fully hide after slide up animation completes (3s + 1s animation)
      setTimeout(() => {
        setConfetti([]);
        setCelebrationAnimating(false);
      }, 4000);
    } else if (completedCount < totalCount && (showCelebration || celebrationAnimating)) {
      setShowCelebration(false);
      setConfetti([]);
      setCelebrationAnimating(false);
    }
  }, [habits]);


  // STREAK CALCULATION FUNCTIONS
  
  const calculateStreak = async (habitId: string) => {
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
    console.log(`📅 First 5 completions:`, completions.slice(0, 5).map(c => c.completion_date));
    
    let currentStreak = 0;
    let longestStreak = 0;
    
    const completionDates = completions.map(c => new Date(c.completion_date).toISOString().split('T')[0]);
    const today = new Date().toLocaleDateString('en-CA');
    
    console.log(`📅 Today's date: ${today}`);
    console.log(`📅 Most recent completion: ${completionDates[0]}`);
    
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
  };

  const isHabitCompletedToday = async (habitId: string) => {
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
  };

  const completeHabit = async (habitId: string, userId: string) => {
    const today = new Date().toLocaleDateString('en-CA');
    console.log(`✅ completeHabit called for habitId: ${habitId} on ${today}`);
    
    try {
      const { error: insertError } = await supabase
        .from('habit_completions')
        .insert({
          habit_id: habitId,
          user_id: userId,
          completion_date: today
        });
        
      if (insertError) {
        if (insertError.code === '23505') {
          console.log(`⚠️ Habit ${habitId} already completed today`);
          return { error: 'Habit already completed today' };
        }
        throw insertError;
      }
      
      console.log(`✅ Completion record inserted for habit ${habitId}`);
      
      const streaks = await calculateStreak(habitId);
      
      console.log(`📤 Updating habit ${habitId} with streaks:`, streaks);
      
      await supabase
        .from('habits')
        .update({
          current_streak: streaks.current,
          longest_streak: Math.max(streaks.longest, streaks.current),
          last_completed: new Date().toLocaleDateString('en-CA'),
          completed: true
        })
        .eq('id', habitId);
      
      console.log(`✅ Habit ${habitId} updated successfully`);
      return { success: true, streaks };
      
    } catch (error) {
      console.error('❌ Error completing habit:', error);
      return { error: error instanceof Error ? error.message : 'An unexpected error occurred' };
    }
  };

  const uncompleteHabit = async (habitId: string) => {
    const today = new Date().toLocaleDateString('en-CA');
    console.log(`❌ uncompleteHabit called for habitId: ${habitId} on ${today}`);
    
    try {
      const { error: deleteError } = await supabase
        .from('habit_completions')
        .delete()
        .eq('habit_id', habitId)
        .eq('completion_date', today);
        
      if (deleteError) throw deleteError;
      
      console.log(`✅ Today's completion removed for habit ${habitId}`);
      
      const streaks = await calculateStreak(habitId);
      
      const { data: lastCompletion } = await supabase
        .from('habit_completions')
        .select('completion_date')
        .eq('habit_id', habitId)
        .order('completion_date', { ascending: false })
        .limit(1)
        .single();
      
      console.log(`📅 New last completion for habit ${habitId}:`, lastCompletion?.completion_date || 'none');
      
      await supabase
        .from('habits')
        .update({
          current_streak: streaks.current,
          longest_streak: streaks.longest,
          completed: false,
          last_completed: lastCompletion?.completion_date || null
        })
        .eq('id', habitId);
      
      console.log(`✅ Habit ${habitId} uncompleted successfully`);
      return { success: true, streaks };
      
    } catch (error) {
      console.error('❌ Error uncompleting habit:', error);
      return { error: error instanceof Error ? error.message : 'An unexpected error occurred' };
    }
  };

  const needsReset = (lastCompleted: string | null | undefined, completed: boolean) => {
    console.log("🔍 needsReset called with:", { lastCompleted, completed });
    
    if (completed && !lastCompleted) {
      console.log("⚠️ Habit marked as completed but no last_completed date - NEEDS RESET");
      return true;
    }
    
    if (!completed) {
      console.log("❌ Habit not completed - no reset needed");
      return false;
    }

    if (!lastCompleted) {
      console.log("❌ lastCompleted is null/undefined and not completed - no reset needed");
      return false;
    }
    
    
      
    // ✅ FIX: Compare date strings directly, not Date objects
    const today = new Date().toLocaleDateString('en-CA'); // Format: YYYY-MM-DD
    const lastCompletedDate = lastCompleted.split('T')[0]; // Extract just the date part
    
    console.log(`📅 Last completed: ${lastCompletedDate}`);
    console.log(`📅 Today: ${today}`);
    console.log(`🔄 Needs reset: ${lastCompletedDate !== today}`);
  
    
  return lastCompletedDate !== today;
  };


// services/habitService.ts



// ============================================
// DATA FETCHING
// ============================================

const fetchUserHabits = async (userId: string): Promise<Habit[]> => {
  const { data, error } = await supabase
    .from("habits")
    .select("*")
    .eq("user_id", userId)
    .eq("is_archived", false)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return data || [];
};

const getLastCompletionDate = async (habitId: string): Promise<string | null> => {
  const { data } = await supabase
    .from('habit_completions')
    .select('completion_date')
    .eq('habit_id', habitId)
    .order('completion_date', { ascending: false })
    .limit(1)
    .single();
  
  return data?.completion_date || null;
};

// ============================================
// ANALYSIS
// ============================================

const analyzeHabitState = async (habit: Habit): Promise<HabitAnalysis> => {
  const [completedToday, streaks, lastCompletionDate] = await Promise.all([
    isHabitCompletedToday(habit.id),
    calculateStreak(habit.id),
    getLastCompletionDate(habit.id)
  ]);
  
  return {
    completedToday,
    streaks,
    lastCompletionDate,
    needsReset: needsReset(habit.last_completed, habit.completed),
    hasStreakButNoDate: !habit.last_completed && habit.current_streak > 0,
    completedTodayButNotMarked: completedToday && !habit.completed,
    markedButNoCompletion: !completedToday && habit.completed
  };
};

// ============================================
// UPDATE STRATEGY
// ============================================

const isToday = (dateString: string | null): boolean => {
  if (!dateString) return false;
  return new Date(dateString).toDateString() === new Date().toDateString();
};

const determineRequiredUpdates = (habit: Habit, analysis: HabitAnalysis): UpdateStrategy => {
  const { completedToday, streaks, lastCompletionDate, needsReset, 
          hasStreakButNoDate, completedTodayButNotMarked, markedButNoCompletion } = analysis;
  
  if (hasStreakButNoDate) {
    return {
      shouldUpdate: true,
      updates: { last_completed: lastCompletionDate },
      reason: 'FIXING_MISSING_DATE'
    };
  }
  
  if (needsReset) {
    return {
      shouldUpdate: true,
      updates: {
        completed: false,
        current_streak: streaks.current,
        longest_streak: streaks.longest,
        last_completed: lastCompletionDate
      },
      reason: 'DAILY_RESET'
    };
  }
  
  if (completedTodayButNotMarked) {
    return {
      shouldUpdate: true,
      updates: {
        completed: true,
        current_streak: streaks.current,
        longest_streak: Math.max(streaks.longest, habit.longest_streak || 0),
        last_completed: new Date().toISOString()
      },
      reason: 'SYNC_COMPLETION'
    };
  }
  
  if (markedButNoCompletion) {
    return {
      shouldUpdate: true,
      updates: {
        completed: false,
        current_streak: streaks.current,
        longest_streak: streaks.longest,
        last_completed: lastCompletionDate
      },
      reason: 'FIX_INVALID_COMPLETION'
    };
  }
  
  const streakOutOfSync = streaks.current !== habit.current_streak || 
                          streaks.longest !== habit.longest_streak;
  const dateNeedsUpdate = completedToday && habit.completed && !isToday(habit.last_completed);
  
  if (streakOutOfSync || dateNeedsUpdate) {
    const updates: Partial<Habit> = {};
    
    if (streakOutOfSync) {
      updates.current_streak = streaks.current;
      updates.longest_streak = streaks.longest;
    }
    if (dateNeedsUpdate) {
      updates.last_completed = new Date().toLocaleDateString('en-CA');
    }
    
    return { shouldUpdate: true, updates, reason: 'STREAK_SYNC' };
  }
  
  return { shouldUpdate: false, updates: {}, reason: 'NO_CHANGES' };
};

// ============================================
// BATCH UPDATE
// ============================================

const batchUpdateHabits = async (updates: HabitUpdate[]): Promise<void> => {
  if (updates.length === 0) return;
  
  console.log(`📤 Updating ${updates.length} habits...`);
  
  await Promise.all(
    updates.map(async ({ id, title, updates: habitUpdates }) => {
      console.log(`📤 Updating "${title}":`, habitUpdates);
      
      const { error } = await supabase
        .from("habits")
        .update(habitUpdates)
        .eq("id", id);
      
      if (error) {
        console.error(`❌ Failed to update ${title}:`, error.message);
      } else {
        console.log(`✅ Successfully updated "${title}"`);
      }
    })
  );
};

// ============================================
// MAIN ORCHESTRATOR
// ============================================

const fetchHabitsFromDB = async (): Promise<void> => {
  console.log("🚀 fetchHabitsFromDB started");
  
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.log("❌ Not authenticated");
      router.push("/");
      setLoading(false);
      return;
    }
    
    const habitData = await fetchUserHabits(user.id);
    
    // Early return if no habits - set loading false immediately
    if (habitData.length === 0) {
      console.log("📝 No habits found");
      setHabits([]);
      setHabitIds([]);
      setFetchedHabits(true);
      setLoading(false);
      return;
    }
    
    // If habits exist, process them fully before setting loading false
    console.log(`📝 Processing ${habitData.length} habits`);
    
    const habitsToUpdate: HabitUpdate[] = [];
    
    for (const habit of habitData) {
      console.log(`\n========== "${habit.title}" ==========`);
      
      const analysis = await analyzeHabitState(habit);
      const updateStrategy = determineRequiredUpdates(habit, analysis);
      
      console.log(`Status: ${updateStrategy.reason}`);
      
      if (updateStrategy.shouldUpdate) {
        habitsToUpdate.push({
          id: habit.id,
          title: habit.title,
          updates: updateStrategy.updates
        });
      }
    }
    
    if (habitsToUpdate.length > 0) {
      await batchUpdateHabits(habitsToUpdate);
    }
    
    const freshHabits = await fetchUserHabits(user.id);
    setHabits(freshHabits);
    setHabitIds(freshHabits.map(h => h.id));
    setFetchedHabits(true);
    
    console.log("✅ fetchHabitsFromDB completed");
    
  } catch (error) {
    console.error("❌ Error in fetchHabitsFromDB:", error);
  } finally {
    // Only reached after all async operations complete (or error occurs)
    setLoading(false);
  }
};

  useEffect(() => {
    fetchHabitsFromDB();
  }, []);

//   useEffect(() => {
//       setLoading(false);
// }, [fetchedHabits]);

  const handleCheckboxChange = async (index: number, checked: boolean) => {
    const habitName = habits[index]?.title || 'Unknown';
    console.log(`\n📝 CHECKBOX CHANGE: "${habitName}" changed to ${checked ? 'CHECKED' : 'UNCHECKED'}`);
    console.log(`📊 Current streak before change: ${habits[index]?.current_streak}`);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log("❌ No user found, aborting");
      return;
    }
    
    // setCheckedStates(prev =>
    //   prev.map((item, i) => (i === index ? checked : item))
    // );
    setHabits(prevHabits =>
      prevHabits.map((habit, i) =>
        i === index
          ? { ...habit, completed: checked }
          : habit
      )
    );
    
    if (habitIds[index]) {
      let result;
      
      if (checked) {
        console.log(`✅ Completing habit "${habitName}"...`);
        result = await completeHabit(habitIds[index], user.id);
      } else {
        console.log(`❌ Uncompleting habit "${habitName}"...`);
        result = await uncompleteHabit(habitIds[index]);
      }
      
      console.log(`📤 Operation result:`, result);
      
      if (result?.error) {
        console.error(`❌ Error: ${result.error}`);
          setHabits(prevHabits =>
            prevHabits.map((habit, i) =>
              i === index
                ? { ...habit, completed: checked }
                : habit
            )
          );
      } else {
        console.log(`✅ Successfully ${checked ? 'completed' : 'uncompleted'} habit`);
        
        const habit = habits[index];
        console.log(`📊 Before state update - habit streak: ${habit.current_streak}`);
        console.log(`📊 Result streaks:`, result.streaks);
        
      setHabits(prevHabits =>
        prevHabits.map((habit, i) =>
          i === index
            ? {
                ...habit,
                completed: checked,
                current_streak: result.streaks?.current || 0,
                longest_streak: result.streaks?.longest || habit.longest_streak || 0,
                last_completed: checked ? new Date().toLocaleDateString('en-CA') : habit.last_completed
              }
            : habit
        )
      );
        
        console.log(`📊 Updated state - New current streak: ${result.streaks?.current}`);
      }
    }
  }

  const getStreakForHabit = (index: number) => {
    const streak = habits[index]?.current_streak || 0;
    console.log(`📊 getStreakForHabit(${index}): "${habits[index]?.title}" = ${streak}`);
    return streak;
  };

  // Calculate completion statistics
  const completedCount = habits.filter(h => h.completed).length;
  const totalCount = habits.length;
  const completionPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  if (loading || !fetchedHabits) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-pulse text-lg text-white">Loading habits...</div>
      </div>
    );
  }

  return (
    <div className="page-dark min-h-screen relative overflow-hidden">
      {/* Confetti Animation */}
      {showCelebration && (
        <>
          <div className="fixed inset-0 pointer-events-none z-50">
            {confetti.map((piece) => (
              <div
                key={piece.id}
                className="absolute w-2 h-2 rounded-full animate-confetti"
                style={{
                  left: `${piece.left}%`,
                  top: '-10px',
                  backgroundColor: ['#22c55e', '#fbbf24', '#3b82f6', '#ef4444', '#a855f7'][piece.id % 5],
                  animationDelay: `${piece.delay}s`,
                  animationDuration: `${piece.duration}s`
                }}
              />
            ))}
          </div>
        </>
      )}

      <style jsx>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        
        @keyframes slide-down {
          0% {
            transform: translateY(-100%);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes slide-up {
          0% {
            transform: translateY(0);
            opacity: 1;
          }
          100% {
            transform: translateY(-100%);
            opacity: 0;
          }
        }
        
        .animate-confetti {
          animation: confetti-fall linear forwards;
        }
        
        .animate-slide-down {
          animation: slide-down 1s ease-out forwards;
        }
        
        .animate-slide-up {
          animation: slide-up 1s ease-in forwards;
        }
      `}</style>

      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center px-4 pb-20 gap-8 sm:p-20 sm:gap-16 font-[family-name:var(--font-geist-sans)] w-full">
        <main className="flex flex-col gap-8 row-start-2 items-center w-full max-w-4xl">
          <h1 className="w-full flex justify-center text-4xl sm:text-6xl font-bold mb-4 text-green-500">Habits</h1>

          {/* Celebration Banner */}
          {(showCelebration || celebrationAnimating) && (
            <div className={`w-full px-4 ${showCelebration ? 'animate-slide-down' : 'animate-slide-up'}`}>
              <div className="bg-gradient-to-r from-green-200 via-green-500 to-green-600 text-white px-4 py-4 rounded-xl shadow-lg text-center border-2 border-yellow-300">
                <div className="text-3xl mb-1">⭐</div>
                <div className="text-lg sm:text-xl font-bold">Congratulations!</div>
                <div className="text-sm sm:text-base">
                  You completed all {totalCount} habit{totalCount !== 1 ? 's' : ''}!
                </div>
                <div className="text-base sm:text-lg font-bold text-yellow-200">
                  Gold Star Day! ⭐
                </div>
              </div>
            </div>
          )}

          {/* Habits List */}
          <div className="w-full flex justify-center px-2 sm:px-4">
            {habits.length === 0 ? (
              <div className="w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl">
                <p className="text-white-500 text-center">No habits found. Add some habits!</p>
              </div>
            ) : (
              <div className="w-full max-w-4xl">
                {/* Header Row */}
                <div className="flex gap-2 sm:gap-4 mb-6">
                  <div className="flex-1">
                    <div className="text-xl font-semibold text-green-500 invisible">
                      Habits
                    </div>
                  </div>
                  <div className="w-16 sm:w-20">
                    <div className="text-lg sm:text-xl font-semibold text-green-500 text-center">
                      Streak
                    </div>
                  </div>
                </div>

                {/* Habit Rows */}
                <div className="flex flex-col gap-2">
                  {habits.map((habit, idx) => (
                    <div key={habit.id} className="flex items-center gap-2 sm:gap-4">
                      {/* Habit Cell - Takes up most of the space */}
                      <div className="flex-1 min-w-0">
                        <div
                          className="w-full px-3 py-3 sm:px-4 sm:py-4 rounded-lg border-2 transition-transform duration-200"
                          style={{
                            backgroundColor: "rgba(34, 197, 94, 0.2)",
                            borderColor: "rgba(34, 197, 94, 1)",
                          }}
                        >
                          <Checkbox
                            label={habit.title}
                            checked={habit.completed}
                            onChange={checked => handleCheckboxChange(idx, checked)}
                          />
                        </div>
                      </div>

                      {/* Streak Cell - Compact size */}
                      <div className="w-16 sm:w-20 flex-shrink-0">
                        <div 
                          className="border-2 rounded-lg p-2 sm:p-3 flex items-center justify-center h-[56px] sm:h-[64px] transition-transform duration-200"
                          style={{
                            backgroundColor: "rgba(34, 197, 94, 0.05)",
                            borderColor: "rgba(34, 197, 94, 1)",
                          }}
                        >
                          <div className="flex items-center justify-center">
                            <span className="text-base sm:text-lg font-bold text-white">
                              {habit.current_streak || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Progress Bar */}
                <div className="mt-8 w-full">
                  <div className="mb-3">
                    <div className="text-center text-sm sm:text-base text-white font-medium">
                      Status: {completedCount}/{totalCount} habits completed
                    </div>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3 sm:h-4 overflow-hidden border-2 border-green-600 mb-10">
                    <div 
                      className="bg-green-500 h-full transition-all duration-500 ease-out rounded-full"
                      style={{ width: `${completionPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
        
        {/* Edit/Add Habits button */}
        <div className="w-full flex justify-center mb-8 row-start-3">
          <Link href="/add-habit">
            <button className={activeButtonClass}>
              {habits.length > 0 ? "Edit Habits": "Add Habits"}
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}