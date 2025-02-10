'use client'

import React from 'react'
import {NavBar} from '@/components/navigation/NavBar'
import {TopBar} from '@/components/navigation/TopBar'
import {Footer} from '@/components/navigation/Footer'

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <header>
        <TopBar />
        <NavBar />
      </header>

      <main className="flex-grow bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </div>
      </main>

      <Footer />
    </div>
  )
}