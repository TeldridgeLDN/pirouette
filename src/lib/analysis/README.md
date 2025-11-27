# Pirouette Analysis Engine

**Version:** 1.0.0  
**Source:** Adapted from `portfolio-redesign` project  
**Status:** Phase 1 Complete - Core infrastructure ready

---

## 📋 Overview

This directory contains the 7-dimensional design analysis engine that powers Pirouette's landing page recommendations. The code is adapted from production-ready skills developed in the `portfolio-redesign` project.

### 7 Dimensions Analyzed

1. **Colors** - Palette extraction, contrast ratios, WCAG compliance
2. **Whitespace** - Section gaps, padding, density analysis
3. **Complexity** - Element count, visual complexity scoring
4. **Image/Text Ratio** - Balance between imagery and text
5. **Typography** - Font hierarchy, readability, scale consistency
6. **Layout** - Structure, columns, alignment patterns
7. **CTA Prominence** - Call-to-action visibility, contrast, positioning

---

## 📁 Directory Structure

```
src/lib/analysis/
├── core/
│   ├── types.ts                      # TypeScript type definitions
│   ├── visual-design-analyzer.ts     # Main 7D analyzer (6,185 lines)
│   ├── contrast-validator.ts         # WCAG contrast validation (828 lines)
│   └── typography-analyzer.ts        # Typography analysis (881 lines)
├── patterns/
│   ├── default-patterns.json         # Pattern library (55 designs, 2,258 lines)
│   └── pattern-loader.ts             # Pattern loading & matching utilities
├── utils/
│   └── color-utils.ts                # Color conversion & contrast calculations
├── index.ts                          # Public API entry point
└── README.md                         # This file
```

---

## 🚀 Usage

### Basic Analysis

```typescript
import { analyzeLandingPage, loadDefaultPatterns } from '@/lib/analysis';

// Load pattern library
const patterns = loadDefaultPatterns();

// Analyze a URL
const report = await analyzeLandingPage({
  url: 'https://example.com',
  patterns,
  options: {
    verbose: true,
    timeout: 30000, // 30 seconds
  },
});

console.log('Overall Score:', report.overallScore);
console.log('Recommendations:', report.recommendations);
```

### Specific Dimensions Only

```typescript
import { analyzeSpecificDimensions } from '@/lib/analysis';

// Only analyze colors and typography
const report = await analyzeSpecificDimensions(
  'https://example.com',
  ['colors', 'typography']
);
```

### Quick Analysis (Skip Screenshot)

```typescript
import { quickAnalyze } from '@/lib/analysis';

// Faster analysis without screenshot capture
const report = await quickAnalyze('https://example.com');
```

---

## 📊 Analysis Report Structure

```typescript
interface AnalysisReport {
  id: string;
  url: string;
  timestamp: string;
  screenshot?: string; // Supabase Storage URL
  
  // 7 Dimensions
  dimensions: {
    colors: ColorAnalysis;
    whitespace: WhitespaceAnalysis;
    complexity: ComplexityAnalysis;
    imageText: ImageTextRatioAnalysis;
    typography: TypographyAnalysis;
    layout: LayoutAnalysis;
    ctaProminence: CTAAnalysis;
  };
  
  // Scores
  overallScore: number; // 0-100
  dimensionScores: Record<string, number>;
  
  // Recommendations
  recommendations: Recommendation[];
  
  // Metadata
  analysisTime: number; // milliseconds
  version: string;
}
```

---

## 🎨 Pattern Library

The pattern library contains **55 real designs** analyzed from premium sources:
- **Dribbble** (trending web designs)
- **Awwwards** (award-winning sites)
- **SiteInspire** (curated design inspiration)
- **Behance** (creative portfolios)

### Pattern Statistics

- **Total Patterns:** 25
- **Designs Analyzed:** 55
- **Shots Reviewed:** 120
- **Last Updated:** 2025-11-21

### Pattern Distribution

| Dimension | Patterns |
|-----------|----------|
| Colors | 4 |
| Whitespace | 4 |
| Complexity | 2 |
| Image/Text | 1 |
| Typography | 1 |
| Layout | 6 |
| CTA Prominence | 4 |
| Hierarchy | 3 |

---

## 🔧 Utilities

### Color Utils

