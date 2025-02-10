// src/components/navigation/Footer.tsx
'use client'

import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="mb-2">&copy; 2025 Pragora. All rights reserved.</p>
          <p>
            <Link href="/about" className="text-primary hover:text-primary-dark mr-4">
              About
            </Link>
            <Link href="/contact" className="text-primary hover:text-primary-dark">
              Contact
            </Link>
          </p>
        </div>
      </div>
    </footer>
  )
}