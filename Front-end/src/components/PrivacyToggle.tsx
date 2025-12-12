'use client';

import React from 'react';

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

  const handleToggle = () => {
    if (!disabled) {
      onChange(isPublic ? 'private' : 'public');
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <label className="text-white font-medium">Habit Privacy</label>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleToggle}
          disabled={disabled}
          className={`
            relative inline-flex h-6 w-11 items-center rounded-full transition-colors
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            ${isPublic ? 'bg-green-600' : 'bg-gray-600'}
          `}
        >
          <span
            className={`
              inline-block h-4 w-4 transform rounded-full bg-white transition-transform
              ${isPublic ? 'translate-x-6' : 'translate-x-1'}
            `}
          />
        </button>

        <span className="text-gray-300">
          {isPublic ? 'Public' : 'Private'}
        </span>
      </div>

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
