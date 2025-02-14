// app/dialectica/layout.tsx
import React from 'react';
import Link from 'next/link';
import { StartPostButton } from '@/components/buttons/StartPostButton';

interface DialecticaLayoutProps {
  children: React.ReactNode;
}

export default function DialecticaLayout({ children }: DialecticaLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="h-16 flex items-center justify-between">
            <div className="flex items-center">
              <Link href="/dialectica" className="text-xl font-bold">
                Dialectica
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <StartPostButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Added flex-grow and overflow-y-auto */}
      <main className="flex-grow container mx-auto px-4 py-8 overflow-y-auto">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-gray-500">
            <p>
              Dialectica - A space for meaningful discussions and shared insights.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}