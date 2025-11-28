# Changelog

All notable changes to Pirouette will be documented in this file.

## [Unreleased]

### Added
- **Subscription Management & Billing Portal** (Task 41)
  - `/dashboard/billing` page for subscription management
  - Subscription info card with plan, status badge, and billing details
  - Payment method display (card brand and last 4 digits)
  - Next billing date and billing interval display
  - "Manage Billing" button linking to Stripe Customer Portal
  - Trial banner with days remaining countdown
  - Cancellation warning banner with reactivate option
  - Payment failed warning with update payment CTA
  - Pro features checklist (locked for free users)
  - `/api/user/subscription` endpoint fetching Stripe subscription details
  - Support contact section
  - Billing link in dashboard Account Information section

- **Dashboard URL Submission & Quota Display** (Task 35)
  - Complete dashboard redesign with URL submission form at top
  - `QuotaDisplay` component showing remaining weekly analyses
  - Visual progress bar for free tier quota tracking
  - "Weekly limit reached" state with prominent upgrade CTA
  - Quota reset countdown (next Sunday midnight UTC)
  - "Unlimited" badge display for Pro users
  - Recent analyses list with thumbnails, scores, and timestamps
  - Collapsible Account Information section
  - Integration with `DashboardAnalyzeForm` for authenticated submissions
  - Real-time quota fetching from Supabase (weekly analysis count)

- **Enhanced Recommendation Display** (Task 26.4)
  - Revenue impact estimates with calculation formula breakdown
  - Confidence level indicators (High ●●●, Medium ●●○, Low ●○○)
  - Success metrics section (Expected Improvement, Minimum Traffic, Measurement Period)
  - ROI analysis breakdown (Impact, Effort, Time to results, ROI Score)
  - Percentage-based fallback when no traffic data is available
  - Disclaimer for revenue estimate transparency

- **ROI-Based Filtering** (Task 27.4)
  - Filter buttons for Quick Wins ⚡, Strategic 📈, and Long-term 🎯 categories
  - Category descriptions when filtering active
  - Sorted recommendations by ROI score (highest first)
  - Accessible button group with aria-pressed states
  - Color-coded active states for each filter category

- **Revenue Impact & ROI Documentation** (Tasks 26.6 & 27.5)
  - Comprehensive user guide (`docs/revenue-impact-and-roi.md`)
  - API reference with TypeScript interfaces
  - Calculation formulas with worked examples
  - Confidence level explanations
  - Limitations and caveats section
  - Internal developer guide (`src/lib/analysis/utils/REVENUE_ROI_DEV_GUIDE.md`)

- **Dedicated Pricing Page** (Task 38)
  - Full `/pricing` route with SEO-optimised content
  - Three-tier pricing cards (Free, Pro £29, Agency £99)
  - Monthly/Annual billing toggle with 17% discount
  - Comprehensive feature comparison table
  - FAQ section with 8 common questions
  - Trust indicators (Secure Payments, Cancel Anytime, 7-Day Trial)
  - Dynamic plan detection for logged-in users
  - Stripe checkout integration with billing cycle support

- **Traffic-Based Conditional Recommendations** (Task 28)
  - Traffic tier classification utility (`src/lib/analysis/utils/traffic-classifier.ts`)
  - TrafficContext component with expandable tier-specific guidance
  - Traffic-aware recommendation sorting (ease-first for very low traffic)
  - Optional weekly traffic input on both HeroAnalyzeForm and DashboardAnalyzeForm
  - "Your Traffic Context" section in reports with validation timelines
  - Four traffic tiers: Very Low (<100/wk), Low (100-1K/wk), Medium (1K-10K/wk), High (>10K/wk)
  - A/B testing viability indicator based on traffic level
  - Database migration for `weekly_traffic` column (jobs + reports tables)

- **Success Metrics & Validation Timeline** (Task 30)
  - Enhanced SuccessMetrics interface with `measurementTips`, `target`, `confidence`, and `milestones`
  - ValidationTimeline component with visual milestone tracking
  - Dimension-specific measurement tips (CTA, contrast, whitespace, typography, layout, complexity, hierarchy)
  - Target metric generation based on dimension type
  - Validation milestones: Implement, Baseline, Collect Data, Compare Results, Decision Point
  - Compact and full timeline views for different contexts
  - Confidence indicators with visual dots (●●●, ●●○, ●○○)

- **Report Quality Validation System** (Task 29)
  - Quality validation utility (`src/lib/analysis/utils/quality-validator.ts`)
    - 10 quality checks: recommendations count, specific values, effort estimates, pattern references, screenshot, dimension scores, score range, overall accuracy, diversity, actionable descriptions
    - Weighted scoring system with 80% production threshold
    - Quality levels: excellent (95+), good (85+), fair (80+), poor (<80)
  - QualityBanner component (`src/components/QualityBanner.tsx`)
    - Visual quality score display with progress ring
    - Expandable details showing check results
    - Priority improvements list
    - Development mode warning for below-threshold reports
  - API integration
    - Report API returns quality validation data (`?includeQuality=true`)
    - Quality metadata attached to report responses

