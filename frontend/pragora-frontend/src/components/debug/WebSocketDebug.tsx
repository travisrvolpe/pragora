// components/debug/WebSocketDebug.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';

interface WebSocketMessage {
  type: string;
  data?: any;
  timestamp: string;
}

export function WebSocketDebug({ postId }: { postId: number }) {
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  const [status, setStatus] = useState<string>('Disconnected');
  const wsRef = useRef<WebSocket | null>(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const connectWebSocket = () => {
    try {
      // Close existing connection if any
      if (wsRef.current) {
        wsRef.current.close();
      }

      setStatus('Connecting...');
      const wsUrl = `ws://localhost:8000/ws/post/${postId}`;
      console.log(`Connecting to WebSocket at ${wsUrl}`);

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connection opened');
        setConnected(true);
        setStatus('Connected');

        // Send a ping to test the connection
        ws.send(JSON.stringify({ type: 'ping', timestamp: new Date().toISOString() }));
      };

      ws.onmessage = (event) => {
        console.log('WebSocket message received:', event.data);
        try {
          const data = JSON.parse(event.data);
          setMessages(prev => [...prev, {
            type: data.type || 'unknown',
            data: data,
            timestamp: new Date().toISOString()
          }]);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
          setMessages(prev => [...prev, {
            type: 'error',
            data: { error: 'Failed to parse message', raw: event.data },
            timestamp: new Date().toISOString()
          }]);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setStatus(`Error: Connection failed`);
        setMessages(prev => [...prev, {
          type: 'connection-error',
          data: { error: 'Connection error' },
          timestamp: new Date().toISOString()
        }]);
      };

      ws.onclose = (event) => {
        console.log('WebSocket closed:', event);
        setConnected(false);
        setStatus(`Disconnected (Code: ${event.code})`);
        setMessages(prev => [...prev, {
          type: 'connection-closed',
          data: { code: event.code, reason: event.reason },
          timestamp: new Date().toISOString()
        }]);
      };
    } catch (error) {
      console.error('Error creating WebSocket:', error);
      setStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const disconnectWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.close();
      setStatus('Manually disconnected');
    }
  };

  const sendTestMessage = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const message = {
        type: 'ping',
        data: { test: true },
        timestamp: new Date().toISOString()
      };
      wsRef.current.send(JSON.stringify(message));
      console.log('Sent test message:', message);
    } else {
      setStatus('Cannot send: WebSocket not connected');
    }
  };

  return (
    <div className="mt-4 bg-gray-100 p-4 rounded-lg">
      <h3 className="text-sm font-medium text-gray-700 mb-2">WebSocket Debug</h3>

      <div className="mb-4">
        <div className={`text-sm ${connected ? 'text-green-600' : 'text-red-600'}`}>
          Status: {status}
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <Button
          onClick={connectWebSocket}
          disabled={connected}
          variant="outline"
          size="sm"
        >
          Connect
        </Button>
        <Button
          onClick={disconnectWebSocket}
          disabled={!connected}
          variant="outline"
          size="sm"
        >
          Disconnect
        </Button>
        <Button
          onClick={sendTestMessage}
          disabled={!connected}
          variant="outline"
          size="sm"
        >
          Send Test Message
        </Button>
      </div>

      <div className="mt-4">
        <h4 className="text-sm font-medium mb-2">Messages</h4>
        <div className="bg-black text-white p-2 rounded h-40 overflow-y-auto text-xs">
          {messages.length === 0 ? (
            <div className="text-gray-400 italic">No messages yet</div>
          ) : (
            messages.map((msg, idx) => (
              <div key={idx} className="mb-1">
                <span className="text-gray-400">[{new Date(msg.timestamp).toLocaleTimeString()}]</span>{' '}
                <span className="text-green-400">{msg.type}:</span>{' '}
                <span>{JSON.stringify(msg.data)}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}