import React from 'react';

interface ToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
  label?: string;
  className?: string;
}

const Toggle: React.FC<ToggleProps> = ({
  enabled,
  onChange,
  disabled = false,
  label,
  className = '',
}) => {
  const handleToggle = () => {
    if (!disabled) {
      onChange(!enabled);
    }
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full transition-colors
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${enabled ? 'bg-green-600' : 'bg-gray-600'}
        `}
        aria-pressed={enabled}
        role="switch"
      >
        <span
          className={`
            inline-block h-4 w-4 transform rounded-full bg-white transition-transform
            ${enabled ? 'translate-x-6' : 'translate-x-1'}
          `}
        />
      </button>

      {label && (
        <span className="text-gray-300">
          {label}
        </span>
      )}
    </div>
  );
};

export default Toggle;
