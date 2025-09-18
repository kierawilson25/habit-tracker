'use client'
import { useAuth } from '../context/AuthContext'
import Link from 'next/link'
import { useEffect, useState } from "react";

export default function HomePage() {
  const { user, loading } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const activeButtonClass = "bg-green-600 text-white rounded px-4 py-2 hover:bg-green-700 transition-colors duration-200"
  const secondaryButtonClass = "border-2 border-green-600 text-green-600 rounded px-4 py-2 hover:bg-green-600 hover:text-white transition-colors duration-200"

  if (!mounted || loading) {
    return (
      <div className="page-dark min-h-screen flex justify-center items-center">
        <div className="text-lg text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="page-dark min-h-screen">
      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center px-4 pb-20 gap-8 sm:p-20 sm:gap-16 font-[family-name:var(--font-geist-sans)] w-full">
        <main className="flex flex-col gap-8 row-start-2 items-center w-full max-w-4xl">
          <h1 className="w-full flex justify-center text-4xl sm:text-6xl font-bold mb-4 text-green-500">
            Habit Tracker
          </h1>
          
          <div className="w-full flex justify-center px-4">
            <div className="w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl flex flex-col gap-6">
              <div 
                className="w-full px-6 py-6 mb-4 rounded-lg border-2 text-center hover:scale-105 transition-transform duration-200"
                style={{
                  backgroundColor: "rgba(34, 197, 94, 0.2)",
                  borderColor: "rgba(34, 197, 94, 1)",
                }}
              >
                <p className="text-white mb-4 leading-relaxed">
                  A simple tool designed to help you build trust in yourself to create consistent change. 
                  Focus on small, sustained habits that become second nature over time.
                </p>
                
                {user ? (
                  <div>
                    <p className="text-green-300 mb-4 text-sm">
                      Welcome back, {user?.user_metadata.display_name || user.email}!
                    </p>
                    <Link href="/habits">
                      <button className={activeButtonClass}>
                        Go to Dashboard
                      </button>
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link href="/login">
                      <button className={activeButtonClass}>
                        Login
                      </button>
                    </Link>
                    <Link href="/get-started">
                      <button className={secondaryButtonClass}>
                        Get Started
                      </button>
                    </Link>
                  </div>
                )}
              </div>
              
              <p className="text-green-300 text-sm text-center opacity-75">
                Think of habits as grains of sand — each one seems small, but you can build a tower with grains of sand.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}