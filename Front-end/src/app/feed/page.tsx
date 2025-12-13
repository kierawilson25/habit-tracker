'use client';

import { useAuth } from '@/context/AuthContext';
import Container from '@/components/Container';
import H1 from '@/components/H1';
import { ActivityFeed } from '@/components/ActivityFeed';
import Loading from '@/components/Loading';

export default function FeedPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="flex justify-center px-4 py-8">
          <div className="w-full max-w-2xl">
            <Container>
              <H1 text="Feed" />
              <p className="text-gray-400 mt-4">Please log in to view your activity feed.</p>
            </Container>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex justify-center px-4 py-8">
        <div className="w-full max-w-2xl">
          <Container>
            <H1 text="Activity Feed" />
            <p className="text-gray-400 mb-6 text-center">
              See what your friends have been up to!
            </p>

            <ActivityFeed userId={user.id} pageSize={20} />
          </Container>
        </div>
      </div>
    </div>
  );
}
