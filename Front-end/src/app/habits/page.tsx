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
  current_streak?: number;
  longest_streak?: number;
}

export default function Home() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [checkedStates, setCheckedStates] = useState<boolean[]>([]);
  const [habitIds, setHabitIds] = useState<string[]>([]);
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const activeButtonClass = "bg-green-600 text-white rounded px-4 py-2 hover:bg-green-700 transition-colors duration-200"
  
  const supabase = createClient();

  // ONE-TIME FIX: Function to repair all last_completed values
  const repairLastCompletedDates = async () => {
    console.log("🔧 REPAIR FUNCTION: Starting to fix all last_completed dates...");
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const { data: habits } = await supabase
      .from("habits")
      .select("*")
      .eq("user_id", user.id);
    
    if (!habits) return;
    
    for (const habit of habits) {
      console.log(`🔧 Checking habit: "${habit.title}"`);
      
      // Get the most recent completion
      const { data: lastCompletion } = await supabase
        .from('habit_completions')
        .select('completion_date')
        .eq('habit_id', habit.id)
        .order('completion_date', { ascending: false })
        .limit(1)
        .single();
      
      if (lastCompletion) {
        console.log(`  📅 Found last completion: ${lastCompletion.completion_date}`);
        
        if (habit.last_completed !== lastCompletion.completion_date) {
          console.log(`  ⚠️ Updating from ${habit.last_completed} to ${lastCompletion.completion_date}`);
          
          const { error } = await supabase
            .from("habits")
            .update({ last_completed: lastCompletion.completion_date })
            .eq("id", habit.id);
          
          if (!error) {
            console.log(`  ✅ Updated successfully`);
          } else {
            console.log(`  ❌ Error updating:`, error);
          }
        } else {
          console.log(`  ✅ Already correct`);
        }
      } else {
        console.log(`  ⚠️ No completions found`);
        
        if (habit.last_completed) {
          console.log(`  🔧 Clearing incorrect last_completed date`);
          await supabase
            .from("habits")
            .update({ last_completed: null })
            .eq("id", habit.id);
        }
      }
    }
    
    console.log("🔧 REPAIR FUNCTION: Completed!");
  };

  // STREAK CALCULATION FUNCTIONS
  
  // Calculate current streak for a habit - FIXED VERSION
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
    
    // Convert completions to date strings for easier comparison
    const completionDates = completions.map(c => new Date(c.completion_date).toISOString().split('T')[0]);
    const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD format in local timezone
    
    console.log(`📅 Today's date: ${today}`);
    console.log(`📅 Most recent completion: ${completionDates[0]}`);
    
    // Calculate current streak
    if (completionDates.length > 0) {
      const mostRecentCompletion = completionDates[0];
      const mostRecentDate = new Date(mostRecentCompletion);
      const todayDate = new Date(today);
      
      // Calculate days difference
      const daysDiff = Math.floor((todayDate.getTime() - mostRecentDate.getTime()) / (1000 * 60 * 60 * 24));
      console.log(`📅 Days since last completion: ${daysDiff}`);
      
      // If last completion was more than 1 day ago, streak is broken
      if (daysDiff > 1) {
        console.log(`❌ Streak broken - last completion was ${daysDiff} days ago`);
        currentStreak = 0;
      } else {
        // Count consecutive days backwards from most recent
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
    
    // Calculate longest streak
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

  // Check if habit was completed today
  const isHabitCompletedToday = async (habitId: string) => {
    const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD format in local timezone
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

  // Complete habit and update streak
  const completeHabit = async (habitId: string, userId: string) => {
    const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD format in local timezone
    console.log(`✅ completeHabit called for habitId: ${habitId} on ${today}`);
    
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
          console.log(`⚠️ Habit ${habitId} already completed today`);
          return { error: 'Habit already completed today' };
        }
        throw insertError;
      }
      
      console.log(`✅ Completion record inserted for habit ${habitId}`);
      
      // Calculate and update streaks
      const streaks = await calculateStreak(habitId);
      
      console.log(`📤 Updating habit ${habitId} with streaks:`, streaks);
      
      await supabase
        .from('habits')
        .update({
          current_streak: streaks.current,
          longest_streak: Math.max(streaks.longest, streaks.current),
          last_completed: new Date().toLocaleDateString('en-CA'), // Local timezone date
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

  // Uncomplete habit (remove today's completion)
  const uncompleteHabit = async (habitId: string) => {
    const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD format in local timezone
    console.log(`❌ uncompleteHabit called for habitId: ${habitId} on ${today}`);
    
    try {
      // Remove today's completion
      const { error: deleteError } = await supabase
        .from('habit_completions')
        .delete()
        .eq('habit_id', habitId)
        .eq('completion_date', today);
        
      if (deleteError) throw deleteError;
      
      console.log(`✅ Today's completion removed for habit ${habitId}`);
      
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

  // Function to check if habits need to be reset (daily reset at midnight)
  const needsReset = (lastCompleted: string | null | undefined, completed: boolean) => {
    console.log("🔍 needsReset called with:", { lastCompleted, completed });
    
    // If habit is marked as completed but has no last_completed date, it MUST be reset
    if (completed && !lastCompleted) {
      console.log("⚠️ Habit marked as completed but no last_completed date - NEEDS RESET");
      return true;
    }
    
    // If not completed, no reset needed
    if (!completed) {
      console.log("❌ Habit not completed - no reset needed");
      return false;
    }

    if (!lastCompleted) {
      console.log("❌ lastCompleted is null/undefined and not completed - no reset needed");
      return false;
    }
    
    // If we have a last_completed date, check if it's from today
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
    console.log("📅 Current date/time:", new Date().toLocaleDateString('en-CA'), "Local timezone");
    
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
    console.log("🔍 Checking last_completed values:");
    habitData?.forEach(h => {
      console.log(`  - "${h.title}": last_completed=${h.last_completed}, completed=${h.completed}, current_streak=${h.current_streak}`);
    });

    if (habitData && habitData.length > 0) {
      console.log(`📝 Processing ${habitData.length} habits`);
      
      // Check if any habits need to be reset and verify completion status
      const habitsToUpdate: Array<{id: string, updates: any}> = [];
      const updatedHabits = await Promise.all(
        habitData.map(async (habit: Habit, index: number) => {
          console.log(`\n========== Processing habit ${index + 1}: "${habit.title}" ==========`);
          console.log(`📊 Initial state:`, {
            completed: habit.completed,
            last_completed: habit.last_completed,
            current_streak: habit.current_streak,
            longest_streak: habit.longest_streak
          });
          
          // Check if habit was actually completed today
          const completedToday = await isHabitCompletedToday(habit.id);
          
          let updatedHabit = { ...habit };
          
          // First priority: Fix missing last_completed if habit has completions
          if (!habit.last_completed && habit.current_streak && (habit.current_streak > 0 || completedToday)) {
            console.log("⚠️ FIXING: Habit has streak/completion but no last_completed date!");
            
            // Get the most recent completion date
            const { data: lastCompletion } = await supabase
              .from('habit_completions')
              .select('completion_date')
              .eq('habit_id', habit.id)
              .order('completion_date', { ascending: false })
              .limit(1)
              .single();
            
            if (lastCompletion) {
              console.log(`📅 Found last completion: ${lastCompletion.completion_date}`);
              habit.last_completed = lastCompletion.completion_date;
            }
          }
          
          // Now check if needs reset based on last_completed date
          if (needsReset(habit.last_completed, habit.completed)) {
            console.log("🔄 RESETTING: This habit needs to be reset!");
            
            // Also recalculate streaks when resetting
            const streaks = await calculateStreak(habit.id);
            
            // Get the actual last completion date (not today)
            const { data: lastCompletion } = await supabase
              .from('habit_completions')
              .select('completion_date')
              .eq('habit_id', habit.id)
              .order('completion_date', { ascending: false })
              .limit(1)
              .single();
            
            habitsToUpdate.push({
              id: habit.id,
              updates: {
                completed: false,
                current_streak: streaks.current,
                longest_streak: streaks.longest,
                last_completed: lastCompletion?.completion_date || null
              }
            });
            updatedHabit = { 
              ...habit, 
              completed: false,
              current_streak: streaks.current,
              longest_streak: streaks.longest,
              last_completed: lastCompletion?.completion_date || null
            };
          } 
          // If it passed needsReset but there's a mismatch between completed status and actual completion
          else if (completedToday && !habit.completed) {
            // Habit was completed today but not marked as completed in habits table
            console.log("✅ SYNCING: Habit was completed today but not marked, updating status");
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
            // This shouldn't happen if needsReset works correctly, but as a safety check
            console.log("❌ FIXING: No completion record for today but marked as completed");
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
          } else {
            console.log("✅ NO CHANGES NEEDED for this habit");
            // Even if no changes needed, ensure streak data is accurate
            const streaks = await calculateStreak(habit.id);
            
            // Also check if last_completed needs updating
            let needsUpdate = false;
            const updates: any = {};
            
            if (streaks.current !== habit.current_streak || streaks.longest !== habit.longest_streak) {
              console.log("📊 STREAK UPDATE: Streak data out of sync, updating");
              updates.current_streak = streaks.current;
              updates.longest_streak = streaks.longest;
              needsUpdate = true;
            }
            
            // If habit is completed today but last_completed isn't today, fix it
            if (completedToday && habit.completed) {
              const today = new Date().toLocaleDateString('en-CA'); // Local timezone date
              const lastCompletedDate = habit.last_completed ? new Date(habit.last_completed).toDateString() : null;
              const todayDateString = new Date().toDateString();
              
              if (lastCompletedDate !== todayDateString) {
                console.log("📅 FIXING: Updating last_completed to today");
                updates.last_completed = today;
                needsUpdate = true;
              }
            }
            
            if (needsUpdate) {
              habitsToUpdate.push({ id: habit.id, updates });
              updatedHabit = { ...habit, ...updates };
            }
          }
          
          console.log(`📊 Final state for "${habit.title}":`, {
            completed: updatedHabit.completed,
            current_streak: updatedHabit.current_streak,
            longest_streak: updatedHabit.longest_streak
          });
          console.log(`========== End processing "${habit.title}" ==========\n`);
          
          return updatedHabit;
        })
      );

      // Update database if any habits need updates
      if (habitsToUpdate.length > 0) {
        console.log(`\n📤 UPDATING DATABASE for ${habitsToUpdate.length} habits...`);
        
        // Update each habit individually to handle different update sets
        for (const { id, updates } of habitsToUpdate) {
          const habitName = habitData.find(h => h.id === id)?.title || 'Unknown';
          console.log(`📤 Updating "${habitName}" (${id}) with:`, updates);
          
          const { error: updateError } = await supabase
            .from("habits")
            .update(updates)
            .eq("id", id);

          if (updateError) {
            console.error(`❌ Failed to update habit ${id}:`, updateError.message);
          } else {
            console.log(`✅ Successfully updated habit "${habitName}"`);
          }
        }
      } else {
        console.log("\n✅ No habits needed updating");
      }

      // Set state with fetched/updated data
      console.log("\n📋 Setting component state...");
      console.log("Final habit states:", updatedHabits.map((h: Habit) => ({
        title: h.title,
        completed: h.completed,
        current_streak: h.current_streak,
        last_completed: h.last_completed
      })));
      
      setHabits(updatedHabits);
      setHabitIds(updatedHabits.map((habit: Habit) => habit.id));
      setCheckedStates(updatedHabits.map((habit: Habit) => habit.completed));
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
    // Uncomment the next line to run the repair function ONCE
    // repairLastCompletedDates().then(() => fetchHabitsFromDB());
    
    // Normal flow
    fetchHabitsFromDB();
  }, []);

  // Updated function to handle checkbox state changes with streak tracking
  const handleCheckboxChange = async (index: number, checked: boolean) => {
    const habitName = habits[index]?.title || 'Unknown';
    console.log(`\n📝 CHECKBOX CHANGE: "${habitName}" changed to ${checked ? 'CHECKED' : 'UNCHECKED'}`);
    console.log(`📊 Current streak before change: ${habits[index]?.current_streak}`);
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log("❌ No user found, aborting");
      return;
    }
    
    // Optimistically update UI
    setCheckedStates(prev =>
      prev.map((item, i) => (i === index ? checked : item))
    );
    
    if (habitIds[index]) {
      let result;
      
      if (checked) {
        // Complete the habit
        console.log(`✅ Completing habit "${habitName}"...`);
        result = await completeHabit(habitIds[index], user.id);
      } else {
        // Uncomplete the habit
        console.log(`❌ Uncompleting habit "${habitName}"...`);
        result = await uncompleteHabit(habitIds[index]);
      }
      
      if (result.error) {
        console.error(`❌ Failed to update habit "${habitName}":`, result.error);
        // Revert the optimistic update
        setCheckedStates(prev =>
          prev.map((item, i) => (i === index ? !checked : item))
        );
      } else {
        console.log(`✅ Successfully updated habit "${habitName}" completion`);
        console.log(`📊 New streaks:`, result.streaks);
        
        // Update the habit in state with new streak data
        setHabits(prev => 
          prev.map((habit, i) => 
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

  // Get actual streak for habit
  const getStreakForHabit = (index: number) => {
    const streak = habits[index]?.current_streak || 0;
    console.log(`📊 getStreakForHabit(${index}): "${habits[index]?.title}" = ${streak}`);
    return streak;
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
                            checked={habit.completed}
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
                              {habit.current_streak || 0}
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
              {habits.length > 0 ? "Edit Habits": "Add Habits"}
            </button>
            </Link>
        </div>
      </div>
    </div>
  );
}