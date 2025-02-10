import * as React from 'react'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import "@/styles/globals.css"
import { LayoutProvider } from '@/components/layout/LayoutProvider'
import { AuthProvider } from '@/contexts/auth/AuthContext'
import { ProfileProvider } from '@/contexts/profile/ProfileContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Pragora',
  description: 'Transform knowledge into action through evidence-based discussion',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <ProfileProvider>
            <LayoutProvider>
              {children}
            </LayoutProvider>
          </ProfileProvider>
        </AuthProvider>
      </body>
    </html>
  )
}