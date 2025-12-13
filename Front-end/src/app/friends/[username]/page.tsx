'use client';

import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useSupabaseAuth } from '@/hooks/auth/useSupabaseAuth';
import { useFriends } from '@/hooks/data/useFriends';
import {
  Container,
  ProfileHeader,
  ProfileStats,
  Loading,
  Button,
} from '@/components';
import type { UserProfile, ProfileStats as ProfileStatsType } from '@/types/profile.types';

export default function FriendProfilePage() {
  const router = useRouter();
  const params = useParams();
  const username = params.username as string;
  const supabase = createClient();

  const { user, loading: authLoading } = useSupabaseAuth({
    requireAuth: true,
    redirectTo: '/login',
  });

  const { friends, removeFriend, loading: friendsLoading } = useFriends({ userId: user?.id });

  const [friendUserId, setFriendUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [completions, setCompletions] = useState<Array<{ completion_date: string; habit_id: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [completionsLoading, setCompletionsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [habits, setHabits] = useState<any[]>([]);
  const [habitsLoading, setHabitsLoading] = useState(false);

  // Fetch profile by username
  useEffect(() => {
    async function fetchProfile() {
      if (!username || !user || friendsLoading) return;

      try {
        setLoading(true);
        setError(null);

        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('username', username)
          .single();

        if (profileError || !profileData) {
          setError('User not found');
          setLoading(false);
          return;
        }

        // Check if this user is a friend
        const isFriendCheck = friends.some(f => f.friend_id === profileData.id);

        if (!isFriendCheck) {
          setError('You can only view profiles of your friends');
          setLoading(false);
          return;
        }

        setProfile(profileData);
        setFriendUserId(profileData.id);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile');
        setLoading(false);
      }
    }

    fetchProfile();
  }, [username, user, friends, friendsLoading, supabase]);

  // Fetch friend's habits using RPC function
  useEffect(() => {
    async function fetchHabits() {
      if (!friendUserId) {
        setHabitsLoading(false);
        return;
      }

      try {
        setHabitsLoading(true);

        const { data, error } = await supabase.rpc('get_friend_habits', {
          friend_user_id: friendUserId
        });

        if (error) throw error;
        setHabits(data || []);
      } catch (error) {
        console.error('Error fetching friend habits:', error);
        setHabits([]);
      } finally {
        setHabitsLoading(false);
      }
    }

    fetchHabits();
  }, [friendUserId, supabase]);

  // Fetch friend's completions using RPC function
  useEffect(() => {
    async function fetchCompletions() {
      if (!friendUserId) {
        setCompletionsLoading(false);
        return;
      }

      try {
        setCompletionsLoading(true);

        const { data, error } = await supabase.rpc('get_friend_completions', {
          friend_user_id: friendUserId
        });

        if (error) throw error;
        setCompletions(data || []);
      } catch (error) {
        console.error('Error fetching friend completions:', error);
        setCompletions([]);
      } finally {
        setCompletionsLoading(false);
      }
    }

    fetchCompletions();
  }, [friendUserId, supabase]);

  const stats = useMemo<ProfileStatsType>(() => {
    if (!friendUserId || !habits || habitsLoading || completionsLoading) {
      return {
        total_habits: 0,
        total_completions: 0,
        current_streak: 0,
        longest_streak: 0,
        gold_star_days: 0,
        avg_habits_per_day: 0,
      };
    }

    const totalCompletions = completions.length;

    // Calculate current streak
    let currentStreak = 0;
    const today = new Date().toLocaleDateString('en-CA');
    const yesterday = new Date(Date.now() - 86400000).toLocaleDateString('en-CA');

    const uniqueDates = [...new Set(completions.map(c => c.completion_date))].sort().reverse();

    if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
      currentStreak = 1;
      let checkDate = uniqueDates[0];

      for (let i = 1; i < uniqueDates.length; i++) {
        const prevDate = new Date(checkDate);
        prevDate.setDate(prevDate.getDate() - 1);
        const expectedDate = prevDate.toLocaleDateString('en-CA');

        if (uniqueDates[i] === expectedDate) {
          currentStreak++;
          checkDate = uniqueDates[i];
        } else {
          break;
        }
      }
    }

    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 0;
    for (let i = 0; i < uniqueDates.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const prevDate = new Date(uniqueDates[i - 1]);
        prevDate.setDate(prevDate.getDate() - 1);
        const expectedDate = prevDate.toLocaleDateString('en-CA');

        if (uniqueDates[i] === expectedDate) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    // Calculate gold star days
    const completionsByDate: Record<string, number> = {};
    completions.forEach(c => {
      completionsByDate[c.completion_date] = (completionsByDate[c.completion_date] || 0) + 1;
    });
    const goldStarDays = Object.values(completionsByDate).filter(count => count >= 5).length;

    // Calculate average per day
    const daysSinceFirstCompletion = uniqueDates.length || 1;
    const avgPerDay = totalCompletions / daysSinceFirstCompletion;

    return {
      total_habits: habits.length,
      total_completions: totalCompletions,
      current_streak: currentStreak,
      longest_streak: longestStreak,
      gold_star_days: goldStarDays,
      avg_habits_per_day: avgPerDay,
    };
  }, [friendUserId, habits, completions, habitsLoading, completionsLoading]);

  const handleRemoveFriend = async () => {
    if (!profile || !window.confirm(`Remove ${profile.username} from your friends?`)) {
      return;
    }

    const success = await removeFriend(profile.id);
    if (success) {
      router.push('/friends');
    }
  };

  if (authLoading || friendsLoading || loading || habitsLoading || completionsLoading) {
    return <Loading />;
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="flex justify-center px-4 py-8">
          <div className="w-full max-w-2xl space-y-6">
            <Container>
              <div className="text-center">
                <h1 className="text-2xl font-bold text-white mb-4">
                  {error || 'Profile Not Found'}
                </h1>
                <Button
                  onClick={() => router.push('/friends')}
                  type="primary"
                >
                  Back to Friends
                </Button>
              </div>
            </Container>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex justify-center px-4 py-8">
        <div className="w-full max-w-2xl space-y-6">
          <Container>
            <ProfileHeader
              username={profile.username}
              bio={profile.bio}
              profilePictureUrl={profile.profile_picture_url}
              isOwner={false}
            />
            <div className="mt-4 text-center">
              <Button
                onClick={handleRemoveFriend}
                type="danger"
              >
                Remove Friend
              </Button>
            </div>
          </Container>

          <Container>
            <div className="text-center">
              <h2 className="text-xl font-semibold text-white mb-4">
                {profile.username}&apos;s Stats
              </h2>
              {profile.habits_privacy === 'private' && (
                <p className="text-gray-400 text-sm mb-4">
                  This user has set their habits to private
                </p>
              )}
            </div>
            <ProfileStats stats={stats} />
          </Container>
        </div>
      </div>
    </div>
  );
}
