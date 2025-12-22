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
    </div>
  );
};

export default NotificationSettings;
