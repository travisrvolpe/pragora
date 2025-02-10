'use client'

import * as React from 'react'
import { useAuth } from '@/contexts/auth/AuthContext'
import { UserPlus, LogIn } from 'lucide-react'
import Link from 'next/link'

export default function AuthButtons() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex justify-center gap-4 mb-8">
        <div className="animate-pulse h-12 w-64 bg-gray-200 rounded-md mx-auto" />
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="flex justify-center gap-4 mb-8">
      <Link
        href="/auth/register"
        className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        <UserPlus size={20} className="mr-2" />
        Register Now
      </Link>
      <Link
        href="/auth/login"
        className="flex items-center px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
      >
        <LogIn size={20} className="mr-2" />
        Login
      </Link>
    </div>
  )
}