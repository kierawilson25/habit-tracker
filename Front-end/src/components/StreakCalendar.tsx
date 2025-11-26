"use client";
import { useState, useEffect } from "react";
import Container from "./Container";

interface StreakCalendarProps {
  contributionData: Record<string, number>;
}

export default function StreakCalendar({ contributionData }: StreakCalendarProps) {
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

  useEffect(() => {
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

  return (
    <Container className="relative">
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
    </Container>
  );
}
