// pages/about.tsx
import React from 'react';
import Link from "next/link";
import "../../utils/styles/global.css"; // Import global styles



const About = () => {
    const activeButtonClass = "bg-green-600 text-white rounded px-4 py-2 hover:bg-green-700 transition-colors duration-200"

  return (
    <div className="page-dark">
    <div className="min-h-screen  px-6 py-12 flex flex-col items-center">
      <h1 className="text-4xl md:text-6xl font-bold text-green-600 text-center mb-8 pb-4">
        Grains of Sand: <br /> A Habit Tracker
      </h1>
      <section className="max-w-2xl text-center text-gray-700 text-lg leading-relaxed">
          <div
            className="mx-auto w-full max-w-xl px-6 py-4 mb-4 rounded-lg border"
            style={{
              backgroundColor: "rgba(34, 197, 94, 0.4)",
              borderColor: "rgba(34, 197, 94, 1)",
              borderWidth: "2px",
              width: "33vw", // Center third of the viewport width
              minWidth: "300px", // Optional: prevent too small on mobile
              maxWidth: "600px", // Optional: prevent too wide on large screens
            }}
            >
        <p className='text-white'>
          {/* You can customize this paragraph with your actual description */}
          Grains of Sand is a habit tracking tool designed to help you build trust in yourself to create consistent change.
          Only five habits can be created, keeping you focused on small sustained change. The idea is to commit to completing
          these habits every day until they become second nature. The app is designed to be clean, simple, and intuitive. 
          Think of these small habits as grains of sand — each one seems small but you can build a tower with grains of sand.
          
          {/* to help you build consistent, meaningful routines by tracking the smallest steps daily. Think of each habit as a grain of sand — over time, they form mountains. */}
        </p>
        </div>
      </section>
            <div className="w-full flex justify-center mb-8 row-start-3">
        <Link href="/add-habit">
            <button
            className={activeButtonClass + " fixed left-1/2 transform -translate-x-1/2 bottom-8 z-50"}
            style={{ minWidth: "100px" }}
            >
            Start Tracking
            </button>
        </Link>
      </div>
    </div>
  </div>
  );
};

export default About;