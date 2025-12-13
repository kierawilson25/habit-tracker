import React from 'react';
import { StatCard } from '@/components';
import type { ProfileStats as ProfileStatsType } from '@/types/profile.types';

interface ProfileStatsProps {
  stats: ProfileStatsType;
}

const ProfileStats: React.FC<ProfileStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      <StatCard
        value={stats.total_habits}
        label="Total Habits"
        color="blue"
      />
      <StatCard
        value={stats.total_completions}
        label="Completions"
        color="green"
      />
      <StatCard
        value={stats.current_streak}
        label="Current Streak"
        color="orange"
      />
      <StatCard
        value={stats.longest_streak}
        label="Longest Streak"
        color="purple"
      />
      <StatCard
        value={stats.gold_star_days}
        label="Gold Star Days"
        color="yellow"
      />
      <StatCard
        value={stats.avg_habits_per_day.toFixed(1)}
        label="Avg Per Day"
        color="red"
      />
    </div>
  );
};

export default ProfileStats;
