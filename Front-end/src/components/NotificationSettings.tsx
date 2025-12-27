'use client';

import React from 'react';
import { Toggle } from '@/components';
import { useNotificationPreferences } from '@/hooks/data/useNotificationPreferences';

interface NotificationSettingsProps {
  userId: string;
  disabled?: boolean;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  userId,
  disabled = false,
}) => {
  const { preferences, loading, updatePreferences } = useNotificationPreferences({
    userId,
    autoFetch: true,
  });

  // Handle master email toggle
  const handleEmailEnabledChange = async (enabled: boolean) => {
    await updatePreferences({ email_enabled: enabled });
  };

  // Handle daily reminder toggle
  const handleDailyReminderChange = async (enabled: boolean) => {
    await updatePreferences({ daily_reminder_enabled: enabled });
  };

  // Handle incomplete reminder toggle
  const handleIncompleteReminderChange = async (enabled: boolean) => {
    await updatePreferences({ reminder_if_incomplete_enabled: enabled });
  };

  // Handle none reminder toggle
  const handleNoneReminderChange = async (enabled: boolean) => {
    await updatePreferences({ reminder_if_none_enabled: enabled });
  };

  // Handle in-app notification preferences
  const handlePreferenceChange = async (key: string, enabled: boolean) => {
    await updatePreferences({ [key]: enabled });
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        <label className="text-white font-medium">Email Notifications</label>
        <p className="text-sm text-gray-400">Loading preferences...</p>
      </div>
    );
  }

  const emailEnabled = preferences?.email_enabled ?? false;
  const dailyReminderEnabled = preferences?.daily_reminder_enabled ?? false;

  return (
    <div className="flex flex-col gap-3">
      <label className="text-white font-medium">Email Notifications</label>

      {/* Master toggle */}
      <Toggle
        enabled={emailEnabled}
        onChange={handleEmailEnabledChange}
        disabled={disabled}
        label={emailEnabled ? 'Enabled' : 'Disabled'}
      />

      {emailEnabled && (
        <div className="ml-6 space-y-4 border-l-2 border-gray-700 pl-4">
          {/* Daily reminder toggle */}
          <div className="flex flex-col gap-3">
            <Toggle
              enabled={dailyReminderEnabled}
              onChange={handleDailyReminderChange}
              disabled={disabled}
              label="Daily habit reminders"
            />
            <p className="text-sm text-gray-400">
              Get playful daily reminders to track your habits
            </p>
          </div>

          {/* Nested reminder type toggles */}
          {dailyReminderEnabled && (
            <div className="ml-6 space-y-3 border-l-2 border-gray-600 pl-4">
              <div className="flex flex-col gap-2">
                <Toggle
                  enabled={preferences?.reminder_if_incomplete_enabled ?? true}
                  onChange={handleIncompleteReminderChange}
                  disabled={disabled}
                  label="Remind if incomplete"
                />
                <p className="text-xs text-gray-500">
                  Remind me if I tracked some habits but not all
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <Toggle
                  enabled={preferences?.reminder_if_none_enabled ?? true}
                  onChange={handleNoneReminderChange}
                  disabled={disabled}
                  label="Remind if none tracked"
                />
                <p className="text-xs text-gray-500">
                  Remind me if I haven&apos;t tracked any habits today
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      <p className="text-sm text-gray-400">
        {emailEnabled ? (
          <>Receive funny Duolingo-style reminders to keep your habits on track</>
        ) : (
          <>Enable email notifications to receive daily habit reminders</>
        )}
      </p>

      {/* In-App Notifications */}
      <div className="flex flex-col gap-3 mt-6 pt-6 border-t border-gray-700">
        <label className="text-white font-medium">In-App Notifications</label>

        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <Toggle
              enabled={preferences?.notify_friend_posts ?? true}
              onChange={(enabled) => handlePreferenceChange('notify_friend_posts', enabled)}
              disabled={disabled}
              label="Friend posts"
            />
            <p className="text-sm text-gray-400">
              Get notified when friends complete habits and earn achievements
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Toggle
              enabled={preferences?.notify_likes ?? true}
              onChange={(enabled) => handlePreferenceChange('notify_likes', enabled)}
              disabled={disabled}
              label="Likes"
            />
            <p className="text-sm text-gray-400">
              Get notified when someone likes your activity
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Toggle
              enabled={preferences?.notify_comments ?? true}
              onChange={(enabled) => handlePreferenceChange('notify_comments', enabled)}
              disabled={disabled}
              label="Comments"
            />
            <p className="text-sm text-gray-400">
              Get notified when someone comments on your activity
            </p>
          </div>
        </div>

        <p className="text-sm text-gray-400">
          Control which notifications appear in your notification center
        </p>
      </div>
    </div>
  );
};

export default NotificationSettings;
