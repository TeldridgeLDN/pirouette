# Revenue Impact & ROI Prioritisation Guide

> **Pirouette** - Design Confidence, Backed by Data

This guide explains how Pirouette calculates potential revenue impact and prioritises recommendations using ROI (Return on Investment) scoring.

---

## Table of Contents

1. [Overview](#overview)
2. [Revenue Impact Calculations](#revenue-impact-calculations)
3. [ROI Scoring System](#roi-scoring-system)
4. [Confidence Levels](#confidence-levels)
5. [Success Metrics](#success-metrics)
6. [Filtering & Prioritisation](#filtering--prioritisation)
7. [API Reference](#api-reference)
8. [Limitations & Caveats](#limitations--caveats)

---

## Overview

Pirouette goes beyond simple design scoring by providing **business-focused insights** that help you understand:

- **Revenue Impact**: How much potential MRR could a recommendation generate?
- **ROI Score**: Which recommendations give the best return for your effort?
- **Success Metrics**: How to measure if a change is working?

These features transform design recommendations from "fix this contrast issue" into "fixing this contrast issue could add £217/month to your revenue."

---

## Revenue Impact Calculations

### The Formula

Revenue impact is calculated using this formula:

```
Monthly Revenue Impact = (Improvement% × Weekly Traffic × Avg Price × Confidence Multiplier) × 4.33
```

Where:
- **Improvement%**: Expected conversion improvement based on industry benchmarks
- **Weekly Traffic**: Your website's weekly visitor count (if provided)
- **Avg Price**: Average product/service price (defaults to £29)
- **Confidence Multiplier**: Reduces estimate based on data certainty
- **4.33**: Average weeks per month

### Example Calculation

For a CTA button size recommendation:
- Expected improvement: 15-25% (average: 20%)
- Weekly traffic: 1,000 visitors
- Average pricing: £29/month
- Confidence: High (80% multiplier)

```
Base conversions = 1,000 × 2% (baseline) = 20 conversions/week
Improved conversions = 20 × 1.20 = 24 conversions/week
Additional conversions = 4/week
Weekly revenue = 4 × £29 = £116
Monthly revenue = £116 × 4.33 = £502
Adjusted (80%) = £502 × 0.8 = £402/month
```

### Improvement Benchmarks by Dimension

| Dimension | Min Improvement | Max Improvement | Confidence |
|-----------|-----------------|-----------------|------------|
| CTA Design | 15% | 25% | High |
| Colour & Contrast | 10% | 20% | High |
| Whitespace | 8% | 15% | Medium |
| Typography | 5% | 12% | Medium |
| Layout | 10% | 18% | Medium |
| Complexity | 7% | 14% | Low |
| Visual Hierarchy | 8% | 16% | Medium |

These benchmarks are based on industry research and A/B testing data from high-converting landing pages.

---

## ROI Scoring System

### The Formula

ROI is calculated to help you prioritise which recommendations to implement first:

```
ROI Score = Impact Score ÷ (Effort Minutes × Time to Results Weeks)
```

### Normalised Score (0-10)

Raw ROI scores are converted to a 0-10 scale using logarithmic normalisation:

```
Normalised = log10(rawROI + 0.1) × 3.33 + 6.67
```

This makes scores easier to interpret and compare.

### ROI Categories

| Category | Normalised Score | Description |
|----------|------------------|-------------|
| ⚡ **Quick Win** | ≥5.0 | High impact, low effort - do these first |
| 📈 **Strategic** | 2.0 - 4.9 | Valuable but requires more time/effort |
| 🎯 **Long-term** | <2.0 | Lower ROI - consider after quick wins |

### Impact Scores

| Priority Level | Impact Score |
|---------------|--------------|
| High | 10 |
| Medium | 5 |
| Low | 2 |

### Time to Results by Change Type

| Change Type | Default Time | Examples |
|-------------|--------------|----------|
| UI | 1 week | Button size, colours, spacing |
| Accessibility | 1 week | Contrast fixes, ARIA labels |
| Content | 2 weeks | Headlines, copy, messaging |
| Performance | 2 weeks | Image optimisation, lazy loading |
| Structural | 3 weeks | Layout changes, navigation |
| Other | 2 weeks | Mixed or complex changes |

---

## Confidence Levels

### What Confidence Means

Confidence indicates how reliable our revenue estimates are:

| Level | Indicator | Multiplier | Meaning |
|-------|-----------|------------|---------|
| **High** | ●●● | 80% | Strong pattern data, high traffic |
| **Medium** | ●●○ | 60% | Good data, moderate traffic |
| **Low** | ●○○ | 40% | Limited data or low traffic |

### How Confidence is Determined

Confidence depends on three factors:

1. **Pattern Sample Size**: How many examples support this recommendation?
   - ≥30 examples with quality ≥80% → Strong
   - ≥15 examples with quality ≥60% → Medium
   - Otherwise → Weak

2. **Pattern Quality Score**: How reliable is the underlying data?

3. **Traffic Volume**: Can results be measured statistically?
   - ≥1,000 weekly visitors → High traffic
   - ≥500 weekly visitors → Medium traffic
   - <500 weekly visitors → Low traffic

### Confidence Impact

A £500 theoretical revenue impact becomes:
- **High confidence**: £400 (£500 × 80%)
- **Medium confidence**: £300 (£500 × 60%)
- **Low confidence**: £200 (£500 × 40%)

---

## Success Metrics

Each recommendation includes success metrics to help you measure results:

### Expected Improvement Range

The percentage improvement you can expect, based on the recommendation dimension:

```
Example: "15-25% CTR improvement"
```

### Minimum Traffic Threshold

The weekly visitors needed to reliably measure the change:

| Confidence | Minimum Weekly Visitors |
|------------|------------------------|
| High | 1,000+ |
| Medium | 500+ |
| Low | 200+ |

### Measurement Period

How long to wait before evaluating results:

| Traffic Level | Measurement Period |
|---------------|-------------------|
| ≥10,000/week | 1-2 weeks |
| 1,000-10,000/week | 2-3 weeks |
| 500-1,000/week | 3-4 weeks |
| <500/week | 6-8 weeks |

---

## Filtering & Prioritisation

### Using ROI Filters

The report page includes filter buttons to view recommendations by ROI category:

- **All**: View all recommendations
- **⚡ Quick Wins**: High ROI items to implement first
- **📈 Strategic**: Medium ROI improvements
- **🎯 Long-term**: Lower ROI, consider after quick wins

### Recommended Implementation Order

1. **Start with Quick Wins** - Maximum impact for minimum effort
2. **Batch similar changes** - Group UI changes together
3. **Measure before moving on** - Wait for validation period
4. **Then tackle Strategic items** - Higher effort but still valuable
5. **Schedule Long-term items** - Plan these for future sprints

---

## API Reference

### TypeScript Interfaces

#### RevenueImpact

```typescript
interface RevenueImpact {
  potentialRevenue: number;      // Monthly potential in currency
  confidenceLevel: 'low' | 'medium' | 'high';
  timeToValidate: string;        // e.g., "1-2 weeks"
  calculationMethod: string;     // Formula breakdown
}
```

#### SuccessMetrics

```typescript
interface SuccessMetrics {
  improvementRange: string;      // e.g., "15-25%"
  visitorThreshold: number;      // Minimum weekly visitors
  measurementPeriod: string;     // e.g., "2 weeks"
}
```

#### ROIScoreData

```typescript
interface ROIScoreData {
  score: number;                 // Raw ROI (unbounded)
  normalizedScore: number;       // 0-10 scale
  category: 'quick-win' | 'strategic' | 'long-term';
  breakdown: {
    impactScore: number;         // 0-10
    effortMinutes: number;       // Implementation time
    timeToResultsWeeks: number;  // Validation time
  };
}
```

#### Recommendation (Extended)

```typescript
interface Recommendation {
  id: string;
  dimension: string;
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
  effort: 'low' | 'medium' | 'high';
  example?: string;
  changeType?: 'ui' | 'content' | 'structural' | 'performance' | 'accessibility' | 'other';
  
  // Revenue Impact (requires traffic data)
  revenueImpact?: RevenueImpact;
  
  // Success Metrics (always available)
  successMetrics?: SuccessMetrics;
  
  // ROI Scoring
  roiScore?: ROIScoreData;
  timeToResultsWeeks?: number;
}
```

### Utility Functions

Located in `src/lib/analysis/utils/`:

#### revenue-calculator.ts

```typescript
// Calculate revenue impact
calculateRevenueImpact(input: RevenueCalculationInput): number

// Generate complete revenue impact object
generateRevenueImpact(input: GenerateRevenueImpactInput): RevenueImpact | undefined

// Generate success metrics
generateSuccessMetrics(input: GenerateRevenueImpactInput): SuccessMetrics | undefined

// Format revenue for display
formatRevenue(revenue: number): string

// Get disclaimer text
getRevenueDisclaimer(): string
```

#### roi-calculator.ts

```typescript
// Parse effort strings to minutes
parseEffortEstimate(effort: string): number

// Calculate raw ROI
calculateROI(impactScore: number, effortMinutes: number, timeToResultsWeeks: number): number

// Get complete ROI score
calculateROIScore(input: CalculateROIScoreInput): ROIScore

// Sort recommendations by ROI
sortByROI<T extends { roiScore: ROIScore }>(recommendations: T[]): T[]

// Group by category
groupByROICategory<T>(recommendations: T[]): { quickWins: T[], strategic: T[], longTerm: T[] }
```

---

## Limitations & Caveats

### Important Disclaimers

⚠️ **Revenue estimates are projections, not guarantees.**

Our calculations are based on:
- Industry benchmarks from high-converting sites
- Average conversion improvements from A/B tests
- Conservative confidence multipliers

Actual results will vary based on:
- Your specific audience and market
- Quality of implementation
- Other changes made simultaneously
- Seasonal factors and market conditions

### When Estimates Are Less Reliable

- **Low traffic sites** (<500 weekly visitors): Statistical significance is harder to achieve
- **Niche markets**: Industry benchmarks may not apply
- **Complex changes**: Multiple variables make attribution difficult
- **New sites**: Limited historical data for comparison

### Best Practices

1. **Use as directional guidance**, not exact predictions
2. **Implement changes one at a time** when possible
3. **Wait the full measurement period** before judging results
4. **Track your own conversion data** to validate improvements
5. **Re-analyse periodically** as benchmarks evolve

### Data Privacy

- Traffic data is optional and used only for calculations
- We don't store or share your traffic information
- All analysis is performed server-side

---

## Further Reading

- [Pattern Library Documentation](../src/lib/analysis/patterns/README.md)
- [Analysis Engine Overview](../src/lib/analysis/README.md)
- [API Routes Documentation](../src/app/api/README.md)

---

*Last Updated: November 2025*
*Pirouette v0.1.0*


