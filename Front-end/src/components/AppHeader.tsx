'use client'
import Link from 'next/link'
import { useAuth } from '../context/AuthContext'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

// Type definitions
interface NavItem {
  href: string
  label: string
  authRequired?: boolean
}

export default function AppHeader() {
  const { user, signOut, loading } = useAuth()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Define your navigation structure
  const navItems: NavItem[] = [
    { href: '/', label: 'Home' },
    { href: '/habits', label: 'My Habits', authRequired: true },
    { href: '/add-habit', label: 'Add Habit', authRequired: true },
    { href: '/about', label: 'About' },
  ]

  // Filter nav items based on auth status
  const visibleNavItems = navItems.filter(item => 
    !item.authRequired || (item.authRequired && user)
  )

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Sign out failed:', error)
    }
  }

  return (
    <header className="bg-black border-b border-black-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center h-20">
          
          {/* Logo/Brand Section */}
          <div className="flex items-center flex-1">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">G</span>
              </div>
              <span className="text-white text-2xl sm:text-3xl font-semibold hidden sm:block">
                Grains of Sand
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center justify-center flex-1">
            <div className="flex items-center space-x-8">
              {visibleNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-lg font-medium transition-colors ${
                    pathname === item.href
                      ? 'text-green-400 border-b-2 border-green-400 pb-1'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>

          {/* User Section */}
          <div className="flex items-center justify-end space-x-4 flex-1">
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-gray-300 text-base hidden sm:block">
                  {user.email}
                </span>
                <button
                  onClick={handleSignOut}
                  disabled={loading}
                  className="bg-red-600 text-white px-4 py-2 rounded text-base hover:bg-red-700 disabled:opacity-50 transition-colors duration-200"
                >
                  {loading ? 'Signing out...' : 'Sign Out'}
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/login"
                  className="text-gray-300 hover:text-white text-base"
                >
                  Login
                </Link>
                <Link
                  href="/sign-up"
                  className="bg-green-600 text-white px-4 py-2 rounded text-base hover:bg-green-700 transition-colors duration-200"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-gray-300 hover:text-white"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-black-700 py-3">
            {visibleNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-4 py-3 text-base ${
                  pathname === item.href
                    ? 'text-green-400 bg-black-800'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  )
}