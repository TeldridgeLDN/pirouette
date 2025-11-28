# Revenue & ROI Utilities - Developer Guide

> Internal documentation for Pirouette development team

## File Structure

```
src/lib/analysis/utils/
├── revenue-calculator.ts    # Revenue impact calculations
├── roi-calculator.ts        # ROI scoring and prioritisation
├── effort-estimator.ts      # Effort estimation logic
├── color-utils.ts           # Colour analysis utilities
└── REVENUE_ROI_DEV_GUIDE.md # This file
```

---

## Revenue Calculator (`revenue-calculator.ts`)

### Core Functions

#### `calculateRevenueImpact(input: RevenueCalculationInput): number`

Calculates raw monthly revenue impact.

```typescript
interface RevenueCalculationInput {
  improvementPercentage: number;  // 0-100
  weeklyTraffic: number;
  averagePricing: number;
  confidenceMultiplier: number;   // 0-1
  conversionRate?: number;        // Default: 0.02 (2%)
}

// Formula
const weeksPerMonth = 4.33;
const currentConversions = weeklyTraffic * conversionRate;
const improvedConversions = currentConversions * (1 + improvementPercentage / 100);
const additionalConversions = improvedConversions - currentConversions;
const weeklyRevenue = additionalConversions * averagePricing;
const monthlyRevenue = weeklyRevenue * weeksPerMonth * confidenceMultiplier;
```

#### `determineConfidenceLevel(patternSampleSize, patternQualityScore, trafficVolume): ConfidenceLevel`

Determines confidence based on pattern data quality and traffic volume.

**Decision matrix:**
- High: Sample ≥30 AND Quality ≥80% AND Traffic ≥1000
- Medium: Sample ≥15 AND Quality ≥60% AND Traffic ≥500
- Low: Default

#### `getImprovementEstimate(dimension, patternStrength): ImprovementEstimate`

Returns improvement benchmarks for a design dimension.

**Benchmarks are defined in:**
```typescript
const IMPROVEMENT_BENCHMARKS = {
  'cta': { min: 15, max: 25 },
  'contrast': { min: 10, max: 20 },
  'whitespace': { min: 8, max: 15 },
  'typography': { min: 5, max: 12 },
  'layout': { min: 10, max: 18 },
  'complexity': { min: 7, max: 14 },
  'visualHierarchy': { min: 8, max: 16 },
};
```

#### `generateRevenueImpact(input): RevenueImpact | undefined`

Generates complete revenue impact object for a recommendation.

**Returns undefined when:**
- Weekly traffic is 0 or undefined
- All required pattern data is missing

**Always includes:**
- `calculationMethod`: Human-readable formula breakdown
- `timeToValidate`: Based on traffic volume

---

## ROI Calculator (`roi-calculator.ts`)

### Core Functions

#### `parseEffortEstimate(effort: string): number`

Converts effort strings to minutes.

**Patterns handled:**
- `"5 mins"`, `"5 minutes"` → 5
- `"1 hour"`, `"2 hours"` → 60, 120
- `"1 day"`, `"2 days"` → 480, 960 (8-hour day)
- `"1 week"`, `"2 weeks"` → 2400, 4800 (40-hour week)
- `"low"`, `"medium"`, `"high"` → 15, 45, 120

#### `calculateROI(impactScore, effortMinutes, timeToResultsWeeks): number`

Raw ROI calculation (unbounded).

```typescript
return impactScore / (effortMinutes * timeToResultsWeeks);
```

#### `normalizeROIScore(rawROI: number): number`

Converts raw ROI to 0-10 scale.

```typescript
// Logarithmic normalisation for better distribution
const normalised = Math.log10(rawROI + 0.1) * 3.33 + 6.67;
return Math.max(0, Math.min(10, normalised));
```

**Why logarithmic?** Raw ROI can vary by orders of magnitude (0.001 to 100+). Log scale makes scores comparable.

#### `categorizeROI(normalizedScore: number): ROICategory`

Maps scores to categories:
- ≥5.0 → `'quick-win'`
- 2.0-4.9 → `'strategic'`
- <2.0 → `'long-term'`

