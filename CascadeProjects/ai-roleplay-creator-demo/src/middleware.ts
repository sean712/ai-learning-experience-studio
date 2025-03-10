import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This middleware will run for all routes
export function middleware(request: NextRequest) {
  // Skip middleware for API routes that handle file uploads
  if (request.nextUrl.pathname.startsWith('/api/upload-file') || 
      request.nextUrl.pathname.startsWith('/api/create-assistant')) {
    // For file upload routes, we don't want to apply any middleware
    // that might interfere with the file upload process
    return NextResponse.next();
  }

  // Continue with normal request handling for all other routes
  return NextResponse.next();
}

// Configure the middleware to run for all routes except static files
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
