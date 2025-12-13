'use client';

import React from 'react';
import { useFeedActivities } from '@/hooks/data/useFeedActivities';
import { FeedCard } from './FeedCard';
import { LoadMoreButton } from './LoadMoreButton';
import Loading from './Loading';
import Button from './Button';

export interface ActivityFeedProps {
  /**
   * User ID to fetch activities for
   */
  userId: string;

  /**
   * Number of activities per page
   * @default 20
   */
  pageSize?: number;
}

/**
 * ActivityFeed component
 *
 * Container that displays a paginated feed of activities
 */
export function ActivityFeed({ userId, pageSize = 20 }: ActivityFeedProps) {
  const { activities, loading, error, hasMore, loadMore } = useFeedActivities({
    userId,
    pageSize,
    autoFetch: true,
  });

  // Initial loading state
  if (loading && activities.length === 0) {
    return <Loading />;
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-600 text-red-400 px-4 py-3 rounded">
        Failed to load activities: {error.message}
      </div>
    );
  }

  // Empty state
  if (activities.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📭</div>
        <h3 className="text-xl font-semibold text-white mb-2">No Activities Yet</h3>
        <p className="text-gray-400 mb-6 text-center">
          Add friends to see their activities!
        </p>
        <Button
          onClick={() => window.location.href = '/friends/requests'}
          type="primary"
        >
          Add Friends
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Activity list */}
      {activities.map((activity) => (
        <FeedCard key={activity.id} activity={activity} userId={userId} />
      ))}

      {/* Load more button */}
      <LoadMoreButton
        hasMore={hasMore}
        loading={loading}
        onLoadMore={loadMore}
      />
    </div>
  );
}