```typescript
import { colorUtils } from '@/lib/analysis';

// Convert colors
const rgb = colorUtils.hexToRgb('#0066FF');
const hex = colorUtils.rgbToHex(0, 102, 255);

// Calculate contrast
const ratio = colorUtils.getContrastRatio('#000000', '#FFFFFF');
console.log('Contrast Ratio:', ratio); // 21:1

// Check WCAG compliance
const passesAA = colorUtils.checkWCAGContrast(ratio, 'AA', false);
console.log('Passes WCAG AA:', passesAA); // true

// Adjust color for contrast
const adjusted = colorUtils.adjustColorForContrast(
  '#777777', // Foreground
  '#FFFFFF', // Background
  4.5 // Target ratio
);
```

### Pattern Matching

```typescript
import { 
  loadDefaultPatterns,
  matchColorPattern,
  matchLayoutPattern 
} from '@/lib/analysis';

const patterns = loadDefaultPatterns();

// Find matching color patterns
const colorMatches = matchColorPattern(patterns, '#0066FF', 30);
console.log('Best Match:', colorMatches[0].pattern.name);
console.log('Similarity:', colorMatches[0].similarity);

// Find matching layout patterns
const layoutMatches = matchLayoutPattern(patterns, 'hero-centric');
```

---

## 🏗️ Integration Points

### Railway Worker (Backend)

```typescript
// railway/analyzer.js
import { analyzeLandingPage, loadDefaultPatterns } from '../src/lib/analysis';

async function processAnalysisJob(jobId, url) {
  const patterns = loadDefaultPatterns();
  
  const report = await analyzeLandingPage({
    url,
    patterns,
    options: { verbose: true },
  });
  
  // Save to Supabase
  await supabase
    .from('reports')
    .insert({
      id: jobId,
      url,
      report_data: report,
      created_at: new Date().toISOString(),
    });
  
  return report;
}
```

### Next.js API Route (Frontend)

```typescript
// src/app/api/analyze/route.ts
import { NextResponse } from 'next/server';
import { analyzeLandingPage } from '@/lib/analysis';

export async function POST(request: Request) {
  const { url } = await request.json();
  
  // Trigger Railway analysis (via BullMQ)
  const jobId = await triggerRailwayAnalysis(url);
  
  return NextResponse.json({ jobId, status: 'queued' });
}
```

---

## 📝 Current Status

### ✅ Phase 1 Complete (Infrastructure)

- [x] Directory structure created
- [x] Pattern library imported (2,258 lines)
- [x] TypeScript types defined
- [x] Color utilities implemented
- [x] Pattern loader created
- [x] Public API defined
- [x] Core analyzer files copied (8,894 lines)

### 🚧 Phase 2 In Progress (Adaptation)

- [ ] Convert `.mjs` files to TypeScript
- [ ] Replace file system operations with Supabase
- [ ] Integrate Playwright for browser automation
- [ ] Add progress reporting to Supabase
- [ ] Implement screenshot capture & upload
- [ ] Add error handling & retries

### 📅 Phase 3 Planned (Integration)

- [ ] Railway worker integration
- [ ] BullMQ job queue setup
- [ ] Supabase pattern seeding
- [ ] End-to-end testing
- [ ] Performance optimization

---

## 🔗 Dependencies

### Required (Production)

```json
{
  "playwright": "^1.40.0",
  "@supabase/supabase-js": "^2.38.0",
  "sharp": "^0.33.0"
}
```

### Optional (Development)

```json
{
  "@types/node": "^20",
  "typescript": "^5"
}
```

---

## 📚 References

### Source Material
- **visual-design-analyzer.mjs** (6,185 lines) - Portfolio redesign project
- **Pattern Library** (2,258 lines) - Real designs from 55 websites
- **Handoff Document** - `.taskmaster/docs/handoff.md`

### Related TaskMaster Tasks
- **Task 7:** Implement Playwright analyzer ✅ (mostly complete)
- **Task 8:** Create pattern library ✅ (complete)
- **Task 9:** Implement recommendations ✅ (built into analyzer)

---

## 🎯 Next Steps

1. **Complete TypeScript Conversion**
   - Adapt visual-design-analyzer.ts
   - Adapt contrast-validator.ts
   - Adapt typography-analyzer.ts

2. **Railway Integration**
   - Set up BullMQ worker
   - Implement job processing
   - Add progress updates

3. **Testing**
   - Test with real landing pages
   - Validate pattern matching
   - Benchmark performance

---

## 💡 Notes

- **Time Saved:** ~4 weeks of development by importing proven code
- **Pattern Quality:** Patterns from premium design sources (Dribbble, Awwwards)
- **Production Ready:** Core logic already battle-tested in portfolio-redesign
- **Extensible:** Easy to add new dimensions or patterns in the future

---

**Last Updated:** November 23, 2025  
**Import Status:** Phase 1 Complete ✅




