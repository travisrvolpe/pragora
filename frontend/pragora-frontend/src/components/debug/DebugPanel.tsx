import React, { useState } from 'react';
import { Settings, Bug } from 'lucide-react';
import AuthDebug from './AuthDebug';
import ProfileDebug from './ProfileDebug';

const DebugPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('auth');

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded-full shadow-lg"
      >
        <Bug className="w-5 h-5" />
      </button>

      {/* Debug Panel */}
      {isOpen && (
        <div className="absolute bottom-12 right-0 w-96 bg-white rounded-lg shadow-xl border border-gray-200">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Debug Panel
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setActiveTab('auth')}
                className={`px-3 py-1 rounded ${
                  activeTab === 'auth' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                Auth
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-3 py-1 rounded ${
                  activeTab === 'profile' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                Profile
              </button>
            </div>

            {/* Content */}
            <div className="bg-gray-50 rounded p-3">
              {activeTab === 'auth' && <AuthDebug />}
              {activeTab === 'profile' && <ProfileDebug />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DebugPanel;