"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components";


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
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const [hoveredCount, setHoveredCount] = useState<number>(0);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [showTooltip, setShowTooltip] = useState(false);

  // Generate array of last 365 days
  const generateLast365Days = () => {
    const days = [];
    const today = new Date();
    for (let i = 364; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      days.push(date);
    }
    return days;
  };

  // Get color intensity based on habits completed (0-5)
  const getColorForCount = (count: number): string => {
    if (count === 0) return "#1a1a1a"; // Very dark gray for no activity
    if (count === 1) return "#0d4429"; // Darkest green
    if (count === 2) return "#006d32"; // Dark green
    if (count === 3) return "#26a641"; // Medium green
    if (count === 4) return "#39d353"; // Bright green
    return "#fbbf24"; // Gold for 5+ (perfect day!)
  };

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
    
    // Close tooltip when clicking outside the graph
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.contribution-square') && !target.closest('.tooltip-content')) {
        setShowTooltip(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex justify-center items-center">
        <div className="text-lg">Loading your stats...</div>
      </div>
    );
  }

  const last365Days = generateLast365Days();
  
  // Group days by week - FIXED: End weeks on Saturday (day 6) so weeks run Sun-Sat
  const weeks: (Date | null)[][] = [];
  let currentWeek: (Date | null)[] = [];
  
  last365Days.forEach((date, index) => {
    currentWeek.push(date);
    // End week on Saturday (day 6)
    if (date.getDay() === 6 || index === last365Days.length - 1) {
      weeks.push([...currentWeek]);
      currentWeek = [];
    }
  });

  // Ensure first week starts on Sunday (day 0)
  while (weeks[0] && weeks[0][0] && weeks[0][0].getDay() !== 0) {
    weeks[0].unshift(null);
  }

  // FIXED: Reverse the weeks array so today appears on the LEFT
  const reversedWeeks = [...weeks].reverse();

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const days = ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"];

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex justify-center px-4 py-8">
        <div className="w-full max-w-6xl space-y-6">
          
          {/* Header */}
          <div className="bg-green-950/20 rounded-lg p-6 border border-green-600/30">
            <h1 className="text-3xl font-bold text-center mb-2">
              {userName}'s Stats
            </h1>
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
          <div className="bg-green-950/20 rounded-lg p-6 border border-green-600/30 relative">
            <h2 className="text-xl font-bold text-center mb-2">365 Day Activity</h2>
            <p className="text-sm text-gray-400 text-center mb-4">
              Tap squares to see daily completions. Darker green = 1 habit, ⭐ = all 5 habits completed!
            </p>
            
            {/* GitHub-style tooltip */}
            {showTooltip && hoveredDate && (
              <div 
                className="tooltip-content absolute z-10 px-3 py-2 bg-gray-900 text-white text-xs rounded-md border border-gray-700 shadow-lg whitespace-nowrap"
                style={{
                  left: `${tooltipPosition.x}px`,
                  top: `${tooltipPosition.y}px`,
                  transform: 'translate(-50%, -100%)',
                  marginTop: '-8px'
                }}
              >
                <div className="font-semibold">
                  {hoveredCount === 5 ? '⭐ Gold Star Day! ⭐' : `${hoveredCount} habit${hoveredCount !== 1 ? 's' : ''}`}
                </div>
                {hoveredCount === 5 && (
                  <div className="text-yellow-400 text-center">All 5 habits completed!</div>
                )}
                <div className="text-gray-400">{hoveredDate}</div>
                <div 
                  className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-full"
                  style={{
                    width: 0,
                    height: 0,
                    borderLeft: '6px solid transparent',
                    borderRight: '6px solid transparent',
                    borderTop: '6px solid #1f2937'
                  }}
                />
              </div>
            )}
            
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full">
                {/* Month labels */}
                <div className="flex mb-2" style={{ paddingLeft: '32px' }}>
                  {reversedWeeks.map((week, weekIndex) => {
                    const firstDay = week.find(d => d !== null);
                    if (!firstDay) return <div key={weekIndex} className="w-3 mr-1"></div>;
                    
                    const isFirstOfMonth = firstDay.getDate() <= 7;
                    const prevWeekFirstDay = reversedWeeks[weekIndex - 1]?.find(d => d !== null);
                    const showMonth = isFirstOfMonth && (weekIndex === 0 || prevWeekFirstDay?.getMonth() !== firstDay.getMonth());
                    
                    return (
                      <div key={weekIndex} className="w-3 mr-1 text-xs text-gray-400">
                        {showMonth ? months[firstDay.getMonth()] : ''}
                      </div>
                    );
                  })}
                </div>

                {/* Graph */}
                <div className="flex">
                  {/* Day labels */}
                  <div className="flex flex-col justify-between mr-2 text-xs text-gray-400" style={{ height: '112px' }}>
                    <div>Sun</div>
                    <div>Mon</div>
                    <div>Tue</div>
                    <div>Wed</div>
                    <div>Thu</div>
                    <div>Fri</div>
                    <div>Sat</div>
                  </div>

                  {/* Contribution squares */}
                  <div className="flex">
                    {reversedWeeks.map((week, weekIndex) => (
                      <div key={weekIndex} className="flex flex-col mr-1">
                        {week.map((date, dayIndex) => {
                          if (!date) {
                            return <div key={dayIndex} className="w-3 h-3 mb-1"></div>;
                          }
                          
                          const dateStr = date.toISOString().split('T')[0];
                          const count = contributionData[dateStr] || 0;
                          const color = getColorForCount(count);
                          
                          // Format date for display
                          const displayDate = new Date(dateStr).toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          });
                          
                          return (
                            <div
                              key={dayIndex}
                              className="contribution-square w-3 h-3 mb-1 rounded-sm cursor-pointer transition-all active:scale-110 flex items-center justify-center"
                              style={{ 
                                backgroundColor: count === 5 ? "#1a1a1a" : color,
                                fontSize: "12px",
                                lineHeight: "1"
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                const rect = e.currentTarget.getBoundingClientRect();
                                const containerRect = e.currentTarget.closest('.bg-green-950\\/20')?.getBoundingClientRect();
                                if (containerRect) {
                                  setTooltipPosition({
                                    x: rect.left - containerRect.left + rect.width / 2,
                                    y: rect.top - containerRect.top
                                  });
                                }
                                setHoveredDate(displayDate);
                                setHoveredCount(count);
                                setShowTooltip(true);
                              }}
                            >
                              {count === 5 ? "⭐" : ""}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Legend */}
                <div className="flex items-center justify-start mt-4 text-xs text-gray-400">
                  <span className="mr-2">Less</span>
                  <div className="flex items-center gap-1">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#1a1a1a" }}></div>
                      <span className="text-[10px] mt-1">0</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#0d4429" }}></div>
                      <span className="text-[10px] mt-1">1</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#006d32" }}></div>
                      <span className="text-[10px] mt-1">2</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#26a641" }}></div>
                      <span className="text-[10px] mt-1">3</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#39d353" }}></div>
                      <span className="text-[10px] mt-1">4</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-sm bg-black flex items-center justify-center text-sm" style={{ backgroundColor: "#1a1a1a" }}>
                        ⭐
                      </div>
                      <span className="text-[10px] mt-1">5</span>
                    </div>
                  </div>
                  <span className="ml-2">More</span>
                </div>
              </div>
            </div>
          </div>

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