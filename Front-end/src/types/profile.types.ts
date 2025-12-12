export interface UserProfile {
  id: string;
  username: string;
  bio: string | null;
  habits_privacy: 'public' | 'private';
  profile_picture_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProfileStats {
  total_habits: number;
  total_completions: number;
  current_streak: number;
  longest_streak: number;
  gold_star_days: number;
  avg_habits_per_day: number;
}
