import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that should not be treated as usernames
const protectedRoutes = [
  'api',
  'auth',
  'profile',
  'q',
  '_next',
  'favicon.ico',
  'logo.svg',
  'manifest.json'
]

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // Skip middleware for protected routes
  const pathSegments = pathname.split('/').filter(Boolean)
  const firstSegment = pathSegments[0]
  
  if (firstSegment && protectedRoutes.includes(firstSegment)) {
    return NextResponse.next()
  }
  
  // Skip middleware for root path
  if (pathname === '/') {
    return NextResponse.next()
  }
  
  // Skip middleware for API routes and static files
  if (pathname.startsWith('/api/') || 
      pathname.startsWith('/_next/') || 
      pathname.includes('.')) {
    return NextResponse.next()
  }
  
  // For single-segment paths (potential usernames), let them through
  // The [username] page will handle validation
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
