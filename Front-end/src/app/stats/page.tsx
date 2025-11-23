"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button, H1, StreakCalendar } from "@/components";


export default function StatsPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [contributionData, setContributionData] = useState<Record<string, number>>({});
  const [totalDays, setTotalDays] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [goldStarDays, setGoldStarDays] = useState(0);
  const [totalCompletions, setTotalCompletions] = useState(0);
  const [avgHabitsPerDay, setAvgHabitsPerDay] = useState(0);

  const fetchStatsData = async () => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.log("Not authenticated, redirecting to login");
        router.push("/");
        return;
      }

      const displayName = user.user_metadata?.display_name || user.email?.split('@')[0] || "User";
      setUserName(displayName);

      // Fetch all completions for the past 365 days
      const oneYearAgo = new Date();
      oneYearAgo.setDate(oneYearAgo.getDate() - 365);

      const { data: completions, error: completionsError } = await supabase
        .from("habit_completions")
        .select("completion_date, habit_id")
        .eq("user_id", user.id)
        .gte("completion_date", oneYearAgo.toISOString().split('T')[0]);

      if (completionsError) {
        console.error("Failed to fetch completions:", completionsError.message);
        setLoading(false);
        return;
      }

      // Process completions into a date-based map
      const dateMap: Record<string, Set<string>> = {};
      if (completions) {
        completions.forEach((completion: any) => {
          const date = completion.completion_date;
          if (!dateMap[date]) {
            dateMap[date] = new Set();
          }
          dateMap[date].add(completion.habit_id);
        });
      }

      // Convert sets to counts
      const contributionMap: Record<string, number> = {};
      Object.keys(dateMap).forEach((date) => {
        contributionMap[date] = dateMap[date].size;
      });

      setContributionData(contributionMap);

      // Calculate stats
      const daysWithActivity = Object.keys(contributionMap).length;
      setTotalDays(daysWithActivity);

      const totalHabits = Object.values(contributionMap).reduce((sum: number, count: number) => sum + count, 0);
      setTotalCompletions(totalHabits);
      
      // Count gold star days (days with 5 habits completed)
      const goldDays = Object.values(contributionMap).filter((count: number) => count >= 5).length;
      setGoldStarDays(goldDays);

      // Calculate streaks
      const sortedDates = Object.keys(contributionMap).sort().reverse();
      let current = 0;
      let longest = 0;
      let temp = 0;
      
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      // Check if streak is active (today or yesterday has activity)
      if (contributionMap[today] || contributionMap[yesterdayStr]) {
        let checkDate = new Date();
        while (true) {
          const dateStr = checkDate.toISOString().split('T')[0];
          if (contributionMap[dateStr]) {
            current++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
        }
      }

      // Calculate longest streak
      for (let i = 0; i < sortedDates.length; i++) {
        const currentDate = new Date(sortedDates[i]);
        if (i === 0 || isConsecutiveDay(new Date(sortedDates[i - 1]), currentDate)) {
          temp++;
          longest = Math.max(longest, temp);
        } else {
          temp = 1;
        }
      }

      setCurrentStreak(current);
      setLongestStreak(longest);
      
      // Calculate average habits per day (only counting days with activity)
      if (daysWithActivity > 0) {
        const avg = totalHabits / daysWithActivity;
        setAvgHabitsPerDay(Math.round(avg * 10) / 10);
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Error in fetchStatsData:", error);
      setLoading(false);
    }
  };

  const isConsecutiveDay = (date1: Date, date2: Date): boolean => {
    const diff = Math.abs(date1.getTime() - date2.getTime());
    return diff === 86400000; // 1 day in milliseconds
  };

  useEffect(() => {
    fetchStatsData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex justify-center items-center">
        <div className="text-lg">Loading your stats...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex justify-center px-4 py-8">
        <div className="w-full max-w-6xl space-y-6">
          
          {/* Header */}
          <div className="bg-green-950/20 rounded-lg p-6 border border-green-600/30">

            <H1 text={userName + "'s Stats"}/>
            <p className="text-gray-400 text-center mb-4">
              Your habit completion journey
            </p>
            <div className="text-center pt-4 border-t border-green-600/30">
              <div className="text-4xl font-bold text-green-400">{totalCompletions}</div>
              <div className="text-sm text-gray-400 mt-1">Grains of Sand</div>
              <div className="text-xs text-gray-500 mt-1">collected this year!</div>
            </div>
          </div>

          {/* Stats Overview Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-green-950/20 rounded-lg p-4 border border-green-600/30 text-center">
              <div className="text-3xl font-bold text-blue-400">{totalDays}</div>
              <div className="text-sm text-gray-400 mt-1">Active Days</div>
            </div>
            <div className="bg-green-950/20 rounded-lg p-4 border border-green-600/30 text-center">
              <div className="text-3xl font-bold text-purple-400">{currentStreak}</div>
              <div className="text-sm text-gray-400 mt-1">Current Streak</div>
            </div>
            <div className="bg-green-950/20 rounded-lg p-4 border border-green-600/30 text-center">
              <div className="text-3xl font-bold text-yellow-400">{goldStarDays}</div>
              <div className="text-sm text-gray-400 mt-1">Gold Star Days ⭐</div>
            </div>
            <div className="bg-green-950/20 rounded-lg p-4 border border-green-600/30 text-center">
              <div className="text-3xl font-bold text-orange-400">{longestStreak}</div>
              <div className="text-sm text-gray-400 mt-1">Longest Streak</div>
            </div>
            <div className="bg-green-950/20 rounded-lg p-4 border border-green-600/30 text-center">
              <div className="text-3xl font-bold text-pink-400">{avgHabitsPerDay}</div>
              <div className="text-sm text-gray-400 mt-1">Avg Per Day</div>
            </div>
          </div>

          {/* Contribution Graph */}
          <StreakCalendar contributionData={contributionData} />

          {/* Back Button */}
        <div className="w-full flex justify-center mb-8 row-start-3">
          <Button href="/">
            {"Back to Home"}
          </Button>
        </div>
         
        </div>
      </div>
    </div>
  );
}