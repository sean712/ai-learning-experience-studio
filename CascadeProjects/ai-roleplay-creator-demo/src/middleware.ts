import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This middleware will run for all routes
export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  
  // Skip middleware for API routes that handle file uploads
  if (request.nextUrl.pathname.startsWith('/api/upload-file') || 
      request.nextUrl.pathname.startsWith('/api/create-assistant')) {
    // For file upload routes, we don't want to apply any middleware
    // that might interfere with the file upload process
    return NextResponse.next();
  }
  
  // Handle trailing slashes for better compatibility with Replit
  // This ensures consistent routing regardless of how the URL is entered
  if (
    !request.nextUrl.pathname.startsWith('/_next') &&
    !request.nextUrl.pathname.startsWith('/api') &&
    !request.nextUrl.pathname.includes('.') &&
    !request.nextUrl.pathname.endsWith('/')
  ) {
    url.pathname = `${request.nextUrl.pathname}/`;
    return NextResponse.redirect(url);
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
     * - public assets (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
