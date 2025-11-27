# Pattern Library

The Pattern Library is a curated collection of design patterns extracted from 50+ award-winning landing pages from sources like Dribbble, Awwwards, and SiteInspire.

## Overview

The pattern library powers Pirouette's recommendation engine by providing:
- **Reference Patterns**: Proven design patterns from successful sites
- **Prevalence Scores**: How common each pattern is across award-winning sites
- **Pattern Matching**: Algorithms to compare user sites against best practices
- **Dimensioned Organization**: Patterns organized by the 7 analysis dimensions

## Architecture

### Files

- **`default-patterns.json`**: Core pattern library (55 designs, 25 patterns)
- **`pattern-loader.ts`**: Pattern loading and matching utilities
- **`seed-patterns.ts`**: Supabase seeding utility

### Data Flow

```
1. Default JSON Library
   └─> Load via loadDefaultPatterns()
   └─> OR Load from Supabase via loadPatternsFromSupabase()

2. Analysis Engine
   └─> Match user site against patterns
   └─> Calculate similarity scores
   └─> Generate recommendations

3. Pattern Updates (Future)
   └─> Railway cron job fetches new designs
   └─> Extracts patterns
   └─> Updates Supabase patterns table
   └─> Frontend uses updated patterns
```

## Pattern Dimensions

The library contains patterns across 7 dimensions:

### 1. Colors (4 patterns)
- **Neutral Gray**: Muted, professional gray tones
- **Bold Primary**: Vibrant accent colors with high contrast
- **Monochrome**: Black/white with minimal color
- **Dual-tone**: Two complementary primary colors

### 2. Whitespace (4 patterns)
- **Generous**: Ample breathing room, minimal density
- **Balanced**: Moderate spacing, comfortable density
- **Compact**: Tight spacing, higher density
- **Asymmetric**: Varied spacing for visual interest

### 3. Complexity (2 patterns)
- **Minimal**: Low element count, simple layouts
- **Rich**: Higher element count, detailed sections

### 4. Typography (1 pattern)
- **Modern Sans**: Clean, sans-serif fonts with strong hierarchy

### 5. Layout (6 patterns)
- **Hero-Left**: Left-aligned hero content
- **Hero-Center**: Center-aligned hero content
- **Split-Screen**: 50/50 content/image division
- **Grid-Based**: Modular grid layout
- **Single-Column**: Linear, single-column flow
- **Multi-Column**: Multiple columns for content organization

### 6. CTA Prominence (4 patterns)
- **High-Contrast**: Bold, contrasting CTA buttons
- **Above-Fold**: CTA visible without scrolling
- **Multiple-Placement**: CTAs repeated at strategic points
- **Sticky**: CTA follows user as they scroll

### 7. Hierarchy (3 patterns)
- **Strong**: Clear focal points, obvious priorities
- **Moderate**: Balanced hierarchy, even distribution
- **Subtle**: Nuanced hierarchy, less obvious priorities

## Usage

### Loading Patterns

```typescript
import { loadDefaultPatterns, loadPatternsFromSupabase } from '@/lib/analysis/patterns/pattern-loader';

// Load from default JSON (fast, always available)
const patterns = loadDefaultPatterns();

// Load from Supabase (production, updated patterns)
const patterns = await loadPatternsFromSupabase();
```

### Matching Patterns

```typescript
import { matchColorPattern, matchLayoutPattern } from '@/lib/analysis/patterns/pattern-loader';

// Match colors
const colorMatches = matchColorPattern(library, '#6E7C7D', 30);
// Returns: [{ pattern, similarity: 95 }, ...]

// Match layout
const layoutMatches = matchLayoutPattern(library, 'hero-center');
// Returns: [{ pattern, ... }, ...]
```

### Pattern Statistics

```typescript
import { getPatternStats } from '@/lib/analysis/patterns/pattern-loader';

const stats = getPatternStats(library);
// Returns: { totalPatterns: 25, designsAnalyzed: 55, sources: [...], ... }
```

## Seeding Supabase

To populate the Supabase `patterns` table with the default library:

### Via API (Recommended)

```bash
# POST request to seed patterns
curl -X POST http://localhost:3000/api/admin/seed-patterns

# GET request to check pattern stats
curl http://localhost:3000/api/admin/seed-patterns
```

### Via Script

```bash
# Run seeding script directly
ts-node src/lib/analysis/patterns/seed-patterns.ts
```

### Verification

After seeding, verify patterns in Supabase:

