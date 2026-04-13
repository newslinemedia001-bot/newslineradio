import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check if this is an article URL
  const articlePattern = /^\/article\/([^\/]+)$/
  const match = pathname.match(articlePattern)
  
  if (match) {
    const slug = match[1]
    
    // Check if it looks like a slug (contains hyphens and letters)
    // Slugs are like: "optiven-offers-flexible-payment-plans-for-gatanga-land-buyers-1"
    if (slug.includes('-') || /^[a-z0-9-]+$/i.test(slug)) {
      // It's a slug-based URL, let it pass through to [slug]/page.tsx
      return NextResponse.next()
    }
    
    // Check if it looks like a year (4 digits starting with 20)
    if (/^20\d{2}$/.test(slug)) {
      return NextResponse.next()
    }
    
    // Otherwise, it might be a legacy ID - rewrite to the legacy handler if it exists
    const url = request.nextUrl.clone()
    url.pathname = `/article-by-id/${slug}`
    return NextResponse.rewrite(url)
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: '/article/:path*',
}
