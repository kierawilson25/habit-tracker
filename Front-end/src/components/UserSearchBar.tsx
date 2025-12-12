'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface UserSearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

const UserSearchBar: React.FC<UserSearchBarProps> = ({
  onSearch,
  placeholder = 'Search by username...',
  debounceMs = 300,
}) => {
  const [value, setValue] = useState('');

  const debouncedSearch = useCallback(
    (searchValue: string) => {
      const handler = setTimeout(() => {
        onSearch(searchValue);
      }, debounceMs);

      return () => {
        clearTimeout(handler);
      };
    },
    [onSearch, debounceMs]
  );

  useEffect(() => {
    const cleanup = debouncedSearch(value);
    return cleanup;
  }, [value, debouncedSearch]);

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 pl-10 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-green-600 focus:outline-none"
      />
      <svg
        className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    </div>
  );
};

export default UserSearchBar;
