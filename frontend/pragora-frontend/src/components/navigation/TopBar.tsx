// src/components/navigation/TopBar.tsx
'use client'

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth/AuthContext'
import { FaUser, FaInbox, FaSignInAlt, FaUserPlus } from 'react-icons/fa'

export function TopBar() {
  const router = useRouter()
  const { user, logoutUser, isAuthenticated } = useAuth()

  const handleLogout = async () => {
    try {
      await logoutUser()
      router.push('/auth/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <div className="fixed top-0 left-0 right-0 h-[60px] bg-white border-b border-gray-200 z-50">
      <div className="h-full px-4 flex items-center">
        {/* Left Section - Logo and Brand */}
        <div className="flex-shrink-0">
          <Link href="/" className="flex items-center space-x-2">
            <div className="relative w-8 h-8">
              <Image
                src="/images/ZERO_CROP.PNG"
                alt="Pragora Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className="text-xl font-semibold text-gray-900">Pragora</span>
          </Link>
        </div>

        {/* Center Section - Navigation */}
        <div className="flex items-center justify-center flex-grow space-x-8">
          <Link href="/dialectica" className="text-gray-600 hover:text-primary font-medium">
            Dialectica
          </Link>
          <Link href="/tap" className="text-gray-600 hover:text-primary font-medium">
            TAP
          </Link>
          <Link href="/pan" className="text-gray-600 hover:text-primary font-medium">
            PAN
          </Link>
          <Link href="/about" className="text-gray-600 hover:text-primary font-medium">
            About
          </Link>
          <Link href="/settings" className="text-gray-600 hover:text-primary font-medium">
            Settings
          </Link>
        </div>

        {/* Right Section - Auth */}
        <div className="flex-shrink-0 flex items-center space-x-4">
          {isAuthenticated && user ? (
            <>
              <Link
                href="/inbox"
                className="flex items-center space-x-1 text-gray-600 hover:text-primary"
              >
                <FaInbox className="w-4 h-4" />
                <span>Inbox</span>
              </Link>
              <Link
                href="/profile"
                className="flex items-center space-x-1 text-gray-600 hover:text-primary"
              >
                <FaUser className="w-4 h-4" />
                <span>{user.username || 'Profile'}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="text-red-500 hover:text-red-600 font-medium"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                <FaSignInAlt className="w-4 h-4 mr-1" />
                Login
              </Link>
              <Link
                href="/auth/register"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                <FaUserPlus className="w-4 h-4 mr-1" />
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}