"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { H1, EditableHabitInput, Button, Loading } from "@/components";
import { useSupabaseAuth, useHabits } from "@/hooks";

export default function AddHabits() {
  const router = useRouter();
  const { user, loading: authLoading } = useSupabaseAuth({
    requireAuth: true,
    redirectTo: "/"
  });

  const {
    habits: dbHabits,
    loading: habitsLoading,
    addHabit,
    updateHabit,
    deleteHabit
  } = useHabits({
    userId: user?.id,
    autoFetch: true
  });

  const [editedHabits, setEditedHabits] = useState<string[]>([]);
  const [habitIds, setHabitIds] = useState<string[]>([]); // Track database IDs
  const [habitDisabled, setHabitDisabled] = useState<boolean[]>([]);

  // Sync dbHabits from hook to local state
  useEffect(() => {
    if (dbHabits && dbHabits.length > 0) {
      setEditedHabits(dbHabits.map((habit) => habit.title));
      setHabitIds(dbHabits.map((habit) => habit.id));
      setHabitDisabled(dbHabits.map(() => true)); // All inputs start as disabled
    }
  }, [dbHabits]);

  const handleChange = (idx: number, value: string) => {
    setEditedHabits((prev) => prev.map((h, i) => (i === idx ? value : h)));
  };

  /* handleEdit: Function to handle the edit/save functionality
    If the input is disabled, clicking the edit icon will enable it
    If the input is enabled, clicking the save icon will disable it */
  const handleEdit = async (idx: number, enabled: boolean) => {
    // clicking the save icon, setting it to disabled
    if (enabled) {
      if (editedHabits[idx].trim() === "") {
        alert("Habit cannot be empty. Delete it or add a value.");
      } else {
        setHabitDisabled((prev) => prev.map((d, i) => (i === idx ? true : d)));
        const input = document.querySelectorAll('input[type="text"]')[idx] as
          | HTMLInputElement
          | undefined;
        input?.blur();

        // Update the habit in the database if it has an ID using hook
        if (habitIds[idx]) {
          await updateHabit(habitIds[idx], { title: editedHabits[idx] });
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
    // Delete from database if it has an ID using hook
    if (habitIds[idx]) {
      const success = await deleteHabit(habitIds[idx]);
      if (!success) {
        console.error("Failed to delete habit");
        return;
      }
    }

    // Remove from local state
    setEditedHabits((prev) => prev.filter((_, i) => i !== idx));
    setHabitIds((prev) => prev.filter((_, i) => i !== idx));
    setHabitDisabled((prev) => prev.filter((_, i) => i !== idx));
  };

  // handleSubmit: Function to handle the form submission (for new habits)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // user is provided by useSupabaseAuth hook
    if (!user) {
      console.error("Not authenticated");
      return;
    }

    // Only insert new habits (ones without IDs) using hook
    const newHabitsToAdd = editedHabits
      .map((habit, idx) => ({ habit, idx }))
      .filter(({ habit, idx }) => !habitIds[idx] && habit.trim() !== "");

    for (const { habit } of newHabitsToAdd) {
      await addHabit(habit);
    }

    router.push("/habits");
  };

  if (authLoading || habitsLoading) {
    return <Loading text="Loading habits..." />
  }

  return (
    <div className="flex justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl flex flex-col gap-4 p-8"
      >
        <H1 text="Edit Habits" />
        <p className="text-gray-400 text-center mb-4">
          Add up to 5 Habits
        </p>

        {editedHabits.map((habit, idx) => (
          <EditableHabitInput
            key={idx}
            name={`habit_${idx}`}
            id={`habit_${idx}`}
            value={habit}
            maxLength={50}
            placeholder={`Habit ${idx + 1}`}
            onChange={(value) => handleChange(idx, value)}
            onEdit={() => handleEdit(idx, false)}
            onSave={() => handleEdit(idx, true)}
            onDelete={() => handleDelete(idx)}
            disabled={habitDisabled[idx]}
          />
        ))}

        <div className="flex justify-end mt-6">
          {/* show add button only if editedHabits length is less than 5 */}
          {editedHabits.length < 5 && (
            <Button
              onClick={() => {
                if (editedHabits.length < 5) {
                  setEditedHabits([...editedHabits, ""]);
                  setHabitIds([...habitIds, ""]); // Empty ID for new habit
                  setHabitDisabled([...habitDisabled, false]);
                }
              }}
              disabled={editedHabits.length == 5}
              type="primary"
              roundedFull
              className="font-bold"
            >
              +
            </Button>
          )}
        </div>
        <div className="flex justify-center mt-6">
          <Button htmlType="submit" type="primary">
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}