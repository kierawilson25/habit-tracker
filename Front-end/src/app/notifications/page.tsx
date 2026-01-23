/**
 * Notifications Page
 *
 * Displays user's in-app notifications with filtering, mark as read functionality,
 * and pagination. Shows empty, loading, and error states.
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabaseAuth } from '@/hooks/auth/useSupabaseAuth';
import { useNotifications } from '@/hooks/data/useNotifications';
import {
  Container,
  H1,
  Loading,
  Button,
} from '@/components';
import NotificationCard from '@/components/NotificationCard';
import type { InAppNotification } from '@/types/notification.types';

export default function NotificationsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useSupabaseAuth({
    requireAuth: true,
    redirectTo: '/login',
  });

  const [activeFilter, setActiveFilter] = useState<'all' | 'posts' | 'likes' | 'comments' | 'requests'>('all');
  const hasMarkedAsRead = useRef(false);

  const {
    notifications,
    unreadCount,
    loading,
    error,
    hasMore,
    loadMore,
    markAsRead,
    markAllAsRead,
  } = useNotifications({
    userId: user?.id,
    filter: activeFilter,
    pageSize: 20,
    autoFetch: true,
  });

  // Auto-mark all as read when visiting notifications page
  useEffect(() => {
    if (user?.id && !loading && !hasMarkedAsRead.current) {
      console.log('🔔 Auto-marking all notifications as read');
      hasMarkedAsRead.current = true;
      markAllAsRead();

      // Trigger a custom event to notify AppHeader to refetch badge count
      window.dispatchEvent(new CustomEvent('notifications-marked-read'));
    }
  }, [user?.id, loading]); // Run when user is set and loading completes

  const handleNotificationClick = async (notification: InAppNotification) => {
    // Mark as read
    await markAsRead(notification.id);

    // Navigate based on notification type
    if (notification.type === 'friend_request') {
      // For friend requests, navigate to friend requests page
      router.push('/friends/requests');
    } else {
      // For other notifications, navigate to feed with highlighted activity
      router.push(`/feed?highlight=${notification.activity_id}`);
    }
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
  };

  // Auth loading state
  if (authLoading) {
    return <Loading />;
  }

  // Not authenticated
  if (!user) {
    return null; // Will redirect via useSupabaseAuth
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex justify-center px-4 py-8">
        <div className="w-full max-w-2xl">
          <Container>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <H1 text="Notifications" />
              <button
                onClick={handleMarkAllRead}
                disabled={unreadCount === 0 || loading}
                className="text-sm text-green-400 hover:text-green-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-green px-3 py-2 rounded"
                aria-label="Mark all notifications as read"
              >
                Mark all read
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="relative mb-6 border-b border-gray-700">
              <div className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth" role="tablist">
                {[
                  { key: 'all', label: 'All' },
                  { key: 'posts', label: 'Posts' },
                  { key: 'likes', label: 'Likes' },
                  { key: 'comments', label: 'Comments' },
                  { key: 'requests', label: 'Requests' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    role="tab"
                    aria-selected={activeFilter === tab.key}
                    className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-[1px] focus-green whitespace-nowrap flex-shrink-0 ${
                      activeFilter === tab.key
                        ? 'text-green-400 border-green-400'
                        : 'text-gray-400 border-transparent hover:text-gray-300'
                    }`}
                    onClick={() => setActiveFilter(tab.key as any)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Loading State */}
            {loading && notifications.length === 0 && (
              <div className="space-y-4" aria-live="polite" aria-busy="true">
                <p className="sr-only">Loading notifications</p>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-4 p-4 bg-gray-800 rounded-lg animate-pulse">
                    <div className="w-8 h-8 bg-gray-700 rounded-full" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-700 rounded w-3/4 mb-2" />
                      <div className="h-3 bg-gray-700 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="bg-red-900/20 border border-red-600 text-red-400 px-4 py-3 rounded" role="alert">
                <div className="flex items-center gap-3">
                  <span className="text-2xl" aria-hidden="true">⚠️</span>
                  <div className="flex-1">
                    <p className="font-semibold">Failed to load notifications</p>
                    <p className="text-sm mt-1">{error.message}</p>
                  </div>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors focus-green"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}

            {/* Notification List */}
            {!loading && !error && notifications.length > 0 && (
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    onClick={handleNotificationClick}
                  />
                ))}

                {/* Load More Button */}
                {hasMore && (
                  <div className="flex justify-center mt-6">
                    <Button
                      onClick={loadMore}
                      type="secondary"
                      loading={loading}
                      disabled={loading}
                    >
                      {loading ? 'Loading...' : 'Load more'}
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && notifications.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4" aria-hidden="true">🔕</div>
                <h3 className="text-xl font-semibold text-white mb-2">All caught up!</h3>
                <p className="text-gray-400 mb-6">
                  No new notifications. Check back later!
                </p>
                <Button
                  onClick={() => router.push('/feed')}
                  type="primary"
                >
                  View Feed
                </Button>
              </div>
            )}
          </Container>
        </div>
      </div>
    </div>
  );
}
