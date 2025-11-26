"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { H1, Container } from "@/components";
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
          <Container color="green" padding="lg" className="text-center hover:scale-105 transition-transform duration-200">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <span className="text-white font-bold text-2xl sm:text-3xl">🎉</span>
            </div>

          <H1 text="One more step..."></H1>

            <div className="space-y-4 sm:space-y-6 text-white">
              <p className="text-lg sm:text-xl leading-relaxed">
                Verify your email to start tracaking your habits!
              </p>

              <p className="text-base sm:text-lg leading-relaxed">
                Think of your habits as grains of sand — each one seems small, but you can build a tower with grains of sand.
              </p>


            </div>
          </Container>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={handleGetStarted}
              className={secondaryButtonClass + " w-full sm:w-auto px-6 py-3 font-semibold text-sm sm:text-base"}
            >
              Learn how to track
            </button>

            <button
              onClick={handleLogin}
              className={activeButtonClass + " w-full sm:w-auto px-6 py-3 font-semibold text-sm sm:text-base"}
            >
              Login to Start Tracking
            </button>
          </div>

          {/* Subtitle */}
          <div className="text-center mt-4">
            <p className="text-green-300 text-xs sm:text-sm opacity-75">
              Your journey to consistent, positive change starts here
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}