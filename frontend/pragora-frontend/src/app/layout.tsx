// app/layout.tsx
import * as React from 'react'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import "@/styles/globals.css"
import { Providers } from './providers'

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
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}