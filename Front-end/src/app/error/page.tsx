'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import { H1, Button, Loading } from "@/components";


function ErrorPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [returnPath, setReturnPath] = useState('/login')
  const [returnLabel, setReturnLabel] = useState('Return to Login')

  useEffect(() => {
    // Check if there's a 'from' parameter in the URL
    const from = searchParams.get('from')
    
    if (from === 'signup') {
      setReturnPath('/signup')
      setReturnLabel('Return to Sign Up')
    } else if (from === 'login') {
      setReturnPath('/login')
      setReturnLabel('Return to Login')
    } else {
      // Default fallback - you can also check document.referrer
      const referrer = typeof window !== 'undefined' ? document.referrer : ''
      if (referrer.includes('/signup')) {
        setReturnPath('/signup')
        setReturnLabel('Return to Sign Up')
      } else {
        setReturnPath('/login')
        setReturnLabel('Return to Login')
      }
    }
  }, [searchParams])

  const handleRetry = () => {
    router.push(returnPath)
  }

  const handleHome = () => {
    router.push('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {/* Error Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-900 bg-opacity-20 border-2 border-red-500 mb-6">
            <svg
              className="h-8 w-8 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
          </div>
          
          {/* Error Message */}
          <H1 text="Uh Oh" />
          <p className="mt-4 text-lg text-white">
            Something went wrong while processing your request. Please try again.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-12 space-y-4">
          <Button
            onClick={handleRetry}
            type="primary"
            fullWidth
          >
            {returnLabel}
          </Button>

          <Button
            onClick={handleHome}
            type="primary"
            variant="outline"
            fullWidth
          >
            Go to Home
          </Button>
        </div>

        {/* Additional Help */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-400">
            If the problem persists, please{' '}
            <Link href="/contact" className="text-green-500 hover:text-green-400 underline">
              contact support
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function ErrorPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ErrorPageContent />
    </Suspense>
  )
}