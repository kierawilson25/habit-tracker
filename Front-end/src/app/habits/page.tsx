"use client";
import Image from "next/image";
import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";
import "../../utils/styles/global.css";
import { createClient } from "@/utils/supabase/client";
import { Button, H1, HabitCell, StreakCell, PopupBanner, Loading } from "@/components";
import { useStreakCalculation } from "@/hooks";
import { getHabitCompletionMessage } from "@/utils/habitMessages";
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
  const [celebrationMessage, setCelebrationMessage] = useState<{ title: string; message: string; badge?: string; icon?: string }>({ title: "", message: "" });

  const supabase = createClient();
  const { calculateStreak, isCompletedToday: isHabitCompletedToday, getLastCompletionDate } = useStreakCalculation();

  // Celebration effect - triggers for ALL completion levels with UNHINGED messages!
  useEffect(() => {
    const completedCount = habits.filter(h => h.completed).length;
    const totalCount = habits.length;

    if (totalCount > 0 && !showCelebration && !celebrationAnimating) {
      // Get unhinged message based on completion level
      const message = getHabitCompletionMessage(completedCount, totalCount);
      setCelebrationMessage(message);

      setShowCelebration(true);
      setCelebrationAnimating(true);

      // Only show confetti for 100% completion (Gold Star Day vibes only!)
      if (completedCount === totalCount) {
        const newConfetti = Array.from({ length: 50 }, (_, i) => ({
          id: i,
          left: Math.random() * 100,
          delay: Math.random() * 0.5,
          duration: 2 + Math.random() * 1
        }));
        setConfetti(newConfetti);
      }

      // Show message for 4 seconds
      setTimeout(() => {
        setShowCelebration(false);
      }, 4000);

      // Fully hide after fade out
      setTimeout(() => {
        setConfetti([]);
        setCelebrationAnimating(false);
      }, 6000);
    }
  }, [habits, showCelebration, celebrationAnimating]);

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
    return <Loading text="Loading habits..." />
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
          <H1 text="Habits" />
          {/* Celebration Banner - Now with UNHINGED energy */}
          <PopupBanner
            isVisible={showCelebration}
            isAnimating={celebrationAnimating}
            title={celebrationMessage.title}
            message={celebrationMessage.message}
            badge={celebrationMessage.badge}
            icon={celebrationMessage.icon}
          />
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
                      <HabitCell
                        title={habit.title}
                        checked={habit.completed}
                        onChange={checked => handleCheckboxChange(idx, checked)}
                      />

                      {/* Streak Cell - Compact size */}
                      <StreakCell streak={habit.current_streak || 0} />
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
          <Button href="/add-habit">
            {habits.length > 0 ? "Edit Habits" : "Add Habits"}
          </Button>
        </div>
      </div>
    </div>
  );
}