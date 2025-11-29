# Plausible Analytics Events Reference

Quick reference for all custom events tracked in Pirouette.

---

## Conversion Events (Primary KPIs)

| Event Name | When It Fires | Properties | Goal |
|------------|---------------|------------|------|
| `Analysis_Submitted` | User submits URL for analysis | `source: 'hero' \| 'dashboard' \| 'report'` | Track analysis starts |
| `Analysis_Completed` | Analysis results displayed | `score: number, domain?: string` | Measure completion rate |
| `Signup_Started` | User clicks sign-up CTA | `source: string, plan?: string` | Track signup intent |
| `Signup_Completed` | User completes registration | `method: 'email' \| 'google'` | Conversion event |
| `Trial_Started` | User begins Pro trial | `source: string` | Trial conversion |
| `Upgrade_Clicked` | User clicks upgrade CTA | `source: string, plan: string, trigger?: string` | Upgrade intent |
| `Subscription_Created` | User converts to paid | `plan: string, interval: string, revenue: number` | Revenue tracking |
| `Report_Saved` | Anonymous user saves report | `method: 'email' \| 'signup'` | Engagement metric |

---

## Engagement Events

| Event Name | When It Fires | Properties |
|------------|---------------|------------|
| `Report_Viewed` | User views analysis report | `is_owner: boolean` |
| `Recommendation_Clicked` | User expands recommendation | `type: string, priority: string` |
| `PDF_Downloaded` | User downloads PDF report | (none) |
| `Share_Clicked` | User shares report | `method: string` |
| `Dashboard_Visited` | User visits dashboard | `analysis_count: number` |
| `Pricing_Viewed` | User views pricing page | `source?: string` |
| `Plan_Compared` | User views plan details | `plan: string` |

---

## Scroll Depth Events

| Event Name | When It Fires | Purpose |
|------------|---------------|---------|
| `Scroll_Depth_50` | User scrolls 50% of page | Measure moderate engagement |
| `Scroll_Depth_75` | User scrolls 75% of page | Measure high engagement |
| `Scroll_Depth_100` | User reaches bottom of page | Measure complete page reads |

---

## Navigation Events

| Event Name | When It Fires | Properties |
|------------|---------------|------------|
| `Outbound_Click` | User clicks external link | `url: string, label?: string` |
| `CTA_Click` | User clicks any CTA button | `variant: string, label: string, location?: string` |

---

## Code Examples

### Track Analysis Submission

```typescript
import { trackAnalysisSubmitted } from '@/lib/analytics';

// In HeroAnalyzeForm
trackAnalysisSubmitted('hero');

// In DashboardAnalyzeForm
trackAnalysisSubmitted('dashboard');
```

### Track Analysis Completion

```typescript
import { trackAnalysisCompleted } from '@/lib/analytics';

// When report loads
trackAnalysisCompleted(85, 'https://example.com');
```

### Track Upgrade Intent

```typescript
import { trackUpgradeClicked } from '@/lib/analytics';

// When user hits rate limit
trackUpgradeClicked('dashboard', 'pro', 'limit_reached');

// When user clicks upgrade on pricing page
trackUpgradeClicked('pricing_page', 'pro', 'checkout_button');
```

### Track CTA Clicks

```typescript
import { trackCTA } from '@/lib/analytics';

trackCTA('primary', 'Hero CTA - Sign Up', 'homepage');
```

### Setup Scroll Tracking

```typescript
import { setupScrollTracking } from '@/lib/analytics';

useEffect(() => {
  const cleanup = setupScrollTracking();
  return () => cleanup?.();
}, []);
```

Or use the component:

```tsx
import ScrollTracker from '@/components/ScrollTracker';

<ScrollTracker />
```

---

## Dashboard Configuration

### Adding Goals in Plausible

1. Go to **Site Settings** > **Goals**
2. Click **+ Add Goal**
3. Select **Custom Event**
4. Enter the exact event name (case-sensitive)
5. Click **Add Goal**

### Properties to Enable

For events with properties, enable custom props in Plausible:

| Event | Properties to Enable |
|-------|---------------------|
| `Analysis_Submitted` | source |
| `Analysis_Completed` | score, domain |
| `Signup_Started` | source, plan |
| `Upgrade_Clicked` | source, plan, trigger |
| `Subscription_Created` | plan, interval (+ revenue tracking) |
| `CTA_Click` | variant, label, location |

---

## Testing Events

### Development Mode

Events log to console:

```
[Plausible Dev] Analysis_Submitted { props: { source: 'hero' } }
[Plausible Dev] Scroll_Depth_50
```

### Production Verification

1. Open Plausible dashboard
2. Click **Realtime** view
3. Trigger event on your site
4. Verify it appears within 30 seconds

---

## Key Metrics to Track

### Conversion Funnel

```
Visitors → Analysis_Submitted → Analysis_Completed → Signup_Started → Signup_Completed → Trial_Started → Subscription_Created
```

### Target Conversion Rates

| Metric | Target | Calculation |
|--------|--------|-------------|
| Analysis Completion | >80% | `Analysis_Completed` / `Analysis_Submitted` |
| Signup Rate | >5% | `Signup_Completed` / unique visitors |
| Trial Conversion | >10% | `Trial_Started` / `Signup_Completed` |
| Paid Conversion | >3% | `Subscription_Created` / `Trial_Started` |

### Engagement Metrics

| Metric | Target | Significance |
|--------|--------|--------------|
| Scroll Depth 75%+ | >40% | High engagement indicator |
| Report Views | - | Feature adoption |
| PDF Downloads | - | Pro feature usage |

---

## Files Modified for Analytics

| File | Tracking Added |
|------|---------------|
| `src/app/layout.tsx` | Plausible script |
| `src/app/page.tsx` | ScrollTracker |
| `src/app/pricing/page.tsx` | Pricing view, scroll, upgrade |
| `src/app/report/[id]/page.tsx` | Report view, completion, PDF |
| `src/components/HeroAnalyzeForm.tsx` | Analysis submission |
| `src/components/DashboardAnalyzeForm.tsx` | Analysis submission, upgrade |
| `src/components/EmailCaptureModal.tsx` | Signup, report save |
| `src/components/UpgradeModal.tsx` | Upgrade, trial |

---

**Reference:** See `PLAUSIBLE_SETUP.md` for full implementation guide.

**Last Updated:** 2025-11-29

