"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import "../../utils/styles/global.css";

export default function Welcome() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeButtonClass = "bg-green-600 text-white rounded px-4 py-2 hover:bg-green-700 transition-colors duration-200";
  const secondaryButtonClass = "border-2 border-green-600 text-green-600 rounded px-4 py-2 hover:bg-green-600 hover:text-white transition-colors duration-200";

  const handleGetStarted = () => {
    router.push("/get-started");
  };

  const handleLogin = () => {
    router.push("/login");
  };

  if (!mounted) {
    return (
      <div className="page-dark min-h-screen flex justify-center items-center">
        <div className="text-lg text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="page-dark min-h-screen">
      <div className="flex justify-center px-4">
        <div className="w-full max-w-2xl flex flex-col gap-6 p-8">

          {/* Welcome Content */}
          <div
            className="rounded-lg p-8 text-center hover:scale-105 transition-transform duration-200"
            style={{
              backgroundColor: "rgba(34, 197, 94, 0.2)",
              borderColor: "rgba(34, 197, 94, 1)",
              border: "2px solid rgba(34, 197, 94, 1)"
            }}
          >
            <div className="w-20 h-20 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-6">
              <span className="text-white font-bold text-3xl">🎉</span>
            </div>

            <h1 className="text-4xl font-bold mb-6 text-white">
              Congratulations!
            </h1>

            <div className="space-y-6 text-white">
              <p className="text-xl leading-relaxed">
                Welcome to Grains of Sand! Your account has been created successfully.
              </p>

              <p className="text-lg leading-relaxed">
                Think of your habits as grains of sand — each one seems small, but you can build a tower with grains of sand.
              </p>

              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 mt-8">
                <h3 className="text-xl font-semibold text-green-800 mb-4">Ready to Start Building?</h3>
                <p className="text-gray-700 leading-relaxed">
                  Login to start tracking your habits, or learn how the app works first.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={handleGetStarted}
              className={secondaryButtonClass + " w-full sm:w-auto px-6 py-3 font-semibold"}
            >
              Visit Getting Started
            </button>

            <button
              onClick={handleLogin}
              className={activeButtonClass + " w-full sm:w-auto px-6 py-3 font-semibold"}
            >
              Login to Start Tracking
            </button>
          </div>

          {/* Subtitle */}
          <div className="text-center mt-4">
            <p className="text-green-300 text-sm opacity-75">
              Your journey to consistent, positive change starts here
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}