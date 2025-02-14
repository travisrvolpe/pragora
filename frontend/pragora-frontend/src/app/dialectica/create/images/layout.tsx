import React from 'react';

export default function ImagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Optional: Add confirmation dialog for unsaved changes */}
      <main className="py-8">
        {children}
      </main>

      {/* Optional: Add a floating save indicator */}
      <div className="fixed bottom-4 right-4 pointer-events-none">
        <div id="save-status" className="opacity-0 transition-opacity duration-300" />
      </div>
    </div>
  );
}