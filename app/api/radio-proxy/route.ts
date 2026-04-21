import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('http://84.8.135.135/public/newsline/embed?autoplay=1', {
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    });
    
    const html = await response.text();
    
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    return new NextResponse('Radio player unavailable', { status: 500 });
  }
}
