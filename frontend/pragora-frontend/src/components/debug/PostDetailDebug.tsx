// components/debug/PostDetailDebug.tsx
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

export function PostDetailDebug({ postId }: { postId: number }) {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [authStatus, setAuthStatus] = useState<any>(null);

  // Display token info on mount
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    console.log('Current auth token:', token ?
      `${token.substring(0, 10)}...${token.substring(token.length - 5)}` :
      'No token'
    );
  }, []);

  const testAuthStatus = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      console.log('Current token:', token ? `${token.substring(0, 15)}...` : 'No token');

      // Test auth status
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/auth/user`, {
        method: 'GET',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Accept': 'application/json'
        },
        credentials: 'include'
      });

      const statusInfo = {
        status: response.status,
        ok: response.ok
      };

      console.log('Auth status response:', statusInfo);

      if (response.ok) {
        const userData = await response.json();
        console.log('User data:', userData);
        setAuthStatus({ ...statusInfo, userData });
      } else {
        setAuthStatus(statusInfo);
      }
    } catch (error) {
      console.error('Auth test error:', error);
      setAuthStatus({ error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  const testEndpoint = async (endpoint: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token') || '';
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

      // Make the API call
      console.log(`Making POST request to ${endpoint} with token: ${token.substring(0, 10)}...`);
      const response = await fetch(`${apiUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include'
      });

      // Check response
      console.log(`Engagement response status: ${response.status}`);
      const data = await response.json();
      setResult(data);
      console.log(`Response from ${endpoint}:`, data);

      // Refresh the post data with explicit credential handling
      console.log(`Fetching updated post data for post ${postId}`);
      const postResponse = await fetch(`${apiUrl}/posts/${postId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        },
        credentials: 'include'
      });

      console.log(`Post fetch response status: ${postResponse.status}`);

      if (postResponse.ok) {
        const post = await postResponse.json();
        console.log('Updated post data:', post);
      } else {
        console.error(`Failed to fetch post: ${postResponse.status}`);
      }

    } catch (error) {
      console.error('API test error:', error);
      setResult({ error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg mt-4">
      <h3 className="font-bold mb-2">Post Debug Tools</h3>

      <div className="flex gap-2 mb-4">
        <Button
          onClick={testAuthStatus}
          disabled={loading}
          size="sm"
          variant="ghost"
        >
          Test Auth Status
        </Button>
      </div>

      <div className="flex gap-2 mb-4">
        <Button
          onClick={() => testEndpoint(`/posts/engagement/${postId}/like`)}
          disabled={loading}
          size="sm"
          variant="outline"
        >
          Test Like
        </Button>

        <Button
          onClick={() => testEndpoint(`/posts/engagement/${postId}/dislike`)}
          disabled={loading}
          size="sm"
          variant="outline"
        >
          Test Dislike
        </Button>

        <Button
          onClick={() => testEndpoint(`/posts/engagement/${postId}/save`)}
          disabled={loading}
          size="sm"
          variant="outline"
        >
          Test Save
        </Button>
      </div>

      {authStatus && (
        <div className="mt-4">
          <h4 className="font-semibold mb-1">Auth Status:</h4>
          <pre className="bg-gray-800 text-white p-2 rounded-md text-xs overflow-auto">
            {JSON.stringify(authStatus, null, 2)}
          </pre>
        </div>
      )}

      {result && (
        <div className="mt-4">
          <h4 className="font-semibold mb-1">API Response:</h4>
          <pre className="bg-gray-800 text-white p-2 rounded-md text-xs overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}