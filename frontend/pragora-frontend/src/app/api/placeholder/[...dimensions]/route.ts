// app/api/placeholder/[...dimensions]/route.ts
import { NextResponse } from 'next/server';
import { Buffer } from 'buffer';

export async function GET(
  request: Request,
  { params }: { params: { dimensions: string[] } }
) {
  const [width, height] = params.dimensions;

  // Create an SVG placeholder with user icon
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
      <rect width="100%" height="100%" fill="#f1f5f9"/>
      <circle cx="50%" cy="40%" r="20%" fill="#94a3b8"/>
      <circle cx="50%" cy="85%" r="35%" fill="#94a3b8"/>
    </svg>
  `;

  // Convert SVG to Buffer
  const svgBuffer = Buffer.from(svg);

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}