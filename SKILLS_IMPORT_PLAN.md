# Skills Import Plan: portfolio-redesign → Pirouette

**Date:** November 23, 2025  
**Source:** `/Users/tomeldridge/portfolio-redesign`  
**Destination:** `/Users/tomeldridge/pirouette`  
**Status:** Ready for Import

---

## 🎯 Executive Summary

The **portfolio-redesign** project contains production-ready visual design analysis skills that are **core to Pirouette's MVP**. These skills provide the 7-dimensional design analysis engine that Pirouette will use to analyze landing pages.

**Key Finding:** The handoff document (`.taskmaster/docs/handoff.md`) explicitly mentions these skills must be copied as part of Phase 4.

---

## 📦 Skills to Import

### 1. **visual-design-analyzer.mjs** (6,185 lines) ⭐ CRITICAL
**Location:** `portfolio-redesign/.cursor/skills/visual-design-analyzer.mjs`  
**Purpose:** Core 7-dimensional design analysis engine

**Capabilities:**
- ✅ Color scheme extraction and analysis
- ✅ WCAG contrast validation (AAA/AA compliance)
- ✅ Typography pattern detection
- ✅ Whitespace analysis
- ✅ Visual hierarchy assessment
- ✅ Layout pattern recognition
- ✅ CTA prominence scoring

**Dependencies:**
- `contrast-validator.mjs` (imported)
- Playwright for browser automation
- Industry pattern library (see below)

**Adaptation Required:**
- Convert from `.mjs` ES modules to TypeScript
- Replace file system paths with Supabase Storage
- Adapt for Next.js API routes instead of CLI execution
- Update imports for Railway deployment

---

### 2. **page-quality-auditor.mjs** (1,511 lines) ⭐ IMPORTANT
**Location:** `portfolio-redesign/.cursor/skills/page-quality-auditor.mjs`  
**Purpose:** Master orchestrator that combines 7 specialized skills

**Capabilities:**
- Visual design analysis (7 dimensions + pattern matching)
- Typography analysis
- Broken links detection
- UX pattern analysis
- Layout consistency checking
- Conversion optimization
- Variant parity checking

**Dependencies:**
- `best-practices-curator.mjs`
- `audit-history-tracker.mjs`
- `page-type-detector.mjs`
- `accessibility-validator.mjs`
- `code-examples-library.mjs`
- `variant-parity-checker.mjs`

