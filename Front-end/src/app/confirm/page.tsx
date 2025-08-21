'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient as createSupabaseClient } from '../../utils/supabase/client';

// Move the component that uses useSearchParams into a separate component
function ConfirmContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createSupabaseClient();
  const [loading, setLoading] = useState(true);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(5);

  // Function to check confirmation status in database
  const checkConfirmationStatus = async () => {
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('Unable to get user information');
      }

      // Query the auth.users table to check confirmed_at status
      const { data, error } = await supabase
        .from('auth.users')
        .select('confirmed_at, email_confirmed_at')
        .eq('id', user.id)
        .single();

      if (error) {
        // If we can't access auth.users directly, check user metadata
        // Supabase user object should have email_confirmed_at in user_metadata or directly
        const isConfirmed = user.email_confirmed_at !== null || 
                           user.confirmed_at !== null ||
                           user.user_metadata?.email_verified === true;
        
        return isConfirmed;
      }

      // Check if either confirmed_at or email_confirmed_at is not null
      return data.confirmed_at !== null || data.email_confirmed_at !== null;
      
    } catch (err) {
      console.error('Error checking confirmation status:', err);
      return false;
    }
  };

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        // Since Supabase redirects here after processing the token,
        // we just need to check if the user's email is confirmed in the database
        const isConfirmed = await checkConfirmationStatus();
        
        if (isConfirmed) {
          setConfirmed(true);
          startCountdown();
        } else {
          throw new Error('Email confirmation was not successful. Please try again or resend the confirmation email.');
        }
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    const startCountdown = () => {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            // Use setTimeout to push the navigation outside of the render cycle
            setTimeout(() => {
              router.push('/');
            }, 0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    };

    handleEmailConfirmation();
  }, [supabase, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="max-w-md w-full px-6 text-center">
          <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-white text-2xl font-bold">H</span>
          </div>
          
          <h1 className="text-green-500 text-4xl font-semibold mb-4">
            Habit Tracker
          </h1>
          
          <div className="w-12 h-12 border-3 border-gray-700 border-t-green-500 rounded-full animate-spin mx-auto mb-6"></div>
          
          <h2 className="text-green-500 text-2xl font-medium mb-4">
            Verifying Your Email
          </h2>
          
          <p className="text-white text-lg">
            Please wait while we confirm your email address...
          </p>
        </div>
      </div>
    );
  }

  if (confirmed) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="max-w-md w-full px-6 text-center">
          <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-white text-2xl font-bold">H</span>
          </div>
          
          <h1 className="text-green-500 text-4xl font-semibold mb-4">
            Habit Tracker
          </h1>
          
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-white text-2xl font-bold">✓</span>
          </div>
          
          <h2 className="text-green-500 text-2xl font-medium mb-4">
            Email Verified Successfully!
          </h2>
          
          <p className="text-white text-lg mb-4">
            Welcome to Habit Tracker! Your account has been confirmed.
          </p>
          
          <p className="text-white text-base mb-6">
            You'll be redirected to your home page in{' '}
            <span className="text-green-500 font-semibold">{countdown}</span> seconds.
          </p>
          
          <button
            onClick={() => router.push('/')}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="max-w-md w-full px-6 text-center">
        <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <span className="text-white text-2xl font-bold">H</span>
        </div>
        
        <h1 className="text-green-500 text-4xl font-semibold mb-4">
          Habit Tracker
        </h1>
        
        <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-white text-2xl font-bold">✗</span>
        </div>
        
        <h2 className="text-green-500 text-2xl font-medium mb-4">
          Verification Failed
        </h2>
        
        <p className="text-white text-lg mb-8">
          {error || 'This confirmation link is invalid or has expired.'}
        </p>
        
        <div className="space-y-4">
          <button
            onClick={() => router.push('/resend-confirmation')}
            className="w-full bg-transparent border-2 border-gray-600 hover:border-green-500 text-white hover:text-green-500 font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Resend Confirmation
          </button>
          
          <button
            onClick={() => router.push('/login')}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}

// Main component that provides the Suspense boundary
export default function ConfirmPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="max-w-md w-full px-6 text-center">
          <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-white text-2xl font-bold">H</span>
          </div>
          <h1 className="text-green-500 text-4xl font-semibold mb-4">
            Habit Tracker
          </h1>
          <div className="w-12 h-12 border-3 border-gray-700 border-t-green-500 rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    }>
      <ConfirmContent />
    </Suspense>
  );
}