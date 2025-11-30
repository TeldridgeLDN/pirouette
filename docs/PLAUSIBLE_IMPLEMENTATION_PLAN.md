# Plausible Analytics Implementation Plan for Pirouette

**Source:** portfolio-redesign Plausible skill  
**Target:** Pirouette (Design Confidence SaaS)  
**Date:** 2025-11-29  
**Task:** 22 - Implement analytics with Plausible

---

## Executive Summary

This plan adapts the proven Plausible analytics implementation from `portfolio-redesign` for Pirouette's Next.js SaaS application. The implementation provides privacy-friendly, GDPR-compliant analytics with custom event tracking for user journeys and conversions.

---

## 1. Files to Create/Modify

### New Files

| File | Description | Source |
|------|-------------|--------|
| `src/lib/analytics/plausible.ts` | Core tracking utilities | Adapted from `portfolio-redesign/src/lib/analytics.ts` |
| `src/components/TrackableButton.tsx` | Button with auto-tracking | Adapted from `portfolio-redesign/src/components/validate/TrackableButton.tsx` |
| `src/components/TrackableLink.tsx` | Link with auto-tracking | New (Next.js Link wrapper) |
| `docs/PLAUSIBLE_SETUP.md` | Setup documentation | Adapted |
| `docs/PLAUSIBLE_EVENTS_REFERENCE.md` | Events quick reference | New for Pirouette |

### Modified Files

| File | Changes |
|------|---------|
| `src/app/layout.tsx` | Add Plausible script tag to `<head>` |
| `src/app/page.tsx` | Add scroll tracking initialisation |
| `src/components/HeroAnalyzeForm.tsx` | Track analysis submissions |
| `src/components/EmailCaptureModal.tsx` | Track email signups |
| `src/components/UpgradeModal.tsx` | Track upgrade intent |
| `src/app/dashboard/page.tsx` | Track dashboard interactions |
| `src/app/report/[id]/page.tsx` | Track report views and actions |
| `src/app/pricing/page.tsx` | Track pricing page and plan views |

---

## 2. Pirouette-Specific Events

### Conversion Events (Primary KPIs)

| Event Name | When It Fires | Properties | Goal |
|------------|---------------|------------|------|
| `Analysis_Submitted` | User submits URL for analysis | `{ source: 'hero' \| 'dashboard' }` | Track analysis starts |
| `Analysis_Completed` | Analysis results displayed | `{ score: number, url: string }` | Measure completion rate |
| `Signup_Started` | User clicks sign-up CTA | `{ source: string, plan?: string }` | Track signup intent |
| `Signup_Completed` | User completes registration | `{ method: 'email' \| 'google' }` | Conversion event |
| `Trial_Started` | User begins Pro trial | `{ source: string }` | Trial conversion |
| `Upgrade_Clicked` | User clicks upgrade CTA | `{ source: string, plan: string }` | Upgrade intent |
| `Subscription_Created` | User converts to paid | `{ plan: string, revenue: number }` | Revenue tracking |
| `Report_Saved` | Anonymous user saves report | `{ method: 'email' \| 'signup' }` | Engagement metric |

### Engagement Events

| Event Name | When It Fires | Properties |
|------------|---------------|------------|
| `Report_Viewed` | User views analysis report | `{ reportId: string, isOwner: boolean }` |
| `Recommendation_Clicked` | User expands recommendation | `{ type: string, priority: string }` |
| `PDF_Downloaded` | User downloads PDF report | `{ reportId: string }` |
| `Share_Clicked` | User shares report | `{ method: string }` |
| `Dashboard_Visited` | User visits dashboard | `{ analysisCount: number }` |
| `Pricing_Viewed` | User views pricing page | `{ source: string }` |
| `Plan_Compared` | User views plan details | `{ plan: string }` |

### Scroll Depth Events

| Event Name | When It Fires | Page |
|------------|---------------|------|
| `Scroll_Depth_50` | User scrolls 50% | Landing page |
| `Scroll_Depth_75` | User scrolls 75% | Landing page |
| `Scroll_Depth_100` | User reaches bottom | Landing page |

### Navigation Events

| Event Name | When It Fires | Properties |
|------------|---------------|------------|
| `Outbound_Click` | User clicks external link | `{ url: string, label?: string }` |
| `CTA_Click` | User clicks any CTA | `{ variant: string, label: string }` |

---

## 3. Technical Adaptations

### Environment Detection

```typescript
// portfolio-redesign (Astro)
if (import.meta.env.DEV) { ... }

// Pirouette (Next.js)
if (process.env.NODE_ENV === 'development') { ... }
```

