import { NextRequest, NextResponse } from 'next/server';

/**
 * Badge API Route
 * 
 * Generates an SVG badge showing the Pirouette score.
 * Used for embedding on external websites.
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const score = parseInt(searchParams.get('score') || '0', 10);
  
  // Validate score
  const validScore = Math.max(0, Math.min(100, score));
  
  // Determine the icon based on score
  const icon = validScore >= 80 ? '★' : validScore >= 60 ? '◆' : '●';
  
  // Generate SVG badge
  const svg = `<svg width="180" height="48" viewBox="0 0 180 48" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6366f1" />
      <stop offset="100%" stop-color="#8b5cf6" />
    </linearGradient>
  </defs>
  <rect width="180" height="48" rx="8" fill="url(#bgGradient)" />
  <text x="12" y="20" fill="white" font-size="10" font-weight="500" font-family="system-ui, sans-serif">Pirouette Score</text>
  <text x="12" y="38" fill="white" font-size="18" font-weight="700" font-family="system-ui, sans-serif">${validScore}/100</text>
  <circle cx="150" cy="24" r="16" fill="rgba(255,255,255,0.2)" />
  <text x="150" y="29" fill="white" font-size="14" font-weight="700" font-family="system-ui, sans-serif" text-anchor="middle">${icon}</text>
</svg>`;

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400', // Cache for 1 day
    },
  });
}

