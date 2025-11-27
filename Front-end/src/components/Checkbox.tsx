'use client';
import React from 'react';
import { launchConfetti } from '@/utils/confetti';

type CheckboxProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

const Checkbox: React.FC<CheckboxProps> = ({ label, checked, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    onChange(isChecked);

    if (isChecked) {
      launchConfetti();
    }
  };

  return (
    <div className="w-full">
      <label className="inline-flex items-center space-x-2 cursor-pointer w-full">
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