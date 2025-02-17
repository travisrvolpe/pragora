import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { commentId: string; action: string } }
) {
  try {
    const { commentId, action } = params;
    let data = {};

    // If it's a report action, get the reason from the request body
    if (action === 'report') {
      data = await request.json();
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/posts/comments/${commentId}/${action}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': request.headers.get('Authorization') || '',
        },
        ...(Object.keys(data).length > 0 && { body: JSON.stringify(data) }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : `Failed to ${params.action} comment` },
      { status: 500 }
    );
  }
}