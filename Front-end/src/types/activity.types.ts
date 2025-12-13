export type ActivityType =
  | 'habit_completion'
  | 'gold_star_day'
  | 'streak_milestone'
  | 'new_longest_streak';

export interface FeedActivity {
  id: string;
  user_id: string;
  activity_type: ActivityType;
  habit_id: string | null;
  metadata: Record<string, any>;
  created_at: string;
  user?: {
    username: string;
    profile_picture_url: string | null;
    habits_privacy: 'public' | 'private';
  };
  habit?: {
    title: string | null;
  };
  like_count?: number;
  comment_count?: number;
  is_liked?: boolean;
}

export interface ActivityLike {
  id: string;
  activity_id: string;
  user_id: string;
  created_at: string;
  user?: {
    username: string;
    profile_picture_url: string | null;
  };
}

export interface ActivityComment {
  id: string;
  activity_id: string;
  user_id: string;
  comment_text: string;
  created_at: string;
  updated_at: string;
  user?: {
    username: string;
    profile_picture_url: string | null;
  };
}
