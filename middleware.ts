import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    // Allow the request to proceed
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow API routes to pass through (they handle auth internally)
        if (req.nextUrl.pathname.startsWith('/api/')) {
          return true;
        }
        // Check if user has a valid token
        // Allow access if token exists (user is authenticated)
        // On refresh, token might be loading, so we're more lenient
        if (token) {
          return true;
        }
        // If no token, redirect to login
        // But only if we're not already on a public page
        const publicPaths = ['/login', '/otp-login', '/forgot-password', '/'];
        if (publicPaths.includes(req.nextUrl.pathname)) {
          return true;
        }
        return false;
      },
    },
    pages: {
      signIn: '/login',
    },
  }
);

// Configure which routes to protect
export const config = {
  matcher: [
    /*
     * Protect all routes except:
     * - api/* (all API routes - they handle auth internally)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login pages
     * - root page (/) - public landing page
     * - public files (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|login|otp-login|forgot-password|^/?$|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
