// components/Checkbox.tsx
'use client'
'use client';
import React, { useEffect, useState } from 'react';
import { launchConfetti } from '@/utils/confetti';


type CheckboxProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

const Checkbox: React.FC<CheckboxProps> = ({ label, checked, onChange }) => {
  const [hasShownConfetti, setHasShownConfetti] = useState(false);

  useEffect(() => {
    const key = `confetti_shown_${label}`;
    const wasShown = localStorage.getItem(key);
    setHasShownConfetti(!!wasShown);
  }, [label]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    onChange(isChecked);

    if (isChecked && !hasShownConfetti) {
      launchConfetti();
      localStorage.setItem(`confetti_shown_${label}`, 'true');
      setHasShownConfetti(true);
    }
  };

  return (
    <div>
      <label className="inline-flex items-center space-x-2 cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={handleChange}
          className="form-checkbox h-5 w-5 accent-green-600"
        />
        <span className="text-white">{label}</span>
      </label>

    </div>
  );
};

export default Checkbox;

