/**
 * Clerk Middleware - Route Protection
 * 
 * This middleware protects routes that require authentication.
 * Public routes are accessible without authentication.
 * 
 * Protected routes:
 * - /dashboard - User dashboard
 * - /reports/* - Analysis reports
 * - /api/* (except webhooks) - API routes
 */

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define public routes (accessible without authentication)
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)', // Webhooks should be public
  '/api/test-supabase', // Test endpoint (remove in production)
]);

export default clerkMiddleware(async (auth, request) => {
  // If the route is not public, require authentication
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};

