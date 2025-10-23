export interface Habit {
  id: string;
  user_id: string;
  title: string;
  completed: boolean;
  current_streak: number;
  longest_streak: number;
  last_completed: string | null;
  created_at: string;
  is_archived: boolean;
}

export interface StreakData {
  current: number;
  longest: number;
}

export interface HabitAnalysis {
  completedToday: boolean;
  streaks: StreakData;
  lastCompletionDate: string | null;
  needsReset: boolean;
  hasStreakButNoDate: boolean;
  completedTodayButNotMarked: boolean;
  markedButNoCompletion: boolean;
}

export type UpdateReason = 
  | 'FIXING_MISSING_DATE' 
  | 'DAILY_RESET' 
  | 'SYNC_COMPLETION' 
  | 'FIX_INVALID_COMPLETION' 
  | 'STREAK_SYNC' 
  | 'NO_CHANGES';

export interface UpdateStrategy {
  shouldUpdate: boolean;
  updates: Partial<Habit>;
  reason: UpdateReason;
}

export interface HabitUpdate {
  id: string;
  title: string;
  updates: Partial<Habit>;
}