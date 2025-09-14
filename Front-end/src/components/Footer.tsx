'use client'
import Link from 'next/link'
import { useAuth } from '../context/AuthContext' // Adjust path as needed

export default function Footer() {
  const { user } = useAuth()

  return (
    <footer className="flex gap-6 flex-wrap items-center justify-center px-4 py-6">
      <Link
        href="/about"
        className="flex items-center gap-2 hover:underline hover:underline-offset-4 text-white"
      >
        About
      </Link>
      <Link
        href="/contact"
        className="flex items-center gap-2 hover:underline hover:underline-offset-4 text-white"
      >
        Contact
      </Link>
      {user && (
        <Link
          href="/report-bug"
          className="flex items-center gap-2 hover:underline hover:underline-offset-4 text-white"
        >
          Report a Bug
        </Link>
      )}
    </footer>
  )
}