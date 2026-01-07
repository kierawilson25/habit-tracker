"use client";
import { useState, useEffect } from "react";
import { Button, H1, Container, StatCard, Loading } from "@/components";
import { useSupabaseAuth, useHabits, useUserStats } from "@/hooks";
import { getHabitCompletionMessage } from "@/utils/habitMessages";


export default function HomePage() {
  const { user, loading: authLoading, supabase } = useSupabaseAuth({
    requireAuth: true,
    redirectTo: "/"
  });

  const { habits, loading: habitsLoading } = useHabits({
    userId: user?.id,
    autoFetch: true
  });

  const { stats, loading: statsLoading } = useUserStats({
    userId: user?.id,
    totalHabits: habits.length,
    autoFetch: true
  });

  // State for UI messages
  const [userName, setUserName] = useState("");
  const [encouragingMessage, setEncouragingMessage] = useState("");
  const [dashboardMessage, setDashboardMessage] = useState({ title: "", message: "" });

  const encouragingMessages = [
    "Every small step counts towards your goals! 🌟",
    "Consistency is the key to lasting change. Keep going! 💪",
    "You're building the future you want, one habit at a time! 🚀",
    "Progress, not perfection. You're doing amazing! ✨",
    "Today is a new opportunity to grow stronger! 🌱",
    "Your dedication today shapes tomorrow's success! 🎯",
    "Small habits, big results. You've got this! 🔥",
    "Every habit completed is a promise kept to yourself! 💚"
  ];

  useEffect(() => {
    // Set random encouraging message
    const randomIndex = Math.floor(Math.random() * encouragingMessages.length);
    setEncouragingMessage(encouragingMessages[randomIndex]);
  }, []);

  useEffect(() => {
    // Get user name from metadata or use email as fallback
    if (user) {
      const displayName = user.user_metadata?.display_name || user.email?.split('@')[0] || "User";
      setUserName(displayName);
    }
  }, [user]);

  // Update dashboard message based on completion
  useEffect(() => {
    if (habits.length > 0) {
      const message = getHabitCompletionMessage(stats.completed_today, habits.length);
      setDashboardMessage(message);
    }
  }, [stats.completed_today, habits.length]);

  // Calculate percentage for the progress circle
  const percentage = habits.length > 0 ? (stats.completed_today / habits.length) * 100 : 0;
  const circumference = 2 * Math.PI * 45; // radius is 45
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  if (authLoading || statsLoading || habitsLoading) {
    return <Loading text="Loading your dashboard..." />
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex justify-center px-4 py-8">
        <div className="w-full max-w-2xl space-y-6">
          
          {/* Welcome Section */}
          <Container>
            <H1 text= {"Hi " + userName + "!"} />
            <p className="text-gray-400 text-center">
              Welcome back to your habit journey
            </p>
          </Container>

          {/* Encouraging Message Section */}
          <Container>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-600 rounded-full mb-4">
                <span className="text-xl">💡</span>
              </div>
              <p className="text-lg text-green-400 font-medium">
                {encouragingMessage}
              </p>
            </div>
          </Container>

          {/* Habits Progress Widget */}
          <Container>
            <h2 className="text-xl font-bold text-center mb-6">Today's Progress</h2>
            
            <div className="flex flex-col items-center space-y-4">
              {/* Circular Progress Chart */}
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                  {/* Background circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="#374151"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="#16a34a"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-700 ease-in-out"
                  />
                </svg>
                {/* Center text */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">
                      {stats.completed_today}
                    </div>
                    <div className="text-sm text-gray-400">
                      of {habits.length}
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Stats */}
              <div className="text-center space-y-2">
                <p className="text-lg font-medium">
                  {stats.completed_today} out of {habits.length} habits completed
                </p>
                <p className="text-green-400 font-bold text-xl">
                  {Math.round(percentage)}% Complete
                </p>
              </div>

              {/* Progress Bar Alternative */}
              <div className="w-full max-w-xs">
                <div className="bg-gray-700 rounded-full h-3">
                  <div 
                    className="bg-green-600 h-3 rounded-full transition-all duration-700 ease-in-out"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Unhinged Duolingo-Style Motivational Text */}
              <div className="text-center mt-4">
                {habits.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-white font-bold text-lg">
                      {dashboardMessage.title}
                    </p>
                    <p className="text-gray-300 font-medium">
                      {dashboardMessage.message}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-400 font-medium">
                    Add some habits to get started!
                  </p>
                )}
              </div>
            </div>
          </Container>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4">

              <Button href="/habits">
                {"View Habits"}
              </Button>

              <Button href="/add-habit" type="secondary">
                {"Edit Habits"}
              </Button>
          </div>

          {/* Quick Stats Cards */}
          <div className="grid grid-cols-3 gap-4">
            <StatCard value={stats.current_streak} label="Day Streak" color="green" />
            <StatCard value={`${stats.weekly_progress}%`} label="This Week" color="blue" />
            <StatCard value={stats.avg_habits_per_day} label="Avg Per Day" color="purple" />
          </div>
        </div>
      </div>
    </div>
  );
}