```sql
-- Check pattern counts by dimension
SELECT dimension, COUNT(*) as count
FROM patterns
GROUP BY dimension
ORDER BY count DESC;

-- Check pattern prevalence
SELECT dimension, AVG(prevalence) as avg_prevalence
FROM patterns
GROUP BY dimension;

-- View recent patterns
SELECT dimension, source, created_at
FROM patterns
ORDER BY created_at DESC
LIMIT 10;
```

## Pattern Matching Algorithm

### Color Matching

Uses RGB Euclidean distance to find similar colors:

```
distance = sqrt((r2-r1)² + (g2-g1)² + (b2-b1)²)
similarity = max(0, 100 - (distance/threshold) * 100)
```

- **Threshold**: 30 (default) - lower = stricter matching
- **Filter**: Only returns matches with >50% similarity
- **Sorting**: Sorted by similarity (descending)

### Whitespace Matching

Compares spacing characteristics:

```
score = (sectionGap match ? 33 : 0) +
        (contentPadding match ? 33 : 0) +
        (lineHeight match ? 34 : 0)
```

- **Exact Match**: Spacing values must match exactly
- **Partial Scores**: Returns partial matches
- **Sorting**: Sorted by score (descending)

### Layout Matching

String matching on layout structure:

```
matches if:
  - pattern.structure contains layoutStructure OR
  - layoutStructure contains pattern.structure
```

- **Case-Insensitive**: Matching ignores case
- **Sorting**: Sorted by prevalence (more common first)

### CTA Matching

Scores based on multiple characteristics:

```
score = (prominence match ? 33 : 0) +
        (contrast match ? 33 : 0) +
        (positioning match ? 34 : 0)
```

- **Multi-factor**: Considers 3 characteristics
- **Partial Matches**: Returns partial matches
- **Sorting**: Sorted by score (descending)

## Pattern Updates (Future)

The pattern library will be updated weekly via Railway cron jobs:

### Update Process

1. **Fetch**: Scrape new designs from sources (Dribbble API, Awwwards, etc.)
2. **Analyze**: Run analysis engine on new designs
3. **Extract**: Identify recurring patterns
4. **Calculate Prevalence**: Update prevalence scores
5. **Store**: Update Supabase `patterns` table
6. **Version**: Increment pattern version

### Versioning

Patterns use semantic versioning:
- **Major**: Breaking changes to pattern structure
- **Minor**: New patterns added
- **Patch**: Pattern data corrections

Current version: `1.0`

## Testing

### Unit Tests (Future)

```typescript
// Test color matching
expect(matchColorPattern(lib, '#6E7C7D', 30)).toHaveLength(4);

// Test whitespace matching
expect(matchWhitespacePattern(lib, { sectionGap: '64px' })).toBeDefined();

// Test layout matching
expect(matchLayoutPattern(lib, 'hero-center')).toHaveLength(1);
```

### Integration Tests (Future)

```typescript
// Test Supabase loading
const patterns = await loadPatternsFromSupabase();
expect(patterns.meta.patternsGenerated.total).toBeGreaterThan(0);

// Test seeding
const result = await seedPatternsToSupabase();
expect(result.success).toBe(true);
```

## Maintenance

### Adding New Patterns

1. Analyze new award-winning sites
2. Extract pattern characteristics
3. Add to `default-patterns.json`
4. Re-seed Supabase with updated patterns
5. Update version number

### Updating Existing Patterns

1. Modify pattern in `default-patterns.json`
2. Update prevalence scores if needed
3. Re-seed Supabase
4. Increment patch version

### Removing Obsolete Patterns

1. Mark as deprecated in `default-patterns.json`
2. Delete from Supabase (or mark as `archived`)
3. Increment minor version

## Performance

- **Default JSON**: ~2ms load time, synchronous
- **Supabase Load**: ~50-100ms, depends on network
- **Pattern Matching**: ~5-20ms per dimension
- **Seeding**: ~500-1000ms for all patterns

## Security

- **Supabase Patterns**: Public read access (no auth required)
- **Pattern Seeding**: Admin-only (requires auth - TODO)
- **Pattern Updates**: Service role only (Railway cron)

## References

- **Sources**: Dribbble, Awwwards, SiteInspire, Behance
- **Analysis Date**: 2025-11-21
- **Total Designs Analyzed**: 55
- **Total Patterns**: 25
- **Database Table**: `patterns`

---

*Part of Pirouette's data-driven design analysis engine*

