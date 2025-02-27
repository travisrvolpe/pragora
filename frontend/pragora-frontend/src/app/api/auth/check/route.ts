// app/api/auth/check/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization') || '';

    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    // Use your backend API URL
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    console.log(`API Route: Checking auth token`);

    // Forward the request to your backend auth endpoint
    const response = await fetch(`${apiUrl}/auth/user`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': token
      }
    });

    console.log(`Auth check response status: ${response.status}`);

    // If the response is not OK, return the error
    if (!response.ok) {
      return NextResponse.json(
        { error: `Invalid token: ${response.status}` },
        { status: response.status }
      );
    }

    // Parse and return the user data
    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error in auth check API route:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}