'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useSupabaseAuth } from '@/hooks/auth/useSupabaseAuth';
import { useProfile } from '@/hooks/data/useProfile';
import { useHabits } from '@/hooks/data/useHabits';
import Container from '@/components/Container';
import ProfileHeader from '@/components/ProfileHeader';
import ProfileStats from '@/components/ProfileStats';
import Loading from '@/components/Loading';
import H1 from '@/components/H1';
import Button from '@/components/Button';
import type { ProfileStats as ProfileStatsType } from '@/types/profile.types';

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();

  const { user, loading: authLoading } = useSupabaseAuth({
    requireAuth: true,
    redirectTo: '/login',
  });

  const { profile, loading: profileLoading } = useProfile({
    userId: user?.id,
    autoFetch: true,
  });

  const { habits, loading: habitsLoading } = useHabits({
    userId: user?.id,
    autoFetch: true,
  });

  const [completions, setCompletions] = useState<Array<{ completion_date: string; habit_id: string }>>([]);
  const [completionsLoading, setCompletionsLoading] = useState(true);

  useEffect(() => {
    async function fetchCompletions() {
      if (!user?.id) {
        setCompletionsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('habit_completions')
          .select('completion_date, habit_id')
          .eq('user_id', user.id)
          .order('completion_date', { ascending: false });

        if (error) throw error;
        setCompletions(data || []);
      } catch (error) {
        console.error('Error fetching completions:', error);
        setCompletions([]);
      } finally {
        setCompletionsLoading(false);
      }
    }

    fetchCompletions();
  }, [user?.id, supabase]);

  const stats = useMemo<ProfileStatsType>(() => {
    if (!user || !habits || completionsLoading) {
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

    // Calculate current streak (consecutive days with at least 1 completion)
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

    // Calculate gold star days (days with 5+ completions)
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
  }, [user, habits, completions, completionsLoading]);

  const handleEditProfile = () => {
    router.push('/profile/edit');
  };

  if (authLoading || profileLoading || habitsLoading || completionsLoading) {
    return <Loading />;
  }

  const handleCreateProfile = async () => {
    if (!user) return;

    try {
      // Generate a username from email
      const emailUsername = user.email?.split('@')[0] || '';
      const username = emailUsername.toLowerCase().replace(/[^a-z0-9_]/g, '_') || `user_${user.id.substring(0, 8)}`;

      const { error } = await supabase
        .from('user_profiles')
        .insert({
          id: user.id,
          username: username,
          bio: null,
          habits_privacy: 'public',
          profile_picture_url: null,
        });

      if (error) {
        console.error('Error creating profile:', error);
        alert('Failed to create profile. Please try again.');
      } else {
        // Refetch profile
        window.location.reload();
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="flex justify-center px-4 py-8">
          <div className="w-full max-w-2xl space-y-6">
            <Container>
              <div className="text-center">
                <H1>Complete Your Profile</H1>
                <p className="text-gray-400 mt-4">
                  Welcome! Let&apos;s set up your profile to get started.
                </p>
                <div className="mt-6">
                  <Button
                    onClick={handleCreateProfile}
                    type="primary"
                  >
                    Create Profile
                  </Button>
                </div>
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
              isOwner={true}
              onEditProfile={handleEditProfile}
            />
          </Container>

          <Container>
            <div className="text-center">
              <h2 className="text-xl font-semibold text-white mb-4">My Stats</h2>
            </div>
            <ProfileStats stats={stats} />
          </Container>
        </div>
      </div>
    </div>
  );
}