- **Error Handling & Monitoring** (Task 19)
  - Custom error pages:
    - `not-found.tsx` - 404 page with branded design
    - `error.tsx` - Runtime error boundary with retry button
    - `global-error.tsx` - Root-level error catch with dark theme
    - `loading.tsx` - Global loading state with spinner
  - Error handling utilities (`src/lib/errors.ts`):
    - Custom error classes (ValidationError, AuthenticationError, etc.)
    - API response helpers (successResponse, errorResponse)
    - Error logging with structured context
    - Client-side error parsing utilities
    - withErrorHandling wrapper for route handlers

- **Legal Pages** (Task 20)
  - Terms of Service (`/terms`) - UK law compliant
    - Acceptable use policy
    - Subscription and payment terms
    - Intellectual property rights
    - Disclaimer of warranties
    - Limitation of liability
    - English law jurisdiction
  - Privacy Policy (`/privacy`) - UK GDPR compliant
    - Data collection disclosure
    - Legal basis for processing (Article 6)
    - Data retention periods
    - International transfer safeguards
    - User rights (access, rectification, erasure, portability)
    - ICO complaint procedure
  - Crawler Ethics Policy (`/ethics`)
    - Responsible web crawling practices
    - Rate limiting and server respect
    - User agent identification (PirouetteBot)
    - robots.txt compliance
    - Opt-out procedures
    - DMCA compliance
  - Updated footer links on landing and pricing pages

- **BullMQ Worker for Analysis Jobs** (Task 16)
  - Queue configuration module (`railway/src/queue/config.ts`)
    - Redis connection management with retry logic
    - Default job options with exponential backoff retries
    - Configurable worker concurrency and job timeout
    - Queue statistics and health monitoring
  - Worker implementation (`railway/src/queue/worker.ts`)
    - Processes jobs from Redis queue
    - Progress reporting via BullMQ job updates
    - Error classification for retryable vs non-retryable errors
    - Graceful shutdown with active job completion
  - Separate worker entry point (`railway/src/worker.ts`)
    - Can run as standalone process from HTTP server
    - Periodic queue statistics logging
    - Signal handling (SIGTERM/SIGINT)
  - Updated server (`railway/src/server.ts`)
    - Queue mode (default) adds jobs to Redis queue
    - Direct mode fallback for development without Redis
    - Queue stats endpoint (`GET /queue/stats`)
    - Manual job retry endpoint (`POST /queue/retry/:jobId`)
  - Dockerfile support for multiple modes
    - MODE=server (HTTP API only)
    - MODE=worker (BullMQ worker only)
    - MODE=all (both in single container)

- **Anonymous User Flow**: Users can analyse their landing page without signing up
  - Hero section URL input form (`HeroAnalyzeForm`)
  - IP-based rate limiting (1 analysis/day for anonymous users)
  - Analysis progress page (`/analyze/[jobId]`)
  - Report page accessible without authentication (`/report/[id]`)
  - Email capture modal for converting anonymous users to registered

- **Payment System**: Stripe integration for subscriptions
  - Checkout session creation (`/api/create-checkout-session`)
  - Billing portal for subscription management (`/api/billing-portal`)
  - Webhook handler for subscription events (`/api/webhooks/stripe`)
  - 7-day free trial support

- **Plan-Based Access Control**
  - Rate limiting by plan (Free: 1/week, Pro: unlimited)
  - Feature gating system (`src/lib/features.ts`)
  - `useFeatureAccess` React hook
  - `FeatureGate` component for conditional feature rendering
  - Upgrade modal when hitting rate limits

- **Dynamic Navigation**: Auth-aware navigation component
  - Shows "Sign In" / "Get Started Free" for unauthenticated users
  - Shows "Dashboard" link and UserButton for authenticated users

### Fixed
- Navigation now correctly reflects authentication state

### Components Created
- `src/components/HeroAnalyzeForm.tsx` - Landing page URL input
- `src/components/EmailCaptureModal.tsx` - Convert anonymous to registered
- `src/components/UpgradeModal.tsx` - Upgrade prompts
- `src/components/DashboardAnalyzeForm.tsx` - Dashboard analysis form
- `src/components/FeatureGate.tsx` - Pro feature gating
- `src/components/Navigation.tsx` - Dynamic auth-aware navigation
- `src/components/TrafficContext.tsx` - Traffic tier guidance display
- `src/components/ValidationTimeline.tsx` - Milestone tracking for recommendations

### API Routes Created
- `POST /api/analyze` - Submit analysis (supports anonymous)
- `GET /api/jobs/[jobId]` - Job status
- `GET /api/reports/[id]` - Get report
- `POST /api/claim-report` - Claim anonymous report
- `POST /api/create-checkout-session` - Stripe checkout
- `POST /api/billing-portal` - Stripe billing portal
- `POST /api/webhooks/stripe` - Stripe webhooks
- `GET /api/user/plan` - User plan info

### Database
- Added `anonymous_analyses` table for IP-based rate limiting
- Modified `jobs` and `reports` tables to support null `user_id`
- Added `weekly_traffic` column to `jobs` and `reports` tables (migration 004)

