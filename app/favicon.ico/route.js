import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export const dynamic = 'force-static';

export async function GET() {
  // Serve the logo from public/images/logo.jpeg directly — fastest, no API call needed
  try {
    const filePath = join(process.cwd(), 'public', 'images', 'logo.jpeg');
    const buffer = readFileSync(filePath);
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      },
    });
  } catch {
    // Fallback: blue SVG with "E"
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
      <rect width="64" height="64" rx="12" fill="#2563eb"/>
      <text x="32" y="44" font-family="Arial,sans-serif" font-size="36" font-weight="bold" text-anchor="middle" fill="white">E</text>
    </svg>`;
    return new NextResponse(svg, {
      headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=86400' },
    });
  }
}
