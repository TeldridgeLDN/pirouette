# Changelog

All notable changes to Pirouette will be documented in this file.

## [Unreleased]

### Added
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

