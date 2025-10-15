"use client"
import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation'
import { useAuth } from '../context/AuthContext'

export default function HomePage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [checkedHabits, setCheckedHabits] = useState([false, false, false, false, false])
  const [matrixLines, setMatrixLines] = useState<any[]>([])

  useEffect(() => {
    setMounted(true)
    
    // Create animated stars that encourage scrolling
    // Only generate random values on the client side to prevent hydration mismatch
    const stars = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: 0.5 + Math.random() * 2,
      animationDuration: 8 + Math.random() * 12,
      delay: Math.random() * 5,
      opacity: 0.2 + Math.random() * 0.6,
      direction: Math.random() > 0.5 ? 1 : -1,
      verticalSpeed: 0.3 + Math.random() * 0.7
    }))
    setMatrixLines(stars)
  }, [])

  const activeButtonClass = "bg-green-600 text-white rounded px-4 py-2 hover:bg-green-700 transition-colors duration-200"
  const secondaryButtonClass = "border-2 border-green-600 text-green-600 rounded px-4 py-2 hover:bg-green-600 hover:text-white transition-colors duration-200"

  const demoHabits = [
    "Drink 8 glasses of water",
    "Read 1 page", 
    "Walk for 10 minutes",
    "Write 3 gratitudes",
    "Take 5 deep breaths"
  ]

  const toggleHabit = (index: number) => {
    const newChecked = [...checkedHabits]
    newChecked[index] = !newChecked[index]
    setCheckedHabits(newChecked)
  }

  // Show loading or empty state until mounted to prevent hydration issues
  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-black flex justify-center items-center">
        <div className="text-lg text-green-500 font-mono">
          <span className="animate-pulse">Loading...</span>
          <span className="animate-ping">_</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-green-500 relative overflow-hidden font-[family-name:var(--font-geist-sans)]">
      {/* Dynamic floating stars that guide downward - only render when mounted */}
      {mounted && (
        <div className="fixed inset-0 pointer-events-none">
          {matrixLines.map((star) => (
            <div
              key={star.id}
              className="absolute bg-green-500 rounded-full"
              style={{
                left: `${star.left}%`,
                top: `${star.top}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                opacity: star.opacity,
                animation: `floatDown ${star.animationDuration}s linear infinite, pulse ${star.animationDuration * 0.6}s ease-in-out infinite`,
                animationDelay: `${star.delay}s`,
                transform: `translateX(${star.direction * 20}px)`
              }}
            />
          ))}
        </div>
      )}

      {/* Scanlines effect */}
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-b from-transparent via-green-500/5 to-transparent opacity-30" 
           style={{
             backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(34, 197, 94, 0.03) 2px, rgba(34, 197, 94, 0.03) 4px)'
           }} />

      <div className="relative z-10">
        {/* Hero Section */}
        <div className="max-w-6xl mx-auto px-4 py-24">
          <div className="text-center mb-1">
            {/* ASCII Art Logo - Mobile Friendly */}
            <div className="mb-8 text-green-400 leading-tight overflow-x-auto">
              {/* Large screens - full ASCII art */}
              <div className="hidden md:block text-sm">
                <pre className="whitespace-pre inline-block">
{`   ██████╗ ██████╗  █████╗ ██╗███╗   ██╗███████╗
  ██╔════╝ ██╔══██╗██╔══██╗██║████╗  ██║██╔════╝
  ██║  ███╗██████╔╝███████║██║██╔██╗ ██║███████╗
  ██║   ██║██╔══██╗██╔══██║██║██║╚██╗██║╚════██║
  ╚██████╔╝██║  ██║██║  ██║██║██║ ╚████║███████║
   ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝╚══════╝`}
                </pre>
              </div>
              
              {/* Mobile screens - smaller ASCII art that fits */}
              <div className="block md:hidden text-xs">
                <pre className="whitespace-pre inline-block">
{`██████╗ ██████╗  █████╗ ██╗███╗   ██╗███████╗
██╔════╝██╔══██╗██╔══██╗██║████╗  ██║██╔════╝
██║  ███╗██████╔╝███████║██║██╔██╗ ██║███████╗
██║   ██║██╔══██╗██╔══██║██║██║╚██╗██║╚════██║
╚██████╔╝██║  ██║██║  ██║██║██║ ╚████║███████║
 ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝╚══════╝`}
                </pre>
              </div>
            </div>
            
            <div className="mb-15">
              <h1 className="text-3xl md:text-5xl font-bold mb-10 text-green-400">
                of Sand
              </h1>
            </div>
            
            <div className="bg-green-500/10 border border-green-500/30 rounded p-6 max-w-2xl mx-auto mb-8">
              <p className="text-green-100 text-lg leading-relaxed">
                A simple habit tracker designed to help you build trust in yourself to create consistent change.
                Focus on small, sustained habits that become second nature over time.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {user ? (
                <button 
                  className={activeButtonClass}
                  onClick={() => window.location.href = '/habits'}
                >
                  Go to Dashboard
                </button>
              ) : (
                <>
                  <button 
                    className={activeButtonClass}
                    onClick={() => window.location.href = '/sign-up'}
                  >
                    Get Started
                  </button>
                  <button 
                    className={secondaryButtonClass}
                    onClick={() => window.location.href = '/login'}
                  >
                    Login
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Interactive Terminal Demo */}
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-green-400 mb-4">
              See How It Works
            </h2>
            <p className="text-green-200">
              Click to toggle habit completion status
            </p>
          </div>

          <div className="bg-black border-2 border-green-500 rounded-lg overflow-hidden">
            {/* Terminal header */}
            <div className="bg-green-500/20 border-b border-green-500 px-4 py-2">
              <div className="text-green-300 text-sm">
                Today's Habits
              </div>
            </div>
            
            {/* Habit list */}
            <div className="p-4 space-y-2">
              {demoHabits.map((habit, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 border border-green-500/30 rounded hover:bg-green-500/10 transition-all duration-200 cursor-pointer group"
                  onClick={() => toggleHabit(index)}
                >
                  <div className="flex items-center gap-3">
                    <span className={`${checkedHabits[index] ? 'text-green-400 line-through' : 'text-green-200'}`}>
                      {habit}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded ${
                      checkedHabits[index] 
                        ? 'bg-green-500/20 text-green-400 border border-green-500' 
                        : 'bg-gray-500/20 text-gray-400 border border-gray-500'
                    }`}>
                      {checkedHabits[index] ? 'Complete' : 'Pending'}
                    </span>
                    <div className={`w-4 h-4 rounded border-2 transition-all ${
                      checkedHabits[index] 
                        ? 'bg-green-500 border-green-500' 
                        : 'border-green-500 group-hover:border-green-400'
                    }`}>
                      {checkedHabits[index] && (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-black text-xs font-bold">✓</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="mt-4 p-2 bg-green-500/10 border border-green-500/30 rounded">
                <div className="text-green-300 text-sm">
                  Status: {checkedHabits.filter(Boolean).length}/5 habits completed
                </div>
                <div className="w-full bg-black border border-green-500/30 rounded mt-2 h-2">
                  <div 
                    className="h-full bg-green-500 rounded transition-all duration-300"
                    style={{ width: `${(checkedHabits.filter(Boolean).length / 5) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* System Specs / Features */}
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-green-400 mb-4">
              Why Only 5 Habits?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: "🎯",
                title: "Focus Over Quantity",
                description: "Maximum 5 habits prevent overwhelm and decision fatigue"
              },
              {
                icon: "🔄", 
                title: "Daily Reset",
                description: "Habits automatically refresh each day for fresh starts and consistency"
              },
              {
                icon: "🏗️",
                title: "Trust Building",
                description: "Small daily victories build robust self-confidence over time"
              },
              {
                icon: "⚡",
                title: "Micro Habits",
                description: "2-5 minute routines designed for seamless integration into your day"
              }
            ].map((spec, index) => (
              <div 
                key={index}
                className="bg-green-500/5 border border-green-500/30 rounded-lg p-6 hover:bg-green-500/10 transition-all duration-300 hover:border-green-400"
              >
                <div className="text-2xl mb-4 text-center">{spec.icon}</div>
                <div className="text-green-400 font-bold mb-2 text-sm text-center">
                  {spec.title}
                </div>
                <div className="text-green-200 text-xs leading-relaxed text-center">
                  {spec.description}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Testimonials as System Logs */}
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-green-400">
              What People Are Saying
            </h2>
          </div>

          <div className="space-y-4">
            {[
              { user: "Sammi T.", message: "Finally, a habit tracker that doesn't overwhelm me. Just 5 simple habits changed everything." },
              { user: "Matt H.", message: "The daily reset keeps me motivated. No more guilt about yesterday's missed habits." },
              { user: "Gagan N.", message: "I love the philosophy - small grains of sand really do build towers!" }
            ].map((testimonial, index) => (
              <div key={index} className="bg-green-500/5 border border-green-500/30 rounded p-4">
                <div className="text-green-100 text-sm mb-2">
                  "{testimonial.message}"
                </div>
                <div className="text-green-300 text-xs">
                  — {testimonial.user}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="bg-green-500/10 border-2 border-green-500 rounded-lg p-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-green-400 mb-6">
              Ready to Build Your Tower?
            </h2>
            <p className="text-green-200 mb-8 max-w-2xl mx-auto">
              Start with just one small habit today. Let each grain of sand become part of something bigger.
            </p>
            
            {user ? (
              <div>
                <p className="text-green-300 mb-6">
                  Welcome back, {user?.user_metadata?.display_name || user?.email}
                </p>
                <button 
                  className={activeButtonClass + " px-6 py-3"}
                  onClick={() => window.location.href = '/habits'}
                >
                  Continue Building
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  className={activeButtonClass + " px-6 py-3"}
                  onClick={() => window.location.href = '/sign-up'}
                >
                  Get Started
                </button>
                <button 
                  className={secondaryButtonClass + " px-6 py-3"}
                  onClick={() => router.push('/login')}
                >
                  Login
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-green-500/30 bg-black/80 backdrop-blur-sm mt-16">
          <div className="max-w-6xl mx-auto px-4 py-6 text-center">
            <div className="text-green-400 text-sm">
              Think of these small habits as grains of sand — each one seems small but you can build a tower with grains of sand.
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        /* Custom scrollbar styles */
        ::-webkit-scrollbar {
          width: 6px;
        }
        
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(transparent 40%, rgba(34, 197, 94, 0.3) 40%, rgba(34, 197, 94, 0.3) 60%, transparent 60%);
          border-radius: 50px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(transparent 40%, rgba(34, 197, 94, 0.5) 40%, rgba(34, 197, 94, 0.5) 60%, transparent 60%);
          border-radius: 50px;
        }
        
        /* For Firefox */
        * {
          scrollbar-width: thin;
          scrollbar-color: rgba(34, 197, 94, 0.3) transparent;
        }
        
        @keyframes floatDown {
          0% {
            transform: translateY(-20px) translateX(var(--start-x, 0));
          }
          100% {
            transform: translateY(100vh) translateX(var(--end-x, 0));
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 0.3;
            transform: scale(0.8);
          }
          50% {
            opacity: 1;
            transform: scale(1.5);
          }
        }
      `}</style>
    </div>
  )
}