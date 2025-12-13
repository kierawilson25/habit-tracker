'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useFeedActivities } from '@/hooks/data/useFeedActivities';

export default function TestFeedPage() {
  const { user } = useAuth();
  const { activities, loading, error, hasMore, loadMore } = useFeedActivities({
    userId: user?.id,
    pageSize: 20,
    autoFetch: true,
  });

  if (loading) return <div className="text-white p-8">Loading...</div>;
  if (error) return <div className="text-red-500 p-8">Error: {error.message}</div>;

  return (
    <div className="p-8 text-white">
      <h1 className="text-2xl mb-4">Feed Activities Test</h1>
      <p className="mb-4">Total activities: {activities.length}</p>

      {activities.length === 0 ? (
        <p className="text-gray-400">No activities yet. Complete some habits to generate activities!</p>
      ) : (
        activities.map((activity) => (
          <div key={activity.id} className="bg-gray-800 p-4 mb-2 rounded">
            <p><strong>Type:</strong> {activity.activity_type}</p>
            <p><strong>User:</strong> {activity.user?.username}</p>
            <p><strong>Privacy:</strong> {activity.user?.habits_privacy}</p>
            <p><strong>Habit:</strong> {activity.habit?.title || 'Hidden/None'}</p>
            <p><strong>Metadata:</strong> {JSON.stringify(activity.metadata)}</p>
            <p className="text-sm text-gray-500 mt-2">{new Date(activity.created_at).toLocaleString()}</p>
          </div>
        ))
      )}

      {hasMore && (
        <button
          onClick={loadMore}
          className="mt-4 px-4 py-2 bg-green-600 rounded hover:bg-green-700"
        >
          Load More
        </button>
      )}
    </div>
  );
}
