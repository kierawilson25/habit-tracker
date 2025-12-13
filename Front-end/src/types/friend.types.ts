import type { UserProfile } from './profile.types';

export interface FriendRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
  sender?: UserProfile;
  receiver?: UserProfile;
}

export interface Friendship {
  id: string;
  user_id: string;
  friend_id: string;
  created_at: string;
  friend?: UserProfile;
}

export type FriendshipStatus = 'none' | 'request_sent' | 'request_received' | 'friends';

export interface UserSearchResult {
  id: string;
  username: string;
  profile_picture_url: string | null;
  friendship_status: FriendshipStatus;
}
