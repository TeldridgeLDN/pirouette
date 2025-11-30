# Changelog

All notable changes to Pirouette will be documented in this file.

## [Unreleased]

### Added
- **Real Benchmark Data System** (Pro UX Enhancement)
  - Analyzed 36 award-winning sites using Pirouette's own scoring system
  - Top performers: Warby Parker (88), Intercom (75), PlanetScale (71)
  - Benchmark data stored in `railway/src/analyzer/benchmark-data.json`
  - `generate-benchmarks` script for quarterly data refresh
  - Benchmark rotation system prevents repeated examples in reports

- **Percentile-Based Scoring Algorithm** (Scoring Improvement)
  - Color scoring: 7 tiers from "exceptional" (≤5 colors: 92-100) to "complex" (60+: 32-42)
  - CTA scoring: 60% weight on button CTAs, 40% on total interactive elements
  - Typography scoring: Font count tiers with base font size bonus
  - Complexity scoring: 7 tiers from "minimal" (<100 elements) to "extreme" (5000+)
  - Random variance within tiers for natural score distribution
  - New functions: `getPercentileScore()`, `getComparableBenchmark()`

- **Pro Value Differentiation - Phase 1** (Task 52)
  - Expandable Dimension Cards for Pro users showing detailed findings
  - Dimension cards display "PRO INSIGHTS" with specific analysis results
  - Free users see "🔒 See insights (Pro)" teaser on dimension cards
  - Recommendations limited to 3 for free users with upgrade prompt
  - Blurred preview of additional recommendations for free users
  - Time estimates added to recommendations (~15 min, ~2 hours, ~1 day)
  - Clock icon with time estimate badge on each recommendation
  - "Click any dimension for detailed insights" hint for Pro users
  - **Action Items Checklist** (Subtask 52.3) - Interactive checklist in recommendations
    - Pro users see actionable steps with checkbox completion tracking
    - Progress bar showing completion percentage
    - Completion state persisted in localStorage per report/recommendation
    - Free users see blurred preview with "Unlock Action Items" upgrade prompt
    - Violet/indigo gradient styling to distinguish from other sections

### Added (Task 55 - Traffic Context Input)
- **Traffic Input for Report Page** (Pro Feature)
  - Pro users can add/update weekly traffic data directly on the report page
  - New API endpoint `/api/reports/[id]/traffic` for traffic updates
  - Input field appears when no traffic data exists (Pro users only)
  - Edit button for Pro users to update existing traffic data
  - Success/error feedback with loading states
  - Traffic data updates local state and triggers recommendation re-sort
  - Free users see upgrade prompt instead of input field
  - Help text linking to Google Analytics for finding traffic data

### Fixed
- **TrafficContext React Hooks Bug** - Fixed hooks order violation where `useState(isEditing)` was called after an early return. All hooks now called unconditionally at component top, following React rules of hooks.
- **Traffic API Type Error** - Fixed TypeScript build error in `/api/reports/[id]/traffic` route where Supabase types didn't include `weekly_traffic` column.

### Changed
- **Neutral Language in Recommendations** - Changed "Your page" to "This page" throughout recommendations to support users analysing competitor/third-party sites
- **Unified Card System for Recommendations & Designer's Eye Review** (UX Improvement)
  - Designer's Eye Review now styled consistently with recommendation cards
  - Added accent bar, tag-style indicators (Visual Appeal score, date, PRO badge)
  - Mini-preview of overall impression in collapsed state
  - Insight summary badges showing strength/improvement/critical counts
  - Free user teaser styled as locked recommendation card
  - Consistent expand/collapse interaction pattern
  - Subtle gradient backgrounds only in expanded content sections

### Added (Task 53 - Pro Quick Wins)
- **Above-the-Fold Line Indicator** (53.1) - Toggleable fold line overlay on page screenshots
  - Rose dashed line at 800px viewport height
  - Dynamic positioning based on image scale factor
  - Toggle button in browser chrome area (Pro only)
- **Executive Summary** (53.2) - At-a-glance overview for Pro users
  - Shows overall score with estimated percentile ranking
  - Displays priority fix (first recommendation)
  - Calculates total implementation time from all recommendations
- **Benchmark Comparison** (53.3) - Compare dimension scores to top sites
  - Shows score vs average from 38 award-winning sites
  - Green indicator when above benchmark, amber when below
  - Point difference displayed in expanded dimension cards
- **Shareable Score Badge** (53.5) - Embeddable SVG badge
  - Badge preview on report page with gradient design
  - Copyable HTML embed code with Copy button
  - API endpoint at /api/badge/[id] generates dynamic SVG

