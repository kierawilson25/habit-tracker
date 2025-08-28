"use client";
import Image from "next/image";
import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Checkbox from "@/app/components/Checkbox";
import Link from "next/link";
import { useEffect } from "react";
import "../../utils/styles/global.css"; // Import global styles
import { createClient } from "@/utils/supabase/client";

interface Habit {
  id: string;
  title: string;
  completed: boolean;
  created_at: string;
  last_completed?: string | null;
  current_streak?: number;  // Now we'll use the real streak data
  longest_streak?: number;
}

export default function Home() {
  const [habits, setHabits] = useState<Habit[]>([]); // Changed to store full habit objects
  const [checkedStates, setCheckedStates] = useState<boolean[]>([]);
  const [habitIds, setHabitIds] = useState<string[]>([]);
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const activeButtonClass = "bg-green-600 text-white rounded px-4 py-2 hover:bg-green-700 transition-colors duration-200"
  
  const supabase = createClient();

  // STREAK CALCULATION FUNCTIONS
  
  // Calculate current streak for a habit - FIXED VERSION
  const calculateStreak = async (habitId: string) => {
    const { data: completions, error } = await supabase
      .from('habit_completions')
      .select('completion_date')
      .eq('habit_id', habitId)
      .order('completion_date', { ascending: false });
      
    if (error || !completions?.length) {
      return { current: 0, longest: 0 };
    }
    
    let currentStreak = 0;
    let longestStreak = 0;
    
    // Convert completions to date strings for easier comparison
    const completionDates = completions.map(c => new Date(c.completion_date).toISOString().split('T')[0]);
    const today = new Date().toISOString().split('T')[0];
    
    // Calculate current streak - check if the most recent completion leads to today or is recent
    if (completionDates.length > 0) {
      const mostRecentCompletion = completionDates[0];
      const mostRecentDate = new Date(mostRecentCompletion);
      const todayDate = new Date(today);
      
      // Current streak is the most recent consecutive sequence that either:
      // 1. Includes today, OR 
      // 2. Ended yesterday (allowing for "unchecking today" scenario)
      let checkDate = new Date(mostRecentDate);
      currentStreak = 1; // Start with the most recent completion
      
      // Go backwards from the most recent completion
      for (let i = 1; i < completionDates.length; i++) {
        const expectedPrevDay = new Date(checkDate);
        expectedPrevDay.setDate(expectedPrevDay.getDate() - 1);
        const expectedDateStr = expectedPrevDay.toISOString().split('T')[0];
        
        if (completionDates[i] === expectedDateStr) {
          currentStreak++;
          checkDate = expectedPrevDay;
        } else {
          // Gap found, stop current streak calculation
          break;
        }
      }
      
      // If the most recent completion is more than 1 day old, reset current streak
      const daysDiff = Math.floor((todayDate.getTime() - mostRecentDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff > 1) {
        currentStreak = 0;
      }
    }
    
    // Calculate longest streak by finding all consecutive sequences
    let i = 0;
    while (i < completionDates.length) {
      let tempStreak = 1;
      let currentDate = new Date(completionDates[i]);
      
      // Look for consecutive days
      for (let j = i + 1; j < completionDates.length; j++) {
        const nextDate = new Date(completionDates[j]);
        const expectedPrevDay = new Date(currentDate);
        expectedPrevDay.setDate(expectedPrevDay.getDate() - 1);
        
        if (nextDate.toISOString().split('T')[0] === expectedPrevDay.toISOString().split('T')[0]) {
          tempStreak++;
          currentDate = nextDate;
        } else {
          break;
        }
      }
      
      longestStreak = Math.max(longestStreak, tempStreak);
      
      // Move to the next non-consecutive date
      i += tempStreak;
    }
    
    return { current: currentStreak, longest: longestStreak };
  };

  // Check if habit was completed today
  const isHabitCompletedToday = async (habitId: string) => {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('habit_completions')
      .select('id')
      .eq('habit_id', habitId)
      .eq('completion_date', today)
      .single();
      
    return !!data && !error;
  };

  // Complete habit and update streak
  const completeHabit = async (habitId: string, userId: string) => {
    const today = new Date().toISOString().split('T')[0];
    
    try {
      // Insert completion record
      const { error: insertError } = await supabase
        .from('habit_completions')
        .insert({
          habit_id: habitId,
          user_id: userId,
          completion_date: today
        });
        
      if (insertError) {
        if (insertError.code === '23505') {
          return { error: 'Habit already completed today' };
        }
        throw insertError;
      }
      
      // Calculate and update streaks
      const streaks = await calculateStreak(habitId);
      
      await supabase
        .from('habits')
        .update({
          current_streak: streaks.current,
          longest_streak: Math.max(streaks.longest, streaks.current),
          last_completed: new Date().toISOString(),
          completed: true
        })
        .eq('id', habitId);
        
      return { success: true, streaks };
      
    } catch (error) {
      console.error('Error completing habit:', error);
      return { error: error instanceof Error ? error.message : 'An unexpected error occurred' };
    }
  };

  // Uncomplete habit (remove today's completion)
  const uncompleteHabit = async (habitId: string) => {
    const today = new Date().toISOString().split('T')[0];
    
    try {
      // Remove today's completion
      const { error: deleteError } = await supabase
        .from('habit_completions')
        .delete()
        .eq('habit_id', habitId)
        .eq('completion_date', today);
        
      if (deleteError) throw deleteError;
      
      // Recalculate streaks
      const streaks = await calculateStreak(habitId);
      
      // Update last_completed to the most recent completion date (if any)
      const { data: lastCompletion } = await supabase
        .from('habit_completions')
        .select('completion_date')
        .eq('habit_id', habitId)
        .order('completion_date', { ascending: false })
        .limit(1)
        .single();
      
      await supabase
        .from('habits')
        .update({
          current_streak: streaks.current,
          longest_streak: streaks.longest,
          completed: false,
          last_completed: lastCompletion?.completion_date || null
        })
        .eq('id', habitId);
        
      return { success: true, streaks };
      
    } catch (error) {
      console.error('Error uncompleting habit:', error);
      return { error: error instanceof Error ? error.message : 'An unexpected error occurred' };
    }
  };

  // FIXED: Function to check if habits need to be reset (daily reset at midnight)
  const needsReset = (lastCompleted: string | null | undefined, completed: boolean) => {
    console.log("🔍 needsReset called with:", { lastCompleted, completed });
    
    if (!completed) {
      console.log("❌ Habit not completed - no reset needed");
      return false;
    }
    
    if (!lastCompleted) {
      console.log("⚠️ Habit completed but no last_completed date - needs reset");
      return true; // If completed but no timestamp, definitely needs reset
    }
    
    const lastCompletedDate = new Date(lastCompleted);
    const today = new Date();
    
    if (isNaN(lastCompletedDate.getTime())) {
      console.log("❌ Invalid date format - needs reset");
      return true; // If invalid date, reset to be safe
    }
    
    const lastCompletedString = lastCompletedDate.toDateString();
    const todayString = today.toDateString();
    
    // Reset if last completed was NOT today (i.e., yesterday or earlier)
    const shouldReset = lastCompletedString !== todayString;
    
    console.log("📅 Last completed:", lastCompletedString);
    console.log("📅 Today:", todayString);
    console.log("🔄 Needs reset:", shouldReset);
    
    return shouldReset;
  };

  // Function to fetch habits from database
  const fetchHabitsFromDB = async () => {
    console.log("🚀 fetchHabitsFromDB started on HOME page");
    
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.log("❌ Not authenticated, redirecting to login");
      router.push("/");
      setLoading(false);
      return;
    }

    console.log("✅ User authenticated:", user.id);

    // Fetch habits with streak data
    const { data: habitData, error: fetchError } = await supabase
      .from("habits")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_archived", false)
      .order("created_at", { ascending: true });

    if (fetchError) {
      console.error("❌ Failed to fetch habits:", fetchError.message);
      setLoading(false);
      return;
    }

    console.log("📊 Raw habit data from DB:", habitData);

    if (habitData && habitData.length > 0) {
      console.log(`📝 Processing ${habitData.length} habits`);
      
      // Check if any habits need to be reset and verify completion status
      const habitsToUpdate: Array<{id: string, updates: any}> = [];
      const updatedHabits = await Promise.all(
        habitData.map(async (habit: Habit, index: number) => {
          console.log(`\n--- Processing habit ${index + 1}: "${habit.title}" ---`);
          
          // Check if habit was actually completed today
          const completedToday = await isHabitCompletedToday(habit.id);
          
          let updatedHabit = { ...habit };
          
          if (needsReset(habit.last_completed, habit.completed)) {
            console.log("🔄 This habit will be reset!");
            habitsToUpdate.push({
              id: habit.id,
              updates: {
                completed: false,
                last_completed: null
              }
            });
            updatedHabit = { ...habit, completed: false };
          } else if (completedToday && !habit.completed) {
            // Habit was completed today but not marked as completed in habits table
            console.log("✅ Habit was completed today, updating status");
            const streaks = await calculateStreak(habit.id);
            const updates = {
              completed: true,
              current_streak: streaks.current,
              longest_streak: Math.max(streaks.longest, habit.longest_streak || 0),
              last_completed: new Date().toISOString()
            };
            habitsToUpdate.push({ id: habit.id, updates });
            updatedHabit = { ...habit, ...updates };
          } else if (!completedToday && habit.completed) {
            // Habit is marked completed but no completion record for today
            console.log("❌ No completion record for today, marking as incomplete and recalculating");
            const streaks = await calculateStreak(habit.id);
            
            // Get the most recent completion date
            const { data: lastCompletion } = await supabase
              .from('habit_completions')
              .select('completion_date')
              .eq('habit_id', habit.id)
              .order('completion_date', { ascending: false })
              .limit(1)
              .single();
            
            const updates = {
              completed: false,
              current_streak: streaks.current,
              longest_streak: streaks.longest,
              last_completed: lastCompletion?.completion_date || null
            };
            habitsToUpdate.push({ id: habit.id, updates });
            updatedHabit = { ...habit, ...updates };
          }
          
          return updatedHabit;
        })
      );

      // Update database if any habits need updates
      if (habitsToUpdate.length > 0) {
        console.log("📤 Updating database for", habitsToUpdate.length, "habits...");
        
        // Update each habit individually to handle different update sets
        for (const { id, updates } of habitsToUpdate) {
          const { error: updateError } = await supabase
            .from("habits")
            .update(updates)
            .eq("id", id);

          if (updateError) {
            console.error(`❌ Failed to update habit ${id}:`, updateError.message);
          } else {
            console.log(`✅ Successfully updated habit ${id}`);
          }
        }
      }

      // Set state with fetched/updated data
      console.log("📋 Setting component state...");
      setHabits(updatedHabits);
      setHabitIds(updatedHabits.map((habit: Habit) => habit.id));
      setCheckedStates(updatedHabits.map((habit: Habit) => habit.completed));
      
      console.log("Final checked states:", updatedHabits.map((habit: Habit) => habit.completed));
    } else {
      console.log("📝 No habits found, initializing empty arrays");
      setHabits([]);
      setHabitIds([]);
      setCheckedStates([]);
    }

    console.log("✅ fetchHabitsFromDB completed on HOME page");
    setLoading(false);
  };

  // USE EFFECTS
  useEffect(() => {
    fetchHabitsFromDB();
  }, []);

  useEffect(() => {
    if (checkedStates.length === 0) return;
    setLSCheckedStates(checkedStates);
  }, [checkedStates]);

  // HELPER FUNCTIONS

  const setLSCheckedStates = (setCheckedStates: boolean[]) => {
    localStorage.setItem("checkedStates", JSON.stringify(setCheckedStates))
  }

  // Updated function to handle checkbox state changes with streak tracking
  const handleCheckboxChange = async (index: number, checked: boolean) => {
    console.log(`📝 Checkbox changed for habit ${index}: ${checked}`);
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    // Optimistically update UI
    setCheckedStates(prev =>
      prev.map((item, i) => (i === index ? checked : item))
    );
    
    if (habitIds[index]) {
      let result;
      
      if (checked) {
        // Complete the habit
        result = await completeHabit(habitIds[index], user.id);
      } else {
        // Uncomplete the habit
        result = await uncompleteHabit(habitIds[index]);
      }
      
      if (result.error) {
        console.error("❌ Failed to update habit:", result.error);
        // Revert the optimistic update
        setCheckedStates(prev =>
          prev.map((item, i) => (i === index ? !checked : item))
        );
      } else {
        console.log("✅ Successfully updated habit completion");
        // Update the habit in state with new streak data
        setHabits(prev => 
          prev.map((habit, i) => 
            i === index 
              ? { 
                  ...habit, 
                  completed: checked,
                  current_streak: result.streaks?.current || 0,
                  longest_streak: result.streaks?.longest || habit.longest_streak || 0
                }
              : habit
          )
        );
      }
    }
  }

  // Get actual streak for habit (no longer a placeholder)
  const getStreakForHabit = (index: number) => {
    return habits[index]?.current_streak || 0;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading habits...</div>
      </div>
    );
  }

  return (
    <div className="page-dark min-h-screen">
      
      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center px-4 pb-20 gap-8 sm:p-20 sm:gap-16 font-[family-name:var(--font-geist-sans)] w-full">
        <main className="flex flex-col gap-8 row-start-2 items-center w-full max-w-4xl">
          <h1 className="w-full flex justify-center text-4xl sm:text-6xl font-bold mb-4 text-green-500">Habits</h1>

          {/* start check boxes */}
          <div className="w-full flex justify-center px-4">
            {habits.length === 0 ? (
              <div className="w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl">
                <p className="text-white-500 text-center">No habits found. Add some habits!</p>
              </div>
            ) : (
              <div className="w-full max-w-4xl">
                {/* Header Row - Only show when there are habits */}
                <div className="flex gap-8 mb-6">
                  <div className="flex-1">
                    {/* Invisible header for alignment */}
                    <div className="text-xl font-semibold text-green-500 invisible">
                      Habits
                    </div>
                  </div>
                  <div className="w-36">
                    <div className="text-xl font-semibold text-green-500 text-center">
                      Streak
                    </div>
                  </div>
                </div>

                {/* Habit Rows */}
                <div className="flex flex-col gap-2">
                  {habits.map((habit, idx) => (
                    <div key={habit.id} className="flex items-center gap-8">
                      {/* Habit Cell */}
                      <div className="flex-1">
                        <div
                          className="w-full px-4 py-4 rounded-lg border-2 hover:scale-105 transition-transform duration-200"
                          style={{
                            backgroundColor: "rgba(34, 197, 94, 0.2)",
                            borderColor: "rgba(34, 197, 94, 1)",
                          }}
                        >
                          <Checkbox
                            label={habit.title}
                            checked={checkedStates[idx] ?? false}
                            onChange={checked => handleCheckboxChange(idx, checked)}
                          />
                        </div>
                      </div>

                      {/* Streak Cell */}
                      <div className="w-36">
                        <div 
                          className="border-2 rounded-lg p-4 flex items-center justify-center h-[72px] transition-transform duration-200"
                          style={{
                            backgroundColor: "rgba(34, 197, 94, 0.05)",
                            borderColor: "rgba(34, 197, 94, 1)",
                          }}
                        >
                          <div className="flex items-center justify-center">
                            <span className="text-lg font-bold text-white">
                              {getStreakForHabit(idx)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
        {/* Centered Add Habit button at the bottom */}
        <div className="w-full flex justify-center mb-8 row-start-3">
          <Link href="/add-habit">
            <button className={activeButtonClass}>
              Add Habit
            </button>
            </Link>
        </div>
      </div>
    </div>
  );
}