"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { HiOutlinePencil } from "react-icons/hi2";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { IoIosCheckmarkCircle } from "react-icons/io";

export default function AddHabits() {
  const router = useRouter();
  const [habits, setHabits] = useState<string[]>([]);
  const [habitDisabled, setHabitDisabled] = useState<boolean[]>([]);
  const [checkedStates, setCheckedStates] = useState<boolean[]>([]);

  useEffect(() => {
    // Get habits from session storage, or empty array if not found
    const stored = localStorage.getItem("habits");
    console.log("Stored habits on add habit page:", stored);
    const habitList = stored ? JSON.parse(stored) : [];
    setHabits(habitList);
    setHabitDisabled(habitList.map(() => true)); // All inputs start as disabled

    //IF a new habbit is added, the checked State should be added and set to false in local storage
    const storedChecked = localStorage.getItem("checkedStates");
    if (storedChecked && Array.isArray(JSON.parse(storedChecked))) {
      setCheckedStates(JSON.parse(storedChecked));
      console.log("Stored checked on add habit page:", storedChecked);
    }
  }, []);

  // when the checked state changes, change the value in session storage
  useEffect(() => {
    if (checkedStates.length != 0) {
      localStorage.setItem("checkedStates", JSON.stringify(checkedStates));
      }
  }, [checkedStates]);

  // when the habit changes, change the value in session storage
  useEffect(() => {
    if (habits.length != 0)
    localStorage.setItem("habits", JSON.stringify(habits));
  }, [habits]);

  const handleChange = (idx: number, value: string) => {
    setHabits((prev) => prev.map((h, i) => (i === idx ? value : h)));
  };

  /* handelEdit: Function to handle the edit/save functionality
    If the input is disabled, clicking the edit icon will enable it
    If the input is enabled, clicking the save icon will disable it */
  const handleEdit = (idx: number, enabled: boolean) => {
    // clicking the save icon, setting it to disabled
    if (enabled) {
      if (habits[idx].trim() === "") {
        alert("Habit cannot be empty. Delte it or add a value.");
      } else {
        setHabitDisabled((prev) => prev.map((d, i) => (i === idx ? true : d)));
        const input = document.querySelectorAll('input[type="text"]')[idx] as
          | HTMLInputElement
          | undefined;
        input?.blur();
        const filtered = habits.filter((h) => h.trim() !== "");
        setHabits(filtered);
        //  REMOVE IF THIS WORKS WITH OUT IT 
        // localStorage.setItem("habits", JSON.stringify(filtered));
        // localStorage.setItem("checkedStates", JSON.stringify(checkedStates));
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

  const handleDelete = (idx: number) => {
    setHabits((prev) => prev.filter((_, i) => i !== idx));
    setCheckedStates((prev) => prev.filter((_, i) => i !== idx));
    //  REMOVE IF THIS WORKS WITH OUT IT 
    // console.log("handleDelete called with idx:", idx);
    // console.log("Checked States after delete:", checkedStates);
    // localStorage.setItem("habits", JSON.stringify(habits));
    // localStorage.setItem("checkedStates", JSON.stringify(checkedStates));
  };

  // handleBlur: Function to handle the blur event -> When the input loses focus, it will be set to disabled
  //not using right now
  // const handleBlur = (idx: number) => {
  //   setHabitDisabled((prev) => prev.map((d, i) => (i === idx ? true : d)));
  // };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const filtered = habits.filter((h) => h.trim() !== "");
    localStorage.setItem("habits", JSON.stringify(filtered));
    console.log("Filtered habits on add page:", filtered);
    localStorage.setItem("checkedStates", JSON.stringify(checkedStates));
    console.log("Checked States on add page:", filtered);
    router.push("/");
  };

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
              <button
                type="button"
                className="p-1 text-gray-500 hover:text-green-600"
                onClick={() => handleEdit(idx, false)}
                aria-label="Edit habit"
              >
                <HiOutlinePencil className="h-5 w-5" />
              </button>
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
                  className="p-1 text-gray-500 hover:text-blue-600"
                  onClick={() => handleDelete(idx)}
                  aria-label="Delete habit"
                >
                  <IoIosCloseCircleOutline className="h-6 w-6 hover:text-red-500" />
                </button>
              </div>
            )}
          </div>
        ))}

        <div className="flex justify-end mt-6">
          {/* show add button onlu if habits length is less than 5 */}
          {habits.length < 5 && (
            <button
              type="button"
              onClick={() => {
                if (habits.length < 5) {
                  setHabits([...habits, ""]);
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
            Habit List
          </button>
        </div>
      </form>
    </div>
  );
}