#### `calculateROIScore(input: CalculateROIScoreInput): ROIScore`

Complete ROI calculation with breakdown.

```typescript
interface CalculateROIScoreInput {
  priority: 'high' | 'medium' | 'low';
  effort: string;  // e.g., "30 mins" or "low"
  changeType?: ChangeType;
  timeToResultsWeeks?: number;
}
```

**Impact score mapping:**
- High → 10
- Medium → 5
- Low → 2

#### `inferChangeType(dimension: string): ChangeType`

Maps dimension to change type for time-to-results estimation.

```typescript
const mapping = {
  'contrast': 'ui',
  'cta': 'ui',
  'whitespace': 'ui',
  'typography': 'ui',
  'accessibility': 'accessibility',
  'performance': 'performance',
  'content': 'content',
  'layout': 'structural',
};
```

---

## Integration Points

### With Recommendation Engine

The recommendation generator calls these functions:

```typescript
// In recommendation-generator.ts
const roiScore = calculateROIScore({
  priority: recommendation.priority,
  effort: recommendation.effort,
  changeType: recommendation.changeType || inferChangeType(recommendation.dimension),
});

const revenueImpact = generateRevenueImpact({
  dimension: recommendation.dimension,
  weeklyTraffic: analysisInput.trafficData?.weeklyVisitors,
  averagePricing: analysisInput.businessData?.averagePrice || 29,
  patternStrength: matchedPattern?.strength || 75,
});
```

### With Report UI

The report page consumes these in `RecommendationCard`:

```typescript
// Show ROI category badge
const badge = getROIBadge(recommendation.roiScore.category);

// Format revenue
const formattedRevenue = formatRevenue(recommendation.revenueImpact.potentialRevenue);
```

---

## Testing

### Unit Tests Location

```
src/lib/analysis/utils/__tests__/
├── revenue-calculator.test.ts
└── roi-calculator.test.ts
```

### Test Scenarios

**Revenue Calculator:**
1. Standard calculation with all inputs
2. Zero traffic (returns undefined)
3. Different confidence levels
4. Edge cases (very high/low traffic)

**ROI Calculator:**
1. Effort parsing (all formats)
2. ROI calculation (known values)
3. Normalisation bounds (0-10)
4. Category boundaries

### Mock Data

```typescript
// Example test recommendation
const testRecommendation = {
  id: 'test-1',
  dimension: 'cta',
  priority: 'high' as const,
  title: 'Increase CTA button size',
  description: 'Make the primary CTA more prominent',
  impact: 'Improved click-through rate',
  effort: '30 mins',
  changeType: 'ui' as const,
};
```

---

## Common Issues & Solutions

### Issue: Revenue returning undefined

**Cause:** Missing traffic data
**Solution:** Check `weeklyTraffic` is provided and > 0

### Issue: ROI scores all similar

**Cause:** Not enough variation in effort/priority
**Solution:** Ensure effort strings are parsed correctly, verify priority values

### Issue: Confidence always "low"

**Cause:** Pattern quality data missing
**Solution:** Check pattern loader is providing `sampleSize` and `qualityScore`

---

## Adding New Dimensions

1. Add benchmark to `IMPROVEMENT_BENCHMARKS` in `revenue-calculator.ts`
2. Add change type mapping in `roi-calculator.ts`
3. Update tests
4. Update user documentation

```typescript
// revenue-calculator.ts
const IMPROVEMENT_BENCHMARKS = {
  // ...existing
  'newDimension': { min: X, max: Y },
};

// roi-calculator.ts  
const changeTypeMapping = {
  // ...existing
  'newDimension': 'ui' | 'content' | etc,
};
```

---

## Performance Considerations

- Revenue calculations are CPU-bound, not async
- Typically <1ms per calculation
- Batch processing recommended for large sets
- Consider memoisation if called repeatedly with same inputs

---

## Future Improvements

- [ ] A/B test result ingestion for calibrating benchmarks
- [ ] Industry-specific benchmark sets
- [ ] Confidence intervals instead of point estimates
- [ ] Historical tracking of prediction accuracy

---

*Last Updated: November 2025*

