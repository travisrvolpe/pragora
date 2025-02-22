// components/debug/DebugPanel.tsx
import React, { useState, useCallback } from 'react';
import { Settings, Bug, Shield, UserCircle } from 'lucide-react';
import AuthDebug from './AuthDebug';
import ProfileDebug from './ProfileDebug';
import { TOKEN_KEY } from '@/lib/constants/constants';

type DebugTab = 'auth' | 'profile' | 'errors';

interface ErrorLog {
  timestamp: string;
  error: string;
  type: string;
}

const DebugPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<DebugTab>('auth');
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);

  const handleTestError = useCallback(() => {
    try {
      throw new Error('Test authentication error');
    } catch (error) {
      setErrorLogs(prev => [...prev, {
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        type: 'auth'
      }]);
    }
  }, []);

  const handleClearToken = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setErrorLogs(prev => [...prev, {
      timestamp: new Date().toISOString(),
      error: 'Token manually cleared',
      type: 'auth'
    }]);
  }, []);

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
                className={`px-3 py-1 rounded flex items-center gap-1 ${
                  activeTab === 'auth' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <Shield className="w-4 h-4" />
                Auth
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-3 py-1 rounded flex items-center gap-1 ${
                  activeTab === 'profile' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <UserCircle className="w-4 h-4" />
                Profile
              </button>
              <button
                onClick={() => setActiveTab('errors')}
                className={`px-3 py-1 rounded flex items-center gap-1 ${
                  activeTab === 'errors' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <Bug className="w-4 h-4" />
                Errors
              </button>
            </div>

            {/* Debug Actions */}
            <div className="mb-4 flex gap-2">
              <button
                onClick={handleTestError}
                className="px-2 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
              >
                Test Error
              </button>
              <button
                onClick={handleClearToken}
                className="px-2 py-1 text-sm bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
              >
                Clear Token
              </button>
            </div>

            {/* Content */}
            <div className="bg-gray-50 rounded p-3">
              {activeTab === 'auth' && <AuthDebug />}
              {activeTab === 'profile' && <ProfileDebug />}
              {activeTab === 'errors' && (
                <div className="space-y-2">
                  {errorLogs.map((log, index) => (
                    <div key={index} className="text-sm bg-white p-2 rounded border border-gray-200">
                      <div className="text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</div>
                      <div className="font-mono text-red-600">{log.error}</div>
                      <div className="text-gray-400">{log.type}</div>
                    </div>
                  ))}
                  {errorLogs.length === 0 && (
                    <div className="text-gray-500 text-center py-4">
                      No errors logged
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DebugPanel;