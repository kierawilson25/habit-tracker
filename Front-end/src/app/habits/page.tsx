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
  last_completed?: string | null; // Can be undefined, null, or string
}

export default function Home() {
  const [habits, setHabits] = useState<string[]>([]);
  const [checkedStates, setCheckedStates] = useState<boolean[]>([]);
  const [habitIds, setHabitIds] = useState<string[]>([]); // Track database IDs
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const activeButtonClass = "bg-green-600 text-white rounded px-4 py-2 hover:bg-green-700 transition-colors duration-200"
  
  const supabase = createClient();

  // Function to check if habits need to be reset (daily reset at midnight)
  const needsReset = (lastCompleted: string | null | undefined, completed: boolean) => {
    console.log("🔍 needsReset called with:", { lastCompleted, completed });
    
    // If habit is not completed, no need to reset
    if (!completed) {
      console.log("❌ Habit not completed - no reset needed");
      return false;
    }
    
    // If habit is completed but no last_completed date, DON'T reset (could be completed today)
    // This is more conservative - only reset if we have a definitive old date
    if (!lastCompleted) {
      console.log("⚠️ Habit completed but no last_completed date - assuming completed today, no reset");
      return false;
    }
    
    const lastCompletedDate = new Date(lastCompleted);
    const today = new Date();
    
    // Check if the date is valid
    if (isNaN(lastCompletedDate.getTime())) {
      console.log("❌ Invalid date format - no reset");
      return false;
    }
    
    const lastCompletedString = lastCompletedDate.toDateString();
    const todayString = today.toDateString();
    
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

    const { data: habitData, error: fetchError } = await supabase
      .from("habits")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_archived", false)  // Only fetch non-archived habits
      .order("created_at", { ascending: true });

    if (fetchError) {
      console.error("❌ Failed to fetch habits:", fetchError.message);
      setLoading(false);
      return;
    }

    console.log("📊 Raw habit data from DB:", habitData);

    if (habitData && habitData.length > 0) {
      console.log(`📝 Processing ${habitData.length} habits for daily reset check`);
      
      // Check if any habits need to be reset
      const habitsToUpdate: string[] = [];
      const updatedHabits = habitData.map((habit: Habit, index: number) => {
        console.log(`\n--- Processing habit ${index + 1}: "${habit.title}" ---`);
        console.log("Completed:", habit.completed);
        console.log("Last completed:", habit.last_completed);
        
        if (needsReset(habit.last_completed, habit.completed)) {
          console.log("🔄 This habit will be reset!");
          habitsToUpdate.push(habit.id);
          return { ...habit, completed: false };
        } else {
          console.log("✅ This habit doesn't need reset");
          return habit;
        }
      });

      console.log(`🔄 Total habits to reset: ${habitsToUpdate.length}`);
      console.log("Habit IDs to reset:", habitsToUpdate);

      // Update database if any habits need reset
      if (habitsToUpdate.length > 0) {
        console.log("📤 Updating database to reset habits...");
        const { error: updateError } = await supabase
          .from("habits")
          .update({ 
            completed: false,
            last_completed: null  // Also reset the last_completed timestamp
          })
          .in("id", habitsToUpdate);

        if (updateError) {
          console.error("❌ Failed to reset habits:", updateError.message);
        } else {
          console.log("✅ Successfully reset habits in database");
        }
      }

      // Set state with fetched/updated data
      console.log("📋 Setting component state...");
      setHabits(updatedHabits.map((habit: Habit) => habit.title));
      setHabitIds(updatedHabits.map((habit: Habit) => habit.id));
      setCheckedStates(updatedHabits.map((habit: Habit) => habit.completed));
      
      console.log("Final checked states:", updatedHabits.map((habit: Habit) => habit.completed));
    } else {
      console.log("📝 No habits found, initializing empty arrays");
      // No habits found, start with empty arrays
      setHabits([]);
      setHabitIds([]);
      setCheckedStates([]);
    }

    console.log("✅ fetchHabitsFromDB completed on HOME page");
    setLoading(false);
  };

  // USE EFFECTS ---------------------------------------------------------------------------
  useEffect(() => {
    fetchHabitsFromDB();
  }, []);

  // When checkedStates change, update local storage
  useEffect(() => {
    if (checkedStates.length === 0) return;
    setLSCheckedStates(checkedStates);
  }, [checkedStates]);

  //HELPER FUNCTIONS ---------------------------------------------------------------------------

  //Setter: Checked states from Local Storage
  const setLSCheckedStates = (setCheckedStates: boolean[]) => {
    localStorage.setItem("checkedStates", JSON.stringify(setCheckedStates))
  }

  // Function to handle checkbox state changes
  const handleCheckboxChange = async (index: number, checked: boolean) => {
    console.log(`📝 Checkbox changed for habit ${index}: ${checked}`);
    
    setCheckedStates(prev =>
      prev.map((item, i) => (i === index ? checked : item))
    );
    
    if (habitIds[index]) {
      const updateData = {
        completed: checked,
        last_completed: checked ? new Date().toISOString() : null
      };
      
      console.log("📤 Updating habit in database:", updateData);
      
      const { error } = await supabase
        .from("habits")
        .update(updateData)
        .eq("id", habitIds[index]);
        
      if (error) {
        console.error("❌ Failed to update habit:", error.message);
      } else {
        console.log("✅ Successfully updated habit completion");
      }
    }
  }

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
            <div className="w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl flex flex-col gap-2">
              {habits.length === 0 ? (
                <p className="text-white-500 text-center">No habits found. Add some habits!</p>
              ) : (
                habits.map((label, idx) => (
                  <div
                    key={label}
                    className="w-full px-4 py-4 mb-4 rounded-lg border-2 hover:scale-105 transition-transform duration-200"
                    style={{
                      backgroundColor: "rgba(34, 197, 94, 0.2)",
                      borderColor: "rgba(34, 197, 94, 1)",
                    }}
                  >
                    <Checkbox
                      label={label}
                      checked={checkedStates[idx] ?? false}
                      onChange={checked => handleCheckboxChange(idx, checked)}
                    />
                  </div>
                ))
              )}
            </div>
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