**Adaptation Required:**
- Extract core analysis logic (don't need full orchestrator)
- Focus on the 7-dimension analysis
- Integrate with Railway job queue
- Remove CLI-specific code

---

### 3. **contrast-validator.mjs** (828 lines) ⭐ IMPORTANT
**Location:** `portfolio-redesign/.cursor/skills/contrast-validator.mjs`  
**Purpose:** Context-aware WCAG contrast validation

**Capabilities:**
- Real computed color detection (not just palette)
- Context-aware background analysis
- Specific CSS fix recommendations
- Interactive state validation

**Dependencies:**
- Playwright (chromium)

**Adaptation Required:**
- TypeScript conversion
- Integration with visual-design-analyzer

---

### 4. **landing-page-advisor.mjs** (802 lines) 📊 REFERENCE
**Location:** `portfolio-redesign/.cursor/skills/landing-page-advisor.mjs`  
**Purpose:** Competitive research and pattern extraction

**Note:** This skill is used for *creating* pattern libraries by crawling competitors. For Pirouette MVP, we'll use the **existing pattern library** rather than recreating the crawler. Consider importing this for **Phase 2** (pattern refresh automation).

---

### 5. **typography-analyzer.mjs** (881 lines) 📊 USEFUL
**Location:** `portfolio-redesign/.cursor/skills/typography-analyzer.mjs`  
**Purpose:** Typography hierarchy and readability analysis

**Capabilities:**
- Font size hierarchy detection
- Line height/spacing analysis
- Readability scoring
- Type scale recommendations

**Adaptation Required:**
- TypeScript conversion
- Integration with main analyzer

---

## 📊 Pattern Library Data

### **pattern-learning.json** (2,258 lines) ⭐ CRITICAL
**Location:** `portfolio-redesign/docs/visual-design-audits/2025-11-21/pattern-learning.json`  
**Purpose:** Industry design pattern database (55 designs analyzed)

**Contents:**
```json
{
  "meta": {
    "sources": ["dribbble", "awwwards", "siteinspire", "behance"],
    "shotsAnalyzed": 120,
    "designsExtracted": 55,
    "patternsGenerated": {
      "colors": 4,
      "whitespace": 4,
      "complexity": 2,
      "imageText": 1,
      "typography": 1,
      "layout": 6,
      "ctaProminence": 4,
      "hierarchy": 3,
      "total": 25
    }
  },
  "patterns": {
    "colors": [...],
    "whitespace": [...],
    "complexity": [...],
    "imageText": [...],
    "typography": [...],
    "layout": [...],
    "ctaProminence": [...],
    "hierarchy": [...]
  }
}
```

**Each Pattern Includes:**
- Pattern ID and name
- Color values (hex, RGB)
- Prevalence percentage
- Real-world examples
- Quality scores
- Source attribution

**Adaptation Required:**
- Import into Supabase `patterns` table
- Add version tracking
- Create API for pattern retrieval

---

## 🏗️ Recommended Import Structure

```
pirouette/
├── src/
│   └── lib/
│       └── analysis/
│           ├── core/
│           │   ├── visual-design-analyzer.ts    # Main analyzer (converted from .mjs)
│           │   ├── contrast-validator.ts        # WCAG validation
│           │   ├── typography-analyzer.ts       # Typography analysis
│           │   └── types.ts                     # TypeScript types
│           ├── patterns/
│           │   ├── pattern-loader.ts            # Load from Supabase
│           │   ├── pattern-matcher.ts           # Matching algorithms
│           │   └── seed-patterns.ts             # Initial pattern seeding
│           ├── utils/
│           │   ├── color-utils.ts               # Color calculations
│           │   ├── screenshot-capture.ts        # Playwright wrapper
│           │   └── report-generator.ts          # Format results
│           └── index.ts                         # Public API
├── railway/
│   ├── analyzer.js                              # Railway worker (uses lib/analysis)
│   └── ...
└── migrations/
    └── 002_seed_patterns.sql                    # Pattern library import
```

---

## 🔄 Adaptation Strategy

### Phase 1: Direct Copy (Day 2)
1. **Copy Skills:**
   ```bash
   # From portfolio-redesign to pirouette
   cp portfolio-redesign/.cursor/skills/visual-design-analyzer.mjs \
      pirouette/src/lib/analysis/core/visual-design-analyzer.ts
   
   cp portfolio-redesign/.cursor/skills/contrast-validator.mjs \
      pirouette/src/lib/analysis/core/contrast-validator.ts
   
   cp portfolio-redesign/.cursor/skills/typography-analyzer.mjs \
      pirouette/src/lib/analysis/core/typography-analyzer.ts
   ```

2. **Copy Pattern Library:**
   ```bash
   cp portfolio-redesign/docs/visual-design-audits/2025-11-21/pattern-learning.json \
      pirouette/src/lib/analysis/patterns/default-patterns.json
   ```

### Phase 2: TypeScript Conversion (Day 2-3)
For each `.mjs` file:
1. Rename `.mjs` → `.ts`
2. Add TypeScript types
3. Convert `import` statements
4. Add type definitions for Playwright
5. Replace `export const skill = {...}` with proper exports

### Phase 3: Next.js/Railway Integration (Day 3)
1. **Remove CLI-specific code:**
   - File system writes → Supabase Storage
   - Command-line args → function parameters
   - Console logs → structured logging

2. **Add Railway-specific code:**
   - Job queue integration (BullMQ)
   - Progress reporting to Supabase
   - Error handling and retries

3. **Update file paths:**
   ```typescript
   // BEFORE (portfolio-redesign):
   const reportDir = 'docs/visual-design-audits';
   
   // AFTER (pirouette):
   const reportDir = '/tmp/analysis-reports'; // Railway ephemeral
   // Then upload to Supabase Storage
   ```

### Phase 4: Pattern Library Migration (Day 3)
Create migration script to seed Supabase:

```typescript
// migrations/002_seed_patterns.sql
-- Import patterns from JSON to Supabase

-- Create seed_patterns function
CREATE OR REPLACE FUNCTION seed_initial_patterns()
RETURNS void AS $$
BEGIN
  -- Insert color patterns
  INSERT INTO patterns (dimension, pattern_data, source, designs_analyzed, prevalence, version)
  VALUES 
    ('colors', '{"id":"pattern-6","name":"Neutral Gray",...}', 'portfolio-redesign', 55, 0.20, '1.0'),
    -- ... more patterns
  
  -- Insert whitespace patterns
  -- Insert complexity patterns
  -- etc.
END;
$$ LANGUAGE plpgsql;

-- Execute seeding
SELECT seed_initial_patterns();
```

---

## ✅ Import Checklist

### Pre-Import
- [x] Identify all skills to import
- [x] Review dependencies
- [x] Plan directory structure
- [ ] Create `src/lib/analysis/` directory
- [ ] Set up TypeScript types

### Core Files
- [ ] Copy `visual-design-analyzer.mjs` → `.ts`
- [ ] Copy `contrast-validator.mjs` → `.ts`
- [ ] Copy `typography-analyzer.mjs` → `.ts`
- [ ] Copy `pattern-learning.json`

### Adaptation
- [ ] Convert to TypeScript
- [ ] Add type definitions
- [ ] Update imports
- [ ] Replace file paths
- [ ] Add Supabase integration
- [ ] Add Railway job queue integration

### Pattern Library
- [ ] Create pattern loader
- [ ] Create Supabase migration
- [ ] Seed patterns table
- [ ] Test pattern retrieval

### Integration
- [ ] Create Railway worker integration
- [ ] Test end-to-end analysis flow
- [ ] Verify screenshots save to Supabase
- [ ] Verify reports save correctly

### Testing
- [ ] Test with sample landing page
- [ ] Verify all 7 dimensions analyzed
- [ ] Confirm pattern matching works
- [ ] Validate contrast checks work
- [ ] Test typography analysis

---

## 📝 Notes from Handoff Document

From `.taskmaster/docs/handoff.md`, Phase 4:

> **Phase 4: Copy Analysis Skills (Day 2)**
> 
> **Source:** `portfolio-redesign/.cursor/skills/`  
> **Destination:** `pirouette/lib/analysis/`
> 
> **Files to Copy:**
> 
> 1. **visual-design-analyzer.mjs** (6,122 lines)
>    - Core analysis engine
>    - Pattern matching
>    - 7-dimensional analysis
> 
> 2. **Pattern Library Data**
>    - Copy latest pattern report from: `portfolio-redesign/docs/visual-design-audits/[latest]/pattern-learning.json`
>    - Destination: `pirouette/lib/analysis/patterns/default-patterns.json`

**Note:** The handoff references 6,122 lines, actual file is 6,185 lines (minor difference, file has been updated since handoff was written).

---

## 🎯 Next Steps

1. **Immediate (Today):**
   - Create directory structure
   - Copy core files
   - Begin TypeScript conversion

2. **This Week:**
   - Complete adaptations
   - Seed pattern library
   - Integrate with Railway

3. **Testing:**
   - Run analysis on test landing pages
   - Validate against known good designs
   - Compare results with portfolio-redesign output

---

## 💰 Value Proposition

**Why These Skills are Critical:**

1. **Proven Technology:** Already working in production on portfolio-redesign
2. **Complete Solution:** All 7 dimensions already implemented
3. **Pattern Library:** 55 real designs analyzed from premium sources
4. **Time Savings:** ~3-4 weeks of development work already done
5. **Quality:** 6,000+ lines of battle-tested code

**Alternative:** Building from scratch would require:
- Research phase: 1 week
- Core algorithm dev: 2 weeks
- Pattern library creation: 1 week
- Testing & refinement: 1 week
- **Total:** 5 weeks → **Import saves 4+ weeks of work**

---

## ⚠️ Dependencies to Install (Railway)

Add to `railway/package.json`:

```json
{
  "dependencies": {
    "playwright": "^1.40.0",  // Already planned
    "@supabase/supabase-js": "^2.38.0",  // Already planned
    "sharp": "^0.33.0",  // Image processing (screenshots)
    "color": "^4.2.3",  // Color manipulation utilities
    "parse-color": "^2.1.0"  // Color parsing
  }
}
```

Add to `src/package.json` (if needed for frontend):

```json
{
  "devDependencies": {
    "@types/color": "^3.0.5"
  }
}
```

---

## 🎉 Expected Outcome

After import completion:

✅ **Pirouette will have:**
- Production-ready 7-dimensional analysis engine
- 25 industry design patterns from 55 real websites
- WCAG AAA/AA contrast validation
- Typography hierarchy analysis
- Pattern matching algorithms
- Screenshot capture capabilities
- Comprehensive reporting system

✅ **Tasks Completed:**
- Task 7: Implement Playwright analyzer ✅ (mostly done)
- Task 8: Create pattern library ✅ (already exists)
- Task 9: Implement recommendations ✅ (built into analyzer)

**This import accelerates the MVP timeline by ~4 weeks.**

---

**Ready to proceed with import? Let me know and I'll begin copying and adapting the skills!** 🚀




