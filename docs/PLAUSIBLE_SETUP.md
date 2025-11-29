# Plausible Analytics Setup Guide

**Service:** Plausible Analytics (https://plausible.io/)  
**Domain:** (Configure in `.env.local`)  
**Date:** 2025-11-29

---

## Overview

Plausible Analytics is implemented for Pirouette to provide privacy-friendly, lightweight analytics without cookies or GDPR consent requirements.

### Why Plausible Over Google Analytics?

| Feature | Plausible | Google Analytics 4 |
|---------|-----------|-------------------|
| **Script Size** | ~1KB | 75KB+ |
| **Privacy** | No cookies, no personal data | Cookies, tracks users across sites |
| **GDPR Compliance** | Built-in, no consent needed | Requires cookie consent banner |
| **Data Location** | EU servers only | Global, including USA |
| **Dashboard** | Simple, one-page view | Complex, requires training |
| **Page Load Impact** | Minimal | Significant |
| **Open Source** | Yes (AGPL) | No |

**Reference:** [Plausible vs Google Analytics](https://plausible.io/vs-google-analytics)

---

## Setup Steps

### 1. Create Plausible Account

1. Go to [https://plausible.io/register](https://plausible.io/register)
2. Sign up for a 30-day free trial (no credit card required)
3. Add your domain: `pirouette.app` (or your production domain)
4. Choose a plan based on expected traffic:
   - **Starter (10k pageviews/month):** £9/month
   - **Growth (100k pageviews/month):** £19/month

### 2. Configure Environment Variable

Add to `.env.local`:

```bash
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=pirouette.app
```

The Plausible script is automatically loaded in `src/app/layout.tsx` when this variable is set.

### 3. Configure Custom Goals in Plausible Dashboard

Navigate to **Site Settings > Goals** and add these custom events:

#### Conversion Goals (Primary KPIs)

| Goal Name | Type | Purpose |
|-----------|------|---------|
| `Analysis_Submitted` | Custom Event | Track analysis starts |
| `Analysis_Completed` | Custom Event | Track analysis completions |
| `Signup_Started` | Custom Event | Track signup intent |
| `Signup_Completed` | Custom Event | Track successful signups |
| `Trial_Started` | Custom Event | Track trial conversions |
| `Upgrade_Clicked` | Custom Event | Track upgrade intent |
| `Subscription_Created` | Custom Event | Track paid conversions |
| `Report_Saved` | Custom Event | Track anonymous report saves |

#### Engagement Goals

| Goal Name | Type | Purpose |
|-----------|------|---------|
| `Report_Viewed` | Custom Event | Track report views |
| `Recommendation_Clicked` | Custom Event | Track recommendation engagement |
| `PDF_Downloaded` | Custom Event | Track PDF exports |
| `Dashboard_Visited` | Custom Event | Track dashboard usage |
| `Pricing_Viewed` | Custom Event | Track pricing page views |

#### Scroll Depth Goals

| Goal Name | Type | Purpose |
|-----------|------|---------|
| `Scroll_Depth_50` | Custom Event | Track 50% scroll |
| `Scroll_Depth_75` | Custom Event | Track 75% scroll |
| `Scroll_Depth_100` | Custom Event | Track complete page reads |

---

## Implementation Details

### Analytics Utilities

Located at `src/lib/analytics/plausible.ts`

#### Basic Usage

```typescript
import { trackEvent, trackAnalysisSubmitted } from '@/lib/analytics';

// Track a simple event
trackEvent('Analysis_Submitted');

// Use convenience functions
trackAnalysisSubmitted('hero'); // source: 'hero' | 'dashboard' | 'report'
```

#### Available Functions

| Function | Purpose |
|----------|---------|
| `trackEvent(name, props?)` | Generic event tracking |
| `trackAnalysisSubmitted(source)` | Track analysis form submissions |
| `trackAnalysisCompleted(score, url?)` | Track analysis results |
| `trackSignupStarted(source, plan?)` | Track signup intent |
| `trackSignupCompleted(method)` | Track signup completion |
| `trackTrialStarted(source)` | Track trial starts |
| `trackUpgradeClicked(source, plan, trigger?)` | Track upgrade CTAs |
| `trackReportViewed(isOwner)` | Track report views |
| `trackPDFDownloaded()` | Track PDF exports |
| `trackPricingViewed(source?)` | Track pricing page views |
| `trackCTA(variant, label, location?)` | Track button clicks |
| `trackScrollDepth(percentage)` | Track scroll milestones |
| `setupScrollTracking()` | Initialise automatic scroll tracking |

### TrackableButton Component

```tsx
import TrackableButton from '@/components/TrackableButton';

<TrackableButton
  href="/sign-up"
  variant="primary"
  label="Hero CTA - Sign Up"
  location="homepage"
>
  Get Started Free
</TrackableButton>
```

### ScrollTracker Component

```tsx
import ScrollTracker from '@/components/ScrollTracker';

// Add to any page for automatic scroll tracking
<ScrollTracker />
```

---

## Testing

### Development Mode

Events log to console in development:

```
[Plausible Dev] Analysis_Submitted { props: { source: 'hero' } }
```

### Production Testing

1. Visit your site
2. Open Plausible dashboard > **Realtime**
3. Perform actions (click CTAs, scroll, submit forms)
4. Verify events appear within 30 seconds

### Test Checklist

- [ ] Script loads on page (check Network tab)
- [ ] Pageviews tracked in Realtime dashboard
- [ ] `Analysis_Submitted` fires on form submit
- [ ] `Signup_Started` fires on signup CTAs
- [ ] Scroll depth events fire at 50/75/100%
- [ ] No console errors related to Plausible

---

## Privacy & Compliance

### What Plausible Collects

- Page URL
- HTTP Referer
- Browser type
- Operating system
- Device type
- Country (IP anonymised immediately)

### What Plausible Does NOT Collect

- ❌ Cookies
- ❌ Persistent identifiers
- ❌ Personal data
- ❌ Cross-site tracking
- ❌ IP addresses (anonymised immediately)

### Legal Compliance

- **GDPR Compliant:** No cookie consent banner required
- **CCPA Compliant:** No personal information collected
- **UK GDPR Compliant:** Data processed in EU

---

## Troubleshooting

### Events Not Appearing

1. Check `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` is set
2. Verify custom goal is configured in Plausible (exact match)
3. Check browser console for errors
4. Ad blocker may be blocking Plausible

### Script Blocked by Ad Blocker

Options:
1. Accept some users won't be tracked (privacy-conscious users)
2. Set up Plausible proxy (optional, see [Proxy Setup](https://plausible.io/docs/proxy/introduction))

---

## Resources

- **Plausible Homepage:** https://plausible.io/
- **Documentation:** https://plausible.io/docs
- **Custom Events Guide:** https://plausible.io/docs/custom-event-goals
- **Stats API:** https://plausible.io/docs/stats-api
- **Privacy Policy:** https://plausible.io/privacy-focused-web-analytics

---

**Last Updated:** 2025-11-29  
**Maintained By:** Pirouette Team

