'use client';

import React, { useState } from 'react';
import Button from './Button';

export interface CommentInputProps {
  /**
   * Callback when comment is submitted
   */
  onSubmit: (text: string) => Promise<boolean>;

  /**
   * Placeholder text
   * @default 'Add a comment...'
   */
  placeholder?: string;
}

/**
 * CommentInput component
 *
 * Input field for adding comments with character limit
 */
export function CommentInput({ onSubmit, placeholder = 'Add a comment...' }: CommentInputProps) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!text.trim()) return;

    setLoading(true);
    const success = await onSubmit(text);
    setLoading(false);

    if (success) {
      setText('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3">
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-green-600 focus:outline-none text-sm"
          maxLength={500}
          disabled={loading}
        />
        <Button
          htmlType="submit"
          type="primary"
          size="sm"
          loading={loading}
          disabled={loading || !text.trim()}
          className="w-full sm:w-auto"
        >
          Post
        </Button>
      </div>
      <p className="text-xs text-gray-500 mt-1">
        {text.length}/500 characters
      </p>
    </form>
  );
}