### Added (Task 54 - Designer's Eye Review)
- **AI Vision Analysis** - Claude-powered qualitative design feedback for Pro users
  - Visual appeal rating (1-10) with detailed explanation
  - First impression feedback (what catches the eye in 3 seconds)
  - Design insights categorised as strengths, improvements, or critical issues
  - Missing elements detection (social proof, trust signals, etc.)
  - Emotional impact analysis with improvement suggestions
  - Top 3 priorities for maximum impact
  - Reviews cached in Supabase for persistence
  - Regenerate button for fresh feedback
  - Free users see blurred teaser with upgrade prompt
  - Branded as "Designer's Eye Review" with no AI references in UI

- **Enhanced Analysis Insights with Benchmarks** (Pro UX Enhancement)
  - Typography findings now compare with **Stripe**, **Linear**, **Apple**, **Vercel**
  - Colour analysis references **Notion**, **Superhuman** palette sizes
  - CTA findings compare against **Dropbox**, **Slack**, **Vercel** patterns
  - Complexity analysis benchmarks against **Linear** (~150), **Apple** (~200) element counts
  - Added benchmarks.ts with design data from 50+ award-winning sites
  - Findings use ✓/⚠/✗ indicators for quick scanning
  - WCAG accessibility notes included where relevant

- **Plausible Analytics Integration** (Task 22)
  - Core tracking utilities (`src/lib/analytics/plausible.ts`)
  - 16 custom events for full user journey tracking
  - `TrackableButton` component with auto-tracking
  - `ScrollTracker` component for scroll depth tracking
  - Landing page tracking: scroll depth, CTA clicks, form submissions
  - User journey tracking: signups, analysis completion, report views
  - Conversion tracking: upgrade intent, trial starts, PDF downloads
  - Comprehensive documentation (`docs/PLAUSIBLE_SETUP.md`, `docs/PLAUSIBLE_EVENTS_REFERENCE.md`)
  - Environment-based script loading (set `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`)
  - Privacy-friendly: no cookies, GDPR compliant
  - Adapted from portfolio-redesign sibling project skill

### Fixed
- **Stripe SDK v20 Compatibility** - Fixed `current_period_end` access for Stripe API version `2025-11-17.clover` where the property moved from `Subscription` to `SubscriptionItem`
- **Referral Click Tracking** - Stubbed referral click tracking pending Supabase type generation
- **PDF Footer Generation** - Fixed jsPDF type compatibility for `getNumberOfPages` and `setPage` methods

### Added
- **Email Templates with Resend** (Task 23)
  - Resend client configuration (`src/lib/email/resend.ts`)
  - Base email template with Pirouette branding
  - Welcome email for new signups
  - Analysis Complete email with scores
  - Subscription emails: trial started, trial ending, confirmed, payment failed, cancelled
  - Referral emails: friend signed up, reward earned
  - Easy-to-use send functions (`sendWelcomeEmail`, etc.)
  - Tags for email categorisation and analytics

- **Referral Programme** (Task 50)
  - Database migration `007_referrals.sql` with referral tracking
  - `/api/referrals` endpoints for stats and tracking
  - `/api/referrals/reward` for processing Stripe rewards
  - `ReferralDashboard` component with share buttons
  - `/r/[code]` landing page for referred users
  - Auto-generated unique referral codes (6 chars)
  - Rewards: 1 free month for referrer, 20% off for referee
  - Fraud prevention: 12 month/year cap, self-referral block

- **Onboarding Flow for New Users** (Task 24)
  - `useOnboarding` hook for tracking progress in localStorage
  - `OnboardingWelcome` modal with product intro (2-step wizard)
  - `OnboardingChecklist` component with progress ring
  - `OnboardingHandler` for auto-completing steps
  - 4 onboarding steps: first analysis, view report, explore recommendation, check comparison
  - Dismissible checklist, persists until all steps complete

- **Industry Benchmarking System** (Task 51)
  - `industry-classifier.ts` utility for detecting site industry
  - Database migration `006_industry_benchmarks.sql` with aggregate stats
  - `benchmark-service.ts` for fetching/updating benchmarks
  - `IndustryComparison` component with percentile rankings
  - `/api/benchmarks/[industry]` endpoint for public benchmark data
  - Supports 9 industries: SaaS, E-commerce, Agency, Blog, Marketplace, Finance, Health, Education, Other
  - Privacy-focused: only aggregates stored, minimum 10 samples before showing
  - Incremental average calculation for efficient updates

