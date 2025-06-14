// pages/about.tsx
import React from 'react';

const About = () => {
  return (
    <div className="min-h-screen bg-white px-6 py-12 flex flex-col items-center">
      <h1 className="text-4xl md:text-6xl font-bold text-green-600 text-center mb-8">
        Grains of Sand: Habit Tracker
      </h1>
      <section className="max-w-2xl text-center text-gray-700 text-lg leading-relaxed">
        <p>
          {/* You can customize this paragraph with your actual description */}
          Grains of Sand is a habit tracking tool designed to help you build consistent, meaningful routines by tracking the smallest steps daily. Think of each habit as a grain of sand — over time, they form mountains.
        </p>
      </section>
    </div>
  );
};

export default About;