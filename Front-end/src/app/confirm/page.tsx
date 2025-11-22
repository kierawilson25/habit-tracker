'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { H1 }  from "@/components";

export default function ConfirmPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(7);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Cleanup timer on component unmount
    return () => clearInterval(timer);
  }, []);

  // Separate useEffect to handle navigation when countdown reaches 0
  useEffect(() => {
    if (countdown === 0) {
      router.push('/');
    }
  }, [countdown, router]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="max-w-md w-full px-6 text-center">
        <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <span className="text-white text-2xl font-bold">H</span>
        </div>
         

        <H1 text="Habit Tracker"/>
        
        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-white text-2xl font-bold">✓</span>
        </div>
        
        <h2 className="text-green-500 text-2xl font-medium mb-4">
          Email Verified Successfully!
        </h2>
        
        <p className="text-white text-lg mb-4">
          Welcome to Grains of Sand! Your account has been confirmed.
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