### Domain Configuration

```typescript
// portfolio-redesign
data-domain="validate.strategyxdesign.co.uk"

// Pirouette (to be set)
data-domain="pirouette.app" // or your production domain
```

### Import Paths

```typescript
// portfolio-redesign
import { trackEvent } from '../../lib/analytics';

// Pirouette
import { trackEvent } from '@/lib/analytics/plausible';
```

### Next.js Script Component

```tsx
// Use Next.js Script for optimised loading
import Script from 'next/script';

<Script
  defer
  data-domain="pirouette.app"
  src="https://plausible.io/js/script.js"
  strategy="afterInteractive"
/>
```

---

## 4. Implementation Phases

### Phase 1: Core Setup (30 mins)
1. Create `src/lib/analytics/plausible.ts` with adapted utilities
2. Add Plausible script to `layout.tsx`
3. Create type definitions for Pirouette events
4. Test in development mode (console logging)

### Phase 2: Landing Page Tracking (45 mins)
1. Add scroll depth tracking to homepage
2. Track "Analyse" form submissions in `HeroAnalyzeForm`
3. Track CTA clicks on landing page
4. Track pricing section views

### Phase 3: User Journey Tracking (45 mins)
1. Track signup/signin flows
2. Track analysis completion
3. Track report views and interactions
4. Track email capture modal

### Phase 4: Conversion Tracking (30 mins)
1. Track upgrade modal interactions
2. Track subscription creation (webhook integration)
3. Track PDF downloads
4. Track referral link clicks

### Phase 5: Dashboard Setup (30 mins)
1. Create Plausible account (if not exists)
2. Add Pirouette domain
3. Configure all custom event goals
4. Set up conversion tracking
5. Create shared dashboard link

### Phase 6: Documentation & Testing (30 mins)
1. Create `PLAUSIBLE_SETUP.md`
2. Create `PLAUSIBLE_EVENTS_REFERENCE.md`
3. Test all events in production
4. Document UTM parameter usage

---

## 5. File Structure

```
src/
├── lib/
│   └── analytics/
│       ├── plausible.ts        # Core tracking utilities
│       └── index.ts            # Re-export
├── components/
│   ├── TrackableButton.tsx     # Auto-tracking button
│   └── TrackableLink.tsx       # Auto-tracking link
docs/
├── PLAUSIBLE_SETUP.md          # Setup guide
└── PLAUSIBLE_EVENTS_REFERENCE.md # Events quick reference
```

---

## 6. Core Implementation Code

### `src/lib/analytics/plausible.ts` (Preview)

```typescript
/**
 * Plausible Analytics Tracking Utilities for Pirouette
 * 
 * Privacy-friendly analytics. No cookies, GDPR compliant.
 * Adapted from portfolio-redesign skill.
 */

export type PlausibleEvent =
  // Conversion Events
  | 'Analysis_Submitted'
  | 'Analysis_Completed'
  | 'Signup_Started'
  | 'Signup_Completed'
  | 'Trial_Started'
  | 'Upgrade_Clicked'
  | 'Subscription_Created'
  | 'Report_Saved'
  // Engagement Events
  | 'Report_Viewed'
  | 'Recommendation_Clicked'
  | 'PDF_Downloaded'
  | 'Share_Clicked'
  | 'Dashboard_Visited'
  | 'Pricing_Viewed'
  | 'Plan_Compared'
  // Scroll Events
  | 'Scroll_Depth_50'
  | 'Scroll_Depth_75'
  | 'Scroll_Depth_100'
  // Navigation Events
  | 'Outbound_Click'
  | 'CTA_Click';

export interface PlausibleEventProps {
  revenue?: number;
  props?: Record<string, string | number | boolean>;
}

export function trackEvent(
  eventName: PlausibleEvent,
  props?: PlausibleEventProps
): void {
  if (typeof window === 'undefined' || !window.plausible) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Plausible Dev]', eventName, props);
    }
    return;
  }

  try {
    if (props && Object.keys(props).length > 0) {
      window.plausible(eventName, { props: props.props || props });
    } else {
      window.plausible(eventName);
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[Plausible Error]', error);
    }
  }
}

// ... additional helper functions
```

---

## 7. Integration Points in Pirouette

### Landing Page (`src/app/page.tsx`)

```typescript
// Add to HeroSection component
import { setupScrollTracking } from '@/lib/analytics/plausible';

useEffect(() => {
  setupScrollTracking();
}, []);
```

