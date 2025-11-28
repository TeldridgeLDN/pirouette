/**
 * Clerk Middleware - Route Protection
 * 
 * This middleware protects routes that require authentication.
 * Public routes are accessible without authentication.
 * 
 * Protected routes:
 * - /dashboard - User dashboard (requires authentication)
 * 
 * Public routes (for anonymous analysis flow):
 * - / - Landing page
 * - /analyze/* - Analysis progress page
 * - /report/* - Report page (anonymous access allowed)
 * - /api/analyze - Submit analysis (supports anonymous)
 * - /api/jobs/* - Job status (supports anonymous)
 * - /api/webhooks/* - Webhook endpoints
 */

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define public routes (accessible without authentication)
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/analyze(.*)',           // Analysis progress page (anonymous)
  '/report(.*)',            // Report page (anonymous access allowed)
  '/api/analyze',           // Submit analysis (anonymous supported)
  '/api/jobs(.*)',          // Job status (anonymous supported)
  '/api/reports(.*)',       // Reports API (anonymous supported)
  '/api/claim-report',      // Claim report (requires auth, but check happens in handler)
  '/api/webhooks(.*)',      // Webhooks should be public (Clerk + Stripe)
  '/api/test-supabase',     // Test endpoint (remove in production)
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



