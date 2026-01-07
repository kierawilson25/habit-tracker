'use client';

import { useRouter } from 'next/navigation';
import { useSupabaseAuth } from '@/hooks/auth/useSupabaseAuth';
import { useProfile } from '@/hooks/data/useProfile';
import { useHabits } from '@/hooks/data/useHabits';
import { useFriends } from '@/hooks/data/useFriends';
import { useUserStats } from '@/hooks/data/useUserStats';
import {
  Container,
  ProfileHeader,
  ProfileStats,
  Loading,
  H1,
  Button,
} from '@/components';
import { createClient } from '@/utils/supabase/client';

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

  const { friends, loading: friendsLoading } = useFriends({
    userId: user?.id,
    autoFetch: true,
  });

  const { stats, loading: statsLoading } = useUserStats({
    userId: user?.id,
    totalHabits: habits.length,
    autoFetch: true,
  });

  const handleEditProfile = () => {
    router.push('/profile/edit');
  };

  if (authLoading || profileLoading || habitsLoading || statsLoading || friendsLoading) {
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
                <H1 text="Complete Your Profile" />
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
              <h2 className="text-xl font-semibold text-white mb-4">Friends</h2>
              <div className="flex items-center justify-center gap-2 mb-6">
                <span className="text-3xl font-bold text-green-400">
                  {friends.length}
                </span>
                <span className="text-gray-400">
                  {friends.length === 1 ? 'friend' : 'friends'}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => router.push('/friends')}
                  type="primary"
                >
                  View Friends
                </Button>
                <Button
                  onClick={() => router.push('/friends/requests')}
                  type="secondary"
                >
                  Add Friends
                </Button>
              </div>
            </div>
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