### Analysis Form (`src/components/HeroAnalyzeForm.tsx`)

```typescript
import { trackEvent } from '@/lib/analytics/plausible';

const handleSubmit = async (url: string) => {
  trackEvent('Analysis_Submitted', { 
    props: { source: 'hero' } 
  });
  // ... existing submission logic
};
```

### Email Capture (`src/components/EmailCaptureModal.tsx`)

```typescript
import { trackEvent } from '@/lib/analytics/plausible';

const handleSignupClick = () => {
  trackEvent('Signup_Started', { 
    props: { source: 'email_capture', trigger: 'report_save' } 
  });
};
```

### Pricing Page (`src/app/pricing/page.tsx`)

```typescript
import { trackEvent } from '@/lib/analytics/plausible';

useEffect(() => {
  trackEvent('Pricing_Viewed', { 
    props: { source: document.referrer || 'direct' } 
  });
}, []);
```

---

## 8. Plausible Dashboard Configuration

### Goals to Create

After deploying, create these custom event goals in Plausible dashboard:

**Conversion Goals:**
- `Analysis_Submitted`
- `Analysis_Completed`
- `Signup_Completed`
- `Trial_Started`
- `Subscription_Created` (with revenue tracking)

**Engagement Goals:**
- `Report_Viewed`
- `PDF_Downloaded`
- `Recommendation_Clicked`
- `Dashboard_Visited`

**Scroll Goals:**
- `Scroll_Depth_50`
- `Scroll_Depth_75`
- `Scroll_Depth_100`

### Properties to Configure

For events with properties, enable custom props in Plausible:

| Event | Properties |
|-------|------------|
| `Analysis_Submitted` | source |
| `Signup_Started` | source, plan |
| `Subscription_Created` | plan, revenue |
| `CTA_Click` | variant, label |

---

## 9. Testing Checklist

### Development Testing
- [ ] Events log to console in development
- [ ] No console errors on page load
- [ ] Scroll tracking initialises correctly
- [ ] Form submissions trigger events

### Production Testing
- [ ] Plausible script loads (check Network tab)
- [ ] Pageviews appear in Realtime dashboard
- [ ] `Analysis_Submitted` fires on form submit
- [ ] `Signup_Started` fires on CTA click
- [ ] Scroll depth events fire at 50/75/100%
- [ ] Revenue tracking works for subscriptions

### Browser Testing
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Mobile (iOS/Android)

---

## 10. Estimated Effort

| Phase | Time | Priority |
|-------|------|----------|
| Phase 1: Core Setup | 30 mins | High |
| Phase 2: Landing Page | 45 mins | High |
| Phase 3: User Journey | 45 mins | High |
| Phase 4: Conversion | 30 mins | High |
| Phase 5: Dashboard | 30 mins | Medium |
| Phase 6: Docs & Testing | 30 mins | Medium |
| **Total** | **~3.5 hours** | |

---

## 11. Success Metrics

After implementation, track these KPIs:

| Metric | Target | Measurement |
|--------|--------|-------------|
| Analysis Completion Rate | >80% | `Analysis_Completed` / `Analysis_Submitted` |
| Signup Conversion | >5% | `Signup_Completed` / unique visitors |
| Trial Conversion | >10% | `Trial_Started` / `Signup_Completed` |
| Paid Conversion | >3% | `Subscription_Created` / `Trial_Started` |
| Scroll Depth 75%+ | >40% | `Scroll_Depth_75` / unique visitors |

---

## 12. Dependencies

### NPM Packages
- None required (Plausible uses external script)

### External Services
- Plausible Analytics account
- Domain verification in Plausible

### Environment Variables
```bash
# Optional: For proxy setup to bypass ad blockers
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=pirouette.app
```

---

## 13. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Ad blockers block Plausible | 10-15% tracking loss | Consider Plausible proxy (optional) |
| Script affects performance | Page speed decrease | Use `defer` and `afterInteractive` |
| Event naming inconsistency | Fragmented data | Use TypeScript types for enforcement |
| Missing events | Incomplete funnel data | Thorough testing checklist |

---

## 14. Next Steps

1. **Review this plan** - Confirm events and priorities
2. **Create Plausible account** - Set up pirouette.app domain
3. **Implement Phase 1** - Core tracking utilities
4. **Proceed through phases** - Landing → Journey → Conversion
5. **Configure dashboard** - Goals and properties
6. **Monitor & iterate** - Adjust based on data

---

**Ready to proceed?** Say "go" and I'll begin implementing Phase 1.


