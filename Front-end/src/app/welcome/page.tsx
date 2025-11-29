"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { H1, Container, Button, Loading, PageLayout } from "@/components";
import "../../utils/styles/global.css";

export default function Welcome() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleGetStarted = () => {
    router.push("/get-started");
  };

  const handleLogin = () => {
    router.push("/login");
  };

  if (!mounted) {
    return <Loading />
  }

  return (
    <PageLayout maxWidth="2xl">
      <div className="flex flex-col gap-6">

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
            <Button
              onClick={handleGetStarted}
              type="primary"
              variant="outline"
              className="w-full sm:w-auto px-6 py-3 font-semibold text-sm sm:text-base"
            >
              Learn how to track
            </Button>

            <Button
              onClick={handleLogin}
              type="primary"
              className="w-full sm:w-auto px-6 py-3 font-semibold text-sm sm:text-base"
            >
              Login to Start Tracking
            </Button>
          </div>

          {/* Subtitle */}
          <div className="text-center mt-4">
            <p className="text-green-300 text-xs sm:text-sm opacity-75">
              Your journey to consistent, positive change starts here
            </p>
          </div>
      </div>
    </PageLayout>
  );
}