'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabaseAuth } from '@/hooks/auth/useSupabaseAuth';
import { useProfile } from '@/hooks/data/useProfile';
import {
  Container,
  H1,
  Button,
  ProfilePicture,
  PrivacyToggle,
  NotificationSettings,
  Loading,
} from '@/components';

export default function EditProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useSupabaseAuth({
    requireAuth: true,
    redirectTo: '/login',
  });

  const {
    profile,
    loading: profileLoading,
    updateProfile,
    uploadProfilePicture,
  } = useProfile({
    userId: user?.id,
    autoFetch: true,
  });

  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [habitsPrivacy, setHabitsPrivacy] = useState<'public' | 'private'>('public');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (profile) {
      setUsername(profile.username);
      setBio(profile.bio || '');
      setHabitsPrivacy(profile.habits_privacy);
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!username.trim()) {
      setError('Username is required');
      return;
    }

    if (username.length < 3 || username.length > 30) {
      setError('Username must be between 3 and 30 characters');
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError('Username can only contain letters, numbers, and underscores');
      return;
    }

    try {
      setSaving(true);

      const success = await updateProfile({
        username: username.trim(),
        bio: bio.trim() || null,
        habits_privacy: habitsPrivacy,
      });

      if (success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/profile');
        }, 1500);
      } else {
        setError('Failed to update profile');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push('/profile');
  };

  if (authLoading || profileLoading) {
    return <Loading />;
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="flex justify-center px-4 py-8">
          <div className="w-full max-w-2xl">
            <Container>
              <H1 text="Profile Not Found" />
              <p className="text-gray-400">Unable to load profile for editing. Please log in.</p>
            </Container>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex justify-center px-4 py-8">
        <div className="w-full max-w-2xl">
          <Container>
            <H1 text="Edit Profile" />

            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
              <div className="flex justify-center">
                <ProfilePicture
                  currentUrl={profile.profile_picture_url}
                  username={username || profile.username}
                  onUpload={uploadProfilePicture}
                  editable={true}
                  size="xl"
                />
              </div>

              <div>
                <label htmlFor="username" className="block text-white font-medium mb-2">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:border-green-600 focus:outline-none"
                  placeholder="Enter username"
                  maxLength={30}
                  disabled={saving}
                />
                <p className="text-sm text-gray-400 mt-1">
                  3-30 characters, letters, numbers, and underscores only
                </p>
              </div>

              <div>
                <label htmlFor="bio" className="block text-white font-medium mb-2">
                  Bio
                </label>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-4 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:border-green-600 focus:outline-none"
                  placeholder="Tell us about yourself..."
                  rows={4}
                  maxLength={500}
                  disabled={saving}
                />
                <p className="text-sm text-gray-400 mt-1">
                  {bio.length}/500 characters
                </p>
              </div>

              <PrivacyToggle
                value={habitsPrivacy}
                onChange={setHabitsPrivacy}
                disabled={saving}
              />

              <NotificationSettings
                userId={user.id}
                disabled={saving}
              />

              {error && (
                <div className="bg-red-900/20 border border-red-600 text-red-400 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-900/20 border border-green-600 text-green-400 px-4 py-3 rounded">
                  Profile updated successfully! Redirecting...
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  htmlType="submit"
                  type="primary"
                  fullWidth
                  loading={saving}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>

                <Button
                  onClick={handleCancel}
                  type="secondary"
                  fullWidth
                  disabled={saving}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Container>
        </div>
      </div>
    </div>
  );
}
