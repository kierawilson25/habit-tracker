"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { HiOutlinePencil } from "react-icons/hi2";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { IoIosCheckmarkCircle } from "react-icons/io";
import { createClient } from "@/utils/supabase/client";

interface Habit {
  id: string;
  title: string;
  completed: boolean;
  created_at: string;
  last_completed?: string | null; // Can be undefined, null, or string
}

export default function AddHabits() {
  const router = useRouter();
  const [habits, setHabits] = useState<string[]>([]);
  const [habitIds, setHabitIds] = useState<string[]>([]); // Track database IDs
  const [habitDisabled, setHabitDisabled] = useState<boolean[]>([]);
  const [checkedStates, setCheckedStates] = useState<boolean[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  // Function to check if habits need to be reset (daily reset at midnight)
  const needsReset = (lastCompleted: string | null | undefined) => {
    if (!lastCompleted) return false;
    
    const lastCompletedDate = new Date(lastCompleted);
    const today = new Date();
    
    // Reset if last completed date is not today
        console.log("Checking reset for:", lastCompleted, "Needs reset:", !lastCompleted || lastCompletedDate.toDateString() !== today.toDateString());

    return lastCompletedDate.toDateString() !== today.toDateString();
  };

  // Function to fetch habits from database
  const fetchHabitsFromDB = async () => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      //console.error("Not authenticated:", userError?.message);
      console.log("Not authenticated, redirecting to login");
      router.push("/");
      setLoading(false);
      return;
    }

    const { data: habitData, error: fetchError } = await supabase
      .from("habits")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (fetchError) {
      console.error("Failed to fetch habits:", fetchError.message);
      setLoading(false);
      return;
    }

    if (habitData && habitData.length > 0) {
      // Check if any habits need to be reset
      const habitsToUpdate: string[] = [];
      const updatedHabits = habitData.map((habit: Habit) => {
        console.log("Habit:", habit);
        if (habit.completed && needsReset(habit.last_completed)) {
          habitsToUpdate.push(habit.id);
          return { ...habit, completed: false };
        }
        return habit;
      });

      // Update database if any habits need reset
      if (habitsToUpdate.length > 0) {
        const { error: updateError } = await supabase
          .from("habits")
          .update({ completed: false })
          .in("id", habitsToUpdate);

        if (updateError) {
          console.error("Failed to reset habits:", updateError.message);
        }
      }

      // Set state with fetched/updated data
      setHabits(updatedHabits.map((habit: Habit) => habit.title));
      setHabitIds(updatedHabits.map((habit: Habit) => habit.id));
      setCheckedStates(updatedHabits.map((habit: Habit) => habit.completed));
      setHabitDisabled(updatedHabits.map(() => true)); // All inputs start as disabled
    } else {
      // No habits found, start with empty arrays
      setHabits([]);
      setHabitIds([]);
      setCheckedStates([]);
      setHabitDisabled([]);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchHabitsFromDB();
  }, []);

  // Remove the localStorage effects since we're using database now
  // You can keep them as backup/fallback if needed

  const handleChange = (idx: number, value: string) => {
    setHabits((prev) => prev.map((h, i) => (i === idx ? value : h)));
  };

  /* handelEdit: Function to handle the edit/save functionality
    If the input is disabled, clicking the edit icon will enable it
    If the input is enabled, clicking the save icon will disable it */
  const handleEdit = async (idx: number, enabled: boolean) => {
    // clicking the save icon, setting it to disabled
    if (enabled) {
      if (habits[idx].trim() === "") {
        alert("Habit cannot be empty. Delete it or add a value.");
      } else {
        setHabitDisabled((prev) => prev.map((d, i) => (i === idx ? true : d)));
        const input = document.querySelectorAll('input[type="text"]')[idx] as
          | HTMLInputElement
          | undefined;
        input?.blur();
        
        // Update the habit in the database if it has an ID
        if (habitIds[idx]) {
          const { error } = await supabase
            .from("habits")
            .update({ title: habits[idx] })
            .eq("id", habitIds[idx]);

          if (error) {
            console.error("Failed to update habit:", error.message);
          }
        }
      }
    }
    // clicking the edit icon, setting it to enabled
    else {
      setHabitDisabled((prev) => prev.map((d, i) => (i === idx ? false : d)));
      // Focus the input for editing
      const input = document.querySelectorAll('input[type="text"]')[idx] as
        | HTMLInputElement
        | undefined;
      input?.focus();
    }
  };

  const handleDelete = async (idx: number) => {
    // Delete from database if it has an ID
    if (habitIds[idx]) {
      const { error } = await supabase
        .from("habits")
        .delete()
        .eq("id", habitIds[idx]);

      if (error) {
        console.error("Failed to delete habit:", error.message);
        return;
      }
    }

    // Remove from local state
    setHabits((prev) => prev.filter((_, i) => i !== idx));
    setHabitIds((prev) => prev.filter((_, i) => i !== idx));
    setCheckedStates((prev) => prev.filter((_, i) => i !== idx));
    setHabitDisabled((prev) => prev.filter((_, i) => i !== idx));
  };

  // Function to handle checking/unchecking habits
  const handleCheck = async (idx: number) => {
    const newCheckedState = !checkedStates[idx];
    setCheckedStates((prev) => prev.map((c, i) => (i === idx ? newCheckedState : c)));

    // Update in database
    if (habitIds[idx]) {
      const updateData = {
        completed: newCheckedState,
        last_completed: newCheckedState ? new Date().toISOString() : null
      };

      const { error } = await supabase
        .from("habits")
        .update(updateData)
        .eq("id", habitIds[idx]);

      if (error) {
        console.error("Failed to update habit completion:", error.message);
      }
    }
  };

  // handleSubmit: Function to handle the form submission (for new habits)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      console.error("Not authenticated:", error?.message);
      return;
    }

    // Only insert new habits (ones without IDs)
    const newHabits = habits
      .map((habit, idx) => ({ habit, idx }))
      .filter(({ habit, idx }) => !habitIds[idx] && habit.trim() !== "")
      .map(({ habit, idx }) => ({
        user_id: user.id,
        title: habit,
        completed: checkedStates[idx] ?? false,
        last_completed: checkedStates[idx] ? new Date().toISOString() : null
      }));

    if (newHabits.length > 0) {
      const { data, error: insertError } = await supabase
        .from("habits")
        .insert(newHabits);

      if (insertError) {
        console.error("Insert failed:", insertError.message);
      } else {
        console.log("New habits inserted:", data);
      }
    }

    router.push("/");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading habits...</div>
      </div>
    );
  }

  return (
    <div className="flex justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl flex flex-col gap-4 p-8"
      >
        <h1 className="text-xl font-bold mb-4 text-center">
          Add up to 5 Habits
        </h1>

        {habits.map((habit, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <input
              type="text"
              value={habit}
              maxLength={50}
              placeholder={`Habit ${idx + 1}`}
              onChange={(e) => handleChange(idx, e.target.value)}
              disabled={habitDisabled[idx]}
              className={
                habitDisabled[idx]
                  ? "bg-gray-300 text-gray-500 disabled focus:outline-none border p-2 rounded flex-1"
                  : "border p-2 rounded text-black flex-1  hover:ring-2 hover:ring-green-500 focus:outline-none transition-colors duration-200"
              }
            />
            {/* return either edit icon or save icon based on the state of habitDisabled */}
            {habit != "" && habitDisabled[idx] ? (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="p-1 text-gray-500 hover:text-green-600"
                  onClick={() => handleEdit(idx, false)}
                  aria-label="Edit habit"
                >
                  <HiOutlinePencil className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  className="p-1 text-gray-500 hover:text-red-600"
                  onClick={() => handleDelete(idx)}
                  aria-label="Delete habit"
                >
                  <IoIosCloseCircleOutline className="h-6 w-6" />
                </button>
              </div>
            ) : (
              <div>
                <button
                  type="button"
                  className="p-1"
                  onClick={() => handleEdit(idx, true)}
                  aria-label="Save habit"
                >
                  <IoIosCheckmarkCircle className="h-6 w-6 text-green-500 hover:text-green-800" />
                </button>
                <button
                  type="button"
                  className="p-1 text-gray-500 hover:text-red-600"
                  onClick={() => handleDelete(idx)}
                  aria-label="Delete habit"
                >
                  <IoIosCloseCircleOutline className="h-6 w-6" />
                </button>
              </div>
            )}
          </div>
        ))}

        <div className="flex justify-end mt-6">
          {/* show add button only if habits length is less than 5 */}
          {habits.length < 5 && (
            <button
              type="button"
              onClick={() => {
                if (habits.length < 5) {
                  setHabits([...habits, ""]);
                  setHabitIds([...habitIds, ""]); // Empty ID for new habit
                  setHabitDisabled([...habitDisabled, false]);
                  setCheckedStates((prev) => [...prev, false]);
                }
              }}
              disabled={habits.length == 5}
              className="bg-green-600 hover:bg-green-800 text-white font-bold py-2 px-4 rounded-full transition-colors duration-200"
            >
              +
            </button>
          )}
        </div>
        <div className="flex justify-center mt-6">
          <button
            className="bg-green-600 text-white rounded px-4 py-2 hover:bg-green-800 transition-colors duration-200"
            type="submit"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}