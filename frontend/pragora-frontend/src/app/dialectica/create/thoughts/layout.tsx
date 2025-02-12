// app/dialectica/create/thoughts/layout.tsx
import React from 'react';

export default function ThoughtsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="py-8">
        {children}
      </main>
    </div>
  );
}
