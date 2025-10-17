import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check if this is an old-style article URL like /article/abc123xyz
  const oldArticlePattern = /^\/article\/([^\/]+)$/
  const match = pathname.match(oldArticlePattern)
  
  if (match) {
    const id = match[1]
    
    // Check if it looks like a year (4 digits starting with 20)
    // If so, it's a new-style URL and should pass through
    if (/^20\d{2}$/.test(id)) {
      return NextResponse.next()
    }
    
    // Otherwise, it's a legacy ID - rewrite to the legacy handler
    const url = request.nextUrl.clone()
    url.pathname = `/article-by-id/${id}`
    return NextResponse.rewrite(url)
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: '/article/:path*',
}
