'use client';

import React from 'react';
import { Toggle } from '@/components';

interface PrivacyToggleProps {
  value: 'public' | 'private';
  onChange: (value: 'public' | 'private') => void;
  disabled?: boolean;
}

const PrivacyToggle: React.FC<PrivacyToggleProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const isPublic = value === 'public';

  const handleToggle = (enabled: boolean) => {
    onChange(enabled ? 'public' : 'private');
  };

  return (
    <div className="flex flex-col gap-3">
      <label className="text-white font-medium">Habit Privacy</label>

      <Toggle
        enabled={isPublic}
        onChange={handleToggle}
        disabled={disabled}
        label={isPublic ? 'Public' : 'Private'}
      />

      <p className="text-sm text-gray-400">
        {isPublic ? (
          <>Friends can see your habit names and details.</>
        ) : (
          <>Friends can only see &quot;checked off a habit&quot; without details.</>
        )}
      </p>
    </div>
  );
};

export default PrivacyToggle;
