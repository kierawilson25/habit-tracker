"use client";
import Image from "next/image";
import { use, useState } from "react";
import Checkbox from "@/app/components/Checkbox";
import Link from "next/link";
import { useEffect } from "react";

export default function Home() {
  const [habits, setHabits] = useState<string[]>([]);
  const [checkedStates, setCheckedStates] = useState<boolean[]>([]);
  const activeButtonClass = "bg-green-600 text-white rounded px-4 py-2 hover:bg-green-700 transition-colors duration-200"
  // USE EFFECTS ---------------------------------------------------------------------------
  useEffect(() => {
    // 1. Get habits from session storage, or empty array if not found
    const stored = getLSHabits();
    const habitList = stored ? JSON.parse(stored) : [];
    setHabits(habitList);
  }, []);

  // 2. When habits change, load checkedStates (or initialize)
  useEffect(() => {
    const storedChecked = getLSCheckedStates();
    if (
      storedChecked &&
      Array.isArray(JSON.parse(storedChecked)) &&
      JSON.parse(storedChecked).length === habits.length
    ) {
      setCheckedStates(JSON.parse(storedChecked));
    } else if (storedChecked && JSON.parse(storedChecked).length == 0) {
      setCheckedStates(new Array(habits.length).fill(false));
    }
  }, [habits]);

  // When checkedStates change, update local storage
  useEffect(() => {
    if (checkedStates.length === 0) return;
        setLSCheckedStates(checkedStates);
  }, [checkedStates]);


  //HELPER FUNCTIONS ---------------------------------------------------------------------------

  //--- Habits ----
  //Getter: Habits from Local Storage
  const getLSHabits = () => {return localStorage.getItem("habits")}

  //--- Checked States ----
  //Getter: Checked states from Local Storage
  const getLSCheckedStates = () => {return localStorage.getItem("checkedStates")}

  //Setter: Checked states from Local Storage
  const setLSCheckedStates = (setCheckedStates: boolean[]) => {localStorage.setItem("checkedStates", JSON.stringify(setCheckedStates))}


  // Function to handle checkbox state changes
  const handleCheckboxChange = (index: number, checked: boolean) => {
    setCheckedStates(prev =>
      prev.map((item, i) => (i === index ? checked : item))
    );
  }


  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <h1 className="w-full flex justify-center text-6xl font-bold mb-4 text-green-500">Habits</h1>

      {/* start check boxes */}
      <div className="p-8 flex flex-col gap-2">
        {habits.length === 0 ? (
        <p className="text-white-500">No habits found. Add some habits!</p>
        ) : (
        habits.map((label, idx) => (
            <div
            key={label}
            className="mx-auto w-full max-w-xl px-6 py-4 mb-4 rounded-lg border"
            style={{
              backgroundColor: "rgba(34, 197, 94, 0.2)",
              borderColor: "rgba(34, 197, 94, 1)",
              borderWidth: "2px",
              width: "33vw", // Center third of the viewport width
              minWidth: "300px", // Optional: prevent too small on mobile
              maxWidth: "600px", // Optional: prevent too wide on large screens
            }}
            onClick={() => handleCheckboxChange(idx, !checkedStates[idx])}
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
      </main>
      {/* Centered Add Habit button at the bottom */}
      <div className="w-full flex justify-center mb-8 row-start-3">
        <Link href="/add-habit">
          <button className={activeButtonClass}>
            Add Habit
          </button>
        </Link>
      </div>
      <footer className="row-start-4 flex gap-6 flex-wrap items-center justify-center">
      <a
        className="flex items-center gap-2 hover:underline hover:underline-offset-4"
        href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Image
        aria-hidden
        src="/file.svg"
        alt="File icon"
        width={16}
        height={16}
        />
        Learn
      </a>
      <a
        className="flex items-center gap-2 hover:underline hover:underline-offset-4"
        href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Image
        aria-hidden
        src="/window.svg"
        alt="Window icon"
        width={16}
        height={16}
        />
        Examples
      </a>
      <a
        className="flex items-center gap-2 hover:underline hover:underline-offset-4"
        href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Image
        aria-hidden
        src="/globe.svg"
        alt="Globe icon"
        width={16}
        height={16}
        />
        Go to nextjs.org →
      </a>
      </footer>
    </div>
  );
}