- **Product Hunt Launch Preparation** (Task 25)
  - Special landing page `/welcome/producthunt` with 20% off offer
  - `ProductHuntBanner` component for site-wide PH visitor detection
  - UTM and localStorage tracking for PH referrals
  - Comprehensive launch documentation (`docs/product-hunt-launch.md`)
  - Includes: PH listing copy, first comment, social media posts, FAQ
  - Launch day checklist and success metrics

- **Railway Cron Jobs for Recurring Tasks** (Task 18)
  - Cron job framework with `cron` library
  - `refresh-patterns` job (daily at 3am UTC) - validates pattern library
  - `retry-failed` job (every 30 min) - retries failed analysis jobs
  - `cleanup-stale` job (every hour) - handles stuck jobs
  - Manual trigger endpoint: `POST /cron/run/:jobName`
  - Graceful shutdown stops all cron jobs
  - Configurable via `ENABLE_CRON` environment variable

- **Failed Payments and Dunning Flow** (Task 47)
  - `PaymentFailedBanner` component with urgency levels
  - Stripe webhook updates for `invoice.payment_failed` and `invoice.payment_succeeded`
  - Database migration `005_payment_status.sql` for tracking payment failures
  - Grace period tracking (7 days / 3 retries before suspension)
  - Automatic Pro access suspension after failed grace period
  - Payment recovery restores full access immediately
  - Dashboard integration shows banner when payment issues exist

- **Subscription Cancellation Flow** (Task 46)
  - `/api/subscription/cancel` endpoint for scheduling cancellations
  - CancellationModal with reason survey and retention offers
  - Customized offers based on cancellation reason
  - Cancel at period end (maintains Pro access until billing cycle ends)
  - Reactivate option via Stripe billing portal
  - Updated billing page with cancel subscription section

- **Account Deletion and GDPR Data Export** (Task 49)
  - `/api/account/export` endpoint for GDPR-compliant data export
  - `/api/account/delete` endpoint with subscription cancellation
  - Settings page (`/dashboard/settings`) with danger zone
  - Delete account modal with "DELETE" confirmation
  - Data export as JSON with all reports and analysis history
  - Automatic Stripe subscription cancellation on delete
  - Settings link added to dashboard Account Information

- **Competitor Comparison Feature for Pro Users** (Task 45)
  - CompetitorComparison component with Pro gating
  - Locked preview with blurred mock data for free users
  - Add competitors prompt for Pro users
  - Side-by-side comparison table with all dimensions
  - Crown/warning indicators for best/below-average scores
  - Competitive insights: gaps and advantages analysis
  - Integrated into report page

- **PDF Export Feature for Pro Users** (Task 44)
  - `/api/reports/[id]/pdf` endpoint with Pro gating
  - Professional PDF template with Pirouette branding
  - Overall score with color-coded rating
  - Dimension breakdown table with scores
  - Top 5 recommendations with priority/effort labels
  - Automatic filename based on URL and date
  - Export button in report header (locked for free users)
  - Loading state during PDF generation

- **Historical Tracking for Pro Users** (Task 43)
  - `/api/reports/history` endpoint with URL normalization
  - HistoricalTracking component with bar chart trend visualization
  - Improvement summary showing gains/losses since last analysis
  - Comparison table with links to past reports
  - Pro feature gating with locked preview for free users
  - "First Analysis" state for new URLs
  - Auto-calculates score changes across all dimensions

- **Trial User Experience & Conversion Flow** (Task 48)
  - Trial Welcome Modal shows after checkout success (session_id param)
  - Shows all Pro features unlocked with icons and tips
  - Trial Expired Modal for ended trials with feature comparison
  - Trial Ending Prompt (Day 5+) with urgent CTAs
  - Dashboard layout wraps all pages with trial handler
  - useUserPlan hook extended with hasPaymentMethod
  - localStorage tracking for trial state persistence
  - Automatic URL param cleanup after showing modal

- **Pro Status Indicators Throughout UI** (Task 42)
  - Pro badge in Navigation bar (gradient purple, links to billing)
  - Trial badge with countdown ("TRIAL • 5d") for trialing users
  - Trial banner in QuotaDisplay with "Add Payment" CTA
  - `useUserPlan` hook for client-side subscription status
  - Fetches trial status, days remaining, and period end dates
  - Pro badge links to `/dashboard/billing` for management
  - Trial-specific messaging in QuotaDisplay
  - Status-aware UI: free, trialing, active, past_due states

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

