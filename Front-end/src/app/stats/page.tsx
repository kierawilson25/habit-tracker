"use client";
import { useState, useEffect } from "react";
import { Button, H1, StreakCalendar, Container, StatCard, Loading } from "@/components";
import { useSupabaseAuth, useHabits, useUserStats } from "@/hooks";


export default function StatsPage() {
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

  const [userName, setUserName] = useState("");
  const [contributionData, setContributionData] = useState<Record<string, number>>({});

  const fetchContributionData = async () => {
    try {
      if (!user) return;

      const displayName = user.user_metadata?.display_name || user.email?.split('@')[0] || "User";
      setUserName(displayName);

      // Fetch all completions for the past 365 days (for calendar visualization)
      const oneYearAgo = new Date();
      oneYearAgo.setDate(oneYearAgo.getDate() - 365);

      const { data: completions, error: completionsError } = await supabase
        .from("habit_completions")
        .select("completion_date, habit_id")
        .eq("user_id", user.id)
        .gte("completion_date", oneYearAgo.toISOString().split('T')[0]);

      if (completionsError) {
        console.error("Failed to fetch completions:", completionsError.message);
        return;
      }

      // Process completions into a date-based map for calendar visualization
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
    } catch (error) {
      console.error("Error in fetchContributionData:", error);
    }
  };

  useEffect(() => {
    // Load contribution data when user is available
    if (user) {
      fetchContributionData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (authLoading || habitsLoading || statsLoading) {
    return <Loading text="Loading your stats..." />
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex justify-center px-4 py-8">
        <div className="w-full max-w-2xl space-y-6">
          
          {/* Header */}
          <Container>
            <H1 text={userName + "'s Stats"}/>
            <p className="text-gray-400 text-center">
              Your habit completion journey
            </p>
          </Container>

          {/* Stats Overview Cards */}
          <div className="grid grid-cols-3 gap-4">
            <StatCard value={stats.total_active_days} label="Active Days" color="blue" />
            <StatCard value={stats.total_completions} label="Habits Completed" color="red" />
            <StatCard value={stats.current_streak} label="Current Streak" color="purple" />
            <StatCard value={stats.longest_streak} label="Longest Streak" color="orange" />
            <StatCard value={stats.gold_star_days} label="Gold Star Days ⭐" color="yellow" />
            <StatCard value={stats.avg_habits_per_day} label="Avg Per Day" color="pink" />
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