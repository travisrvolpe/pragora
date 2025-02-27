// app/api/posts/[postId]/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const postId = params.postId;
    const token = request.headers.get('Authorization') || '';

    // Use your backend API URL
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    console.log(`API Route: Fetching post ${postId}`);
    console.log(`Using token: ${token ? 'Yes (Bearer token)' : 'No'}`);

    // Forward the request to your backend
    const response = await fetch(`${apiUrl}/posts/${postId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': token
      }
    });

    console.log(`Backend response status: ${response.status}`);

    // If the response is not OK, throw an error
    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch post: ${response.status}` },
        { status: response.status }
      );
    }

    // Parse and return the response
    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error in post API route:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
