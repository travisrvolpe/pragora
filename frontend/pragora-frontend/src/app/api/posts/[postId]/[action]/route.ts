// app/api/posts/engagement/[postId]/[action]/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { postId: string; action: string } }
) {
  try {
    const { postId, action } = params;
    const token = request.headers.get('Authorization') || '';

    // Validate action type
    const validActions = ['like', 'dislike', 'save', 'share', 'report'];
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { error: `Invalid action: ${action}` },
        { status: 400 }
      );
    }

    // Use your backend API URL
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    console.log(`API Route: Processing ${action} for post ${postId}`);
    console.log(`Using token: ${token ? 'Yes (Bearer token)' : 'No'}`);

    // Get request body if any
    let body = null;
    if (request.body) {
      const text = await request.text();
      if (text) {
        try {
          body = JSON.parse(text);
        } catch (e) {
          // Ignore JSON parse errors for empty bodies
        }
      }
    }

    // Forward the request to your backend
    const response = await fetch(`${apiUrl}/posts/engagement/${postId}/${action}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: body ? JSON.stringify(body) : undefined
    });

    console.log(`Backend response status: ${response.status}`);

    // If the response is not OK, throw an error
    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to process ${action}: ${response.status}` },
        { status: response.status }
      );
    }

    // Parse and return the response
    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error in engagement API route:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}