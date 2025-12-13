import React from 'react';
import Button from './Button';

export interface LoadMoreButtonProps {
  /**
   * Whether there are more items to load
   */
  hasMore: boolean;

  /**
   * Whether currently loading
   */
  loading: boolean;

  /**
   * Callback when button is clicked
   */
  onLoadMore: () => void;

  /**
   * Custom text for the button
   * @default 'Load More'
   */
  text?: string;
}

/**
 * LoadMoreButton component
 *
 * Button for loading more items with pagination
 */
export function LoadMoreButton({
  hasMore,
  loading,
  onLoadMore,
  text = 'Load More',
}: LoadMoreButtonProps) {
  if (!hasMore) {
    return (
      <div className="text-center py-4 text-gray-500">
        No more activities to load
      </div>
    );
  }

  return (
    <div className="flex justify-center py-4">
      <Button
        onClick={onLoadMore}
        type="secondary"
        loading={loading}
        disabled={loading}
      >
        {loading ? 'Loading...' : text}
      </Button>
    </div>
  );
}
