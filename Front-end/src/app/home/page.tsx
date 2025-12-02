"use client";
import { useState, useEffect } from "react";
import { Button, H1, Container, StatCard, Loading } from "@/components";
import { useSupabaseAuth } from "@/hooks";


export default function HomePage() {
  const { user, loading: authLoading, supabase } = useSupabaseAuth({
    requireAuth: true,
    redirectTo: "/"
  });
  // State for user data and stats
  const [userName, setUserName] = useState("");
  const [completedHabits, setCompletedHabits] = useState(0);
  const [totalHabits, setTotalHabits] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [weeklyProgress, setWeeklyProgress] = useState(0);
  const [avgHabitsPerDay, setAvgHabitsPerDay] = useState(0);
  const [encouragingMessage, setEncouragingMessage] = useState("");
  const [loading, setLoading] = useState(true);

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

  // Function to load data (replace with real database calls in your app)
const fetchUserData = async () => {
  try {
    // user is provided by useSupabaseAuth hook
    if (!user) return;

    // Get user name from metadata or use email as fallback
    const displayName = user.user_metadata?.display_name || user.email?.split('@')[0] || "User";
    setUserName(displayName);

    // Fetch today's habits
    const { data: todayHabits, error: habitsError } = await supabase
      .from("habits")
      .select("id, completed, current_streak")
      .eq("user_id", user.id);

    if (habitsError) {
      console.error("Failed to fetch habits:", habitsError.message);
    } else if (todayHabits) {
      // Get today's date in YYYY-MM-DD format
      const today = new Date().toLocaleDateString('en-CA');

      // Fetch today's completions from habit_completions table
      const { data: todayCompletions, error: completionsError } = await supabase
        .from("habit_completions")
        .select("habit_id")
        .eq("user_id", user.id)
        .eq("completion_date", today);

      if (completionsError) {
        console.error("Failed to fetch today's completions:", completionsError.message);
      }

      // Create a Set of habit IDs that are completed today
      const completedHabitIds = new Set(
        todayCompletions?.map((completion: any) => completion.habit_id) || []
      );

      // Count how many habits are completed today
      const completed = todayHabits.filter((habit: any) =>
        completedHabitIds.has(habit.id)
      ).length;

      const total = todayHabits.length;
      const streaks = todayHabits.map((habit: any) => habit.current_streak || 0);
      const maxStreak = streaks.length > 0 ? Math.max(...streaks) : 0;

      setCompletedHabits(completed);
      setTotalHabits(total);
      setCurrentStreak(maxStreak);
    }

    // Calculate weekly progress from habit_completions table
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: weeklyCompletions, error: weeklyError } = await supabase
      .from("habit_completions")
      .select("completion_date, habit_id")
      .eq("user_id", user.id)
      .gte("completion_date", sevenDaysAgo.toISOString().split('T')[0]);

    if (weeklyError) {
      console.error("Failed to fetch weekly data:", weeklyError.message);
    } else if (weeklyCompletions && todayHabits) {
      // Group completions by date and count unique habits completed each day
      const completionsByDate = weeklyCompletions.reduce((acc: any, completion: any) => {
        const date = completion.completion_date;
        if (!acc[date]) acc[date] = new Set();
        acc[date].add(completion.habit_id);
        return acc;
      }, {});

      // Calculate average daily completion rate for the week
      const daysWithData = Object.keys(completionsByDate);
      const totalHabitsCount = todayHabits.length;
      
      if (daysWithData.length > 0 && totalHabitsCount > 0) {
        const totalCompletionRate = daysWithData.reduce((sum: number, date: string) => {
          const habitsCompletedThatDay = completionsByDate[date].size;
          return sum + (habitsCompletedThatDay / totalHabitsCount);
        }, 0);
        
        const avgCompletionRate = (totalCompletionRate / daysWithData.length) * 100;
        setWeeklyProgress(Math.round(avgCompletionRate));
      } else {
        setWeeklyProgress(0);
      }
    }

    // Calculate average habits completed per day from all historical data
    const { data: allCompletions, error: avgError } = await supabase
      .from("habit_completions")
      .select("completion_date, habit_id")
      .eq("user_id", user.id);

    if (avgError) {
      console.error("Failed to fetch completion data:", avgError.message);
    } else if (allCompletions && allCompletions.length > 0) {
      // Group by date and count unique habits per day
      const completionsByDate = allCompletions.reduce((acc: any, completion: any) => {
        const date = completion.completion_date;
        if (!acc[date]) acc[date] = new Set();
        acc[date].add(completion.habit_id);
        return acc;
      }, {});

      const daysWithCompletions = Object.keys(completionsByDate);
      const totalHabitsCompleted = daysWithCompletions.reduce((sum: number, date: string) => {
        return sum + completionsByDate[date].size;
      }, 0);

      const avgPerDay = totalHabitsCompleted / daysWithCompletions.length;
      setAvgHabitsPerDay(Math.round(avgPerDay * 10) / 10);
    } else {
      setAvgHabitsPerDay(0);
    }

    setLoading(false);
  } catch (error) {
    console.error("Error in fetchUserData:", error);
    setLoading(false);
  }
};

  useEffect(() => {
    // Set random encouraging message
    const randomIndex = Math.floor(Math.random() * encouragingMessages.length);
    setEncouragingMessage(encouragingMessages[randomIndex]);

    // Load data when user is available
    if (user) {
      fetchUserData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Calculate percentage for the progress circle
  const percentage = totalHabits > 0 ? (completedHabits / totalHabits) * 100 : 0;
  const circumference = 2 * Math.PI * 45; // radius is 45
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  if (authLoading || loading) {
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
                      {completedHabits}
                    </div>
                    <div className="text-sm text-gray-400">
                      of {totalHabits}
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Stats */}
              <div className="text-center space-y-2">
                <p className="text-lg font-medium">
                  {completedHabits} out of {totalHabits} habits completed
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

              {/* Motivational Text */}
              <div className="text-center mt-4">
                {percentage === 100 ? (
                  <p className="text-green-400 font-bold text-lg">
                    🎉 Perfect day! All habits completed! 
                  </p>
                ) : percentage >= 60 ? (
                  <p className="text-green-400 font-medium">
                    Great progress! Keep up the momentum! 
                  </p>
                ) : percentage > 0 ? (
                  <p className="text-yellow-400 font-medium">
                    Good start! You can do more! 
                  </p>
                ) : (
                  <p className="text-gray-400 font-medium">
                    Ready to begin your day? 
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
            <StatCard value={currentStreak} label="Day Streak" color="green" />
            <StatCard value={`${weeklyProgress}%`} label="This Week" color="blue" />
            <StatCard value={avgHabitsPerDay} label="Avg Per Day" color="purple" />
          </div>
        </div>
      </div>
    </div>
  );
}