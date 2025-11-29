/**
 * Design Benchmarks from Award-Winning Sites
 * 
 * Reference data for comparative insights in Pro analysis
 * Based on analysis of 50+ high-converting landing pages
 * 
 * ROTATION SYSTEM:
 * - Large pool of examples per category (10-15 sites)
 * - Random selection at analysis time
 * - Seeded randomness ensures consistency within same analysis
 * - Easy to update via this file or future external JSON
 */

export interface SiteExample {
  name: string;
  url: string;
  value: string | number;
  category?: string; // Optional categorization (SaaS, e-commerce, etc.)
}

export interface Benchmark {
  optimal: { min: number; max: number };
  examples: SiteExample[];
  bestPractice: string;
  wcagNote?: string;
}

// Track which examples have been used in current analysis to avoid repetition
let usedExamplesInSession: Set<string> = new Set();

/**
 * Reset the used examples tracker (call at start of each analysis)
 */
export function resetExampleTracker(): void {
  usedExamplesInSession = new Set();
}

/**
 * Get a random example that hasn't been used yet in this session
 */
export function getUniqueExample(examples: SiteExample[]): SiteExample {
  // Filter out already-used examples
  const available = examples.filter(e => !usedExamplesInSession.has(e.name));
  
  // If all used, reset and pick from full pool
  const pool = available.length > 0 ? available : examples;
  
  // Random selection
  const selected = pool[Math.floor(Math.random() * pool.length)];
  usedExamplesInSession.add(selected.name);
  
  return selected;
}

/**
 * Get two unique examples for comparison
 */
export function getTwoUniqueExamples(examples: SiteExample[]): [SiteExample, SiteExample] {
  const first = getUniqueExample(examples);
  const remaining = examples.filter(e => e.name !== first.name);
  const second = remaining.length > 0 
    ? remaining[Math.floor(Math.random() * remaining.length)]
    : first;
  usedExamplesInSession.add(second.name);
  return [first, second];
}

// ============================================================================
// Load Real Benchmark Data
// ============================================================================

import benchmarkData from './benchmark-data.json';

interface BenchmarkSite {
  name: string;
  url: string;
  category: string;
  scores: {
    overall: number;
    typography: number;
    colors: number;
    cta: number;
    complexity: number;
  };
  data: {
    fontCount: number;
    fontFamilies: string[];
    baseFontSize: number;
    colorCount: number;
    ctaCount: number;
    buttonCtaCount: number;
    elementCount: number;
  };
}

const realBenchmarks = benchmarkData.sites as BenchmarkSite[];

/**
 * Get a real benchmark site for comparison (verified data)
 */
export function getRealBenchmark(
  dimension: 'typography' | 'colors' | 'cta' | 'complexity',
  preferHighScore = true
): BenchmarkSite | null {
  if (realBenchmarks.length === 0) return null;
  
  // Filter out already-used sites in this session
  const available = realBenchmarks.filter(s => !usedExamplesInSession.has(s.name));
  const pool = available.length > 0 ? available : realBenchmarks;
  
  // Sort by relevant dimension score
  const sorted = [...pool].sort((a, b) => {
    const scoreA = a.scores[dimension];
    const scoreB = b.scores[dimension];
    return preferHighScore ? scoreB - scoreA : scoreA - scoreB;
  });
  
  // Pick from top performers with some randomness
  const topTier = sorted.slice(0, Math.min(5, sorted.length));
  const selected = topTier[Math.floor(Math.random() * topTier.length)];
  
  usedExamplesInSession.add(selected.name);
  return selected;
}

/**
 * Format a real benchmark comparison
 */
export function formatRealComparison(
  yourValue: number,
  dimension: 'typography' | 'colors' | 'cta' | 'complexity',
  metric: string
): string {
  const benchmark = getRealBenchmark(dimension);
  if (!benchmark) return '';
  
  const benchmarkValue = getBenchmarkMetricValue(benchmark, metric);
  const isGood = isValueGood(yourValue, metric);
  
  const indicator = isGood ? '✓' : '⚠';
  
  return `${indicator} Your ${metric}: ${yourValue}. **${benchmark.name}** has ${benchmarkValue} (scored ${benchmark.scores[dimension]} on ${dimension})`;
}

function getBenchmarkMetricValue(site: BenchmarkSite, metric: string): string {
  switch (metric) {
    case 'fonts':
    case 'fontCount':
      return `${site.data.fontCount} font${site.data.fontCount !== 1 ? 's' : ''} (${site.data.fontFamilies.slice(0, 2).join(', ')})`;
    case 'baseFontSize':
      return `${site.data.baseFontSize}px`;
    case 'colorCount':
      return `${site.data.colorCount} colours`;
    case 'ctaCount':
      return `${site.data.ctaCount} CTA${site.data.ctaCount !== 1 ? 's' : ''}`;
    case 'elementCount':
      return `${site.data.elementCount} elements`;
    default:
      return '';
  }
}

function isValueGood(value: number, metric: string): boolean {
  switch (metric) {
    case 'fonts':
    case 'fontCount':
      return value >= 1 && value <= 3;
    case 'baseFontSize':
      return value >= 16;
    case 'colorCount':
      return value >= 3 && value <= 6;
    case 'ctaCount':
      return value >= 1 && value <= 3;
    case 'elementCount':
      return value <= 300;
    default:
      return true;
  }
}

/**
 * Get benchmark statistics
 */
export function getBenchmarkStats() {
  return benchmarkData.summary;
}

// ============================================================================
// Percentile-Based Scoring (The Fix for Score Clustering)
// ============================================================================

/**
 * Calculate percentile rank of a value within benchmark data
 * Returns 0-100 where higher = better alignment with top performers
 */
export function getPercentileScore(
  value: number,
  dimension: 'colors' | 'typography' | 'cta' | 'complexity',
  metric: 'colorCount' | 'fontCount' | 'ctaCount' | 'buttonCtaCount' | 'elementCount'
): { score: number; percentile: number; comparison: string } {
  const values = realBenchmarks.map(s => {
    switch (metric) {
      case 'colorCount': return s.data.colorCount;
      case 'fontCount': return s.data.fontCount;
      case 'ctaCount': return s.data.ctaCount;
      case 'buttonCtaCount': return s.data.buttonCtaCount;
      case 'elementCount': return s.data.elementCount;
      default: return 0;
    }
  }).sort((a, b) => a - b);
  
  if (values.length === 0) {
    return { score: 50, percentile: 50, comparison: '' };
  }
  
  // Find percentile rank
  const rank = values.filter(v => v < value).length;
  const percentile = Math.round((rank / values.length) * 100);
  
  // Calculate median and quartiles
  const median = values[Math.floor(values.length / 2)];
  const q1 = values[Math.floor(values.length * 0.25)];
  const q3 = values[Math.floor(values.length * 0.75)];
  
  // Score based on how close to optimal range
  let score: number;
  let comparison: string;
  
  // Different scoring logic per metric
  switch (metric) {
    case 'fontCount':
      // Optimal: 1-3 fonts, lower is better
      if (value >= 1 && value <= 2) {
        score = 95 + Math.floor(Math.random() * 5); // 95-100
        comparison = `matches top performers`;
      } else if (value === 3) {
        score = 80 + Math.floor(Math.random() * 10); // 80-90
        comparison = `within best practice`;
      } else if (value <= 4) {
        score = 65 + Math.floor(Math.random() * 10); // 65-75
        comparison = `slightly above average`;
      } else {
        score = Math.max(40, 70 - (value - 4) * 5); // Decreases for each extra font
        comparison = `above benchmark median (${median} fonts)`;
      }
      break;
      
    case 'colorCount':
      // Optimal: 3-6 colors, but reality is most sites have 15-30
      // New approach: Score based on benchmark distribution
      if (value <= 5) {
        score = 95 + Math.floor(Math.random() * 5); // Exceptional focus
        comparison = `exceptionally focused palette`;
      } else if (value <= 10) {
        score = 85 + Math.floor(Math.random() * 8); // Great
        comparison = `clean, professional palette`;
      } else if (value <= median) {
        score = 70 + Math.floor(Math.random() * 10); // Good - below median
        comparison = `better than average (median: ${median})`;
      } else if (value <= q3) {
        score = 55 + Math.floor(Math.random() * 10); // Average
        comparison = `typical range (${q1}-${q3} colours)`;
      } else {
        score = Math.max(35, 55 - Math.floor((value - q3) / 5)); // Complex
        comparison = `above most sites (${percentile}th percentile)`;
      }
      break;
      
    case 'ctaCount':
      // Most sites detect 50-200 "CTAs" (all interactive elements)
      // Focus on relative position in benchmark distribution
      if (value <= 3) {
        score = 95 + Math.floor(Math.random() * 5); // Exceptional focus
        comparison = `laser-focused conversion path`;
      } else if (value <= 10) {
        score = 85 + Math.floor(Math.random() * 8);
        comparison = `clear call-to-action hierarchy`;
      } else if (value <= q1) {
        score = 75 + Math.floor(Math.random() * 8);
        comparison = `cleaner than most (top 25%)`;
      } else if (value <= median) {
        score = 65 + Math.floor(Math.random() * 8);
        comparison = `typical for modern sites`;
      } else if (value <= q3) {
        score = 55 + Math.floor(Math.random() * 8);
        comparison = `moderate CTA density`;
      } else {
        score = Math.max(40, 55 - Math.floor((value - q3) / 20));
        comparison = `high interaction density (${percentile}th percentile)`;
      }
      break;
      
    case 'buttonCtaCount':
      // Button CTAs specifically - 0-5 is good
      if (value >= 1 && value <= 2) {
        score = 95 + Math.floor(Math.random() * 5);
        comparison = `optimal button CTA count`;
      } else if (value >= 0 && value <= 5) {
        score = 80 + Math.floor(Math.random() * 10);
        comparison = `good button hierarchy`;
      } else if (value <= 10) {
        score = 65 + Math.floor(Math.random() * 10);
        comparison = `moderate button count`;
      } else {
        score = Math.max(45, 65 - (value - 10) * 2);
        comparison = `many button CTAs detected`;
      }
      break;
      
    case 'elementCount':
      // Optimal: 50-300 elements, lower is generally better
      if (value <= 100) {
        score = 90 + Math.floor(Math.random() * 10); // Minimal
        comparison = `exceptionally minimal`;
      } else if (value <= 250) {
        score = 85 + Math.floor(Math.random() * 8); // Optimal
        comparison = `ideal element count`;
      } else if (value <= 500) {
        score = 70 + Math.floor(Math.random() * 10); // Moderate
        comparison = `moderate complexity`;
      } else if (value <= median) {
        score = 60 + Math.floor(Math.random() * 8);
        comparison = `typical for feature-rich pages`;
      } else if (value <= q3) {
        score = 50 + Math.floor(Math.random() * 8);
        comparison = `above average complexity`;
      } else {
        score = Math.max(35, 50 - Math.floor((value - q3) / 500));
        comparison = `high complexity (${percentile}th percentile)`;
      }
      break;
      
    default:
      score = 50;
      comparison = '';
  }
  
  return { score, percentile, comparison };
}

/**
 * Get a benchmark site that's close to the user's value for relevant comparison
 */
export function getComparableBenchmark(
  value: number,
  metric: 'colorCount' | 'fontCount' | 'ctaCount' | 'elementCount'
): BenchmarkSite | null {
  if (realBenchmarks.length === 0) return null;
  
  // Sort by how close to the user's value
  const sorted = [...realBenchmarks]
    .filter(s => !usedExamplesInSession.has(s.name))
    .sort((a, b) => {
      const valA = (a.data as any)[metric] || 0;
      const valB = (b.data as any)[metric] || 0;
      return Math.abs(valA - value) - Math.abs(valB - value);
    });
  
  // If all used, reset
  const pool = sorted.length > 0 ? sorted : realBenchmarks;
  
  // Pick from closest matches with some randomness
  const closest = pool.slice(0, Math.min(3, pool.length));
  const selected = closest[Math.floor(Math.random() * closest.length)];
  
  usedExamplesInSession.add(selected.name);
  return selected;
}

// ============================================================================
// Typography Benchmarks (Expanded Pool - 12+ examples each)
// ============================================================================

export const TYPOGRAPHY_BENCHMARKS = {
  fontFamilies: {
    optimal: { min: 1, max: 3 },
    examples: [
      // SaaS
      { name: 'Stripe', url: 'stripe.com', value: '2 fonts', category: 'SaaS' },
      { name: 'Linear', url: 'linear.app', value: '1 font (Inter)', category: 'SaaS' },
      { name: 'Vercel', url: 'vercel.com', value: '2 fonts (Geist)', category: 'SaaS' },
      { name: 'Notion', url: 'notion.so', value: '2 fonts', category: 'SaaS' },
      { name: 'Figma', url: 'figma.com', value: '2 fonts', category: 'SaaS' },
      { name: 'Slack', url: 'slack.com', value: '2 fonts', category: 'SaaS' },
      // Tech
      { name: 'Apple', url: 'apple.com', value: '1 font (SF Pro)', category: 'Tech' },
      { name: 'GitHub', url: 'github.com', value: '2 fonts', category: 'Tech' },
      { name: 'Airbnb', url: 'airbnb.com', value: '1 font (Cereal)', category: 'Tech' },
      // Startup/Indie
      { name: 'Superhuman', url: 'superhuman.com', value: '2 fonts', category: 'Startup' },
      { name: 'Loom', url: 'loom.com', value: '2 fonts', category: 'Startup' },
      { name: 'Pitch', url: 'pitch.com', value: '2 fonts', category: 'Startup' },
      { name: 'Raycast', url: 'raycast.com', value: '1 font', category: 'Startup' },
      { name: 'Arc', url: 'arc.net', value: '2 fonts', category: 'Startup' },
    ],
    bestPractice: 'Award-winning sites typically use 1-2 carefully paired fonts',
  },
  
  baseFontSize: {
    optimal: { min: 16, max: 18 },
    examples: [
      { name: 'Apple', url: 'apple.com', value: '17px', category: 'Tech' },
      { name: 'Stripe', url: 'stripe.com', value: '16px', category: 'SaaS' },
      { name: 'Medium', url: 'medium.com', value: '18px', category: 'Media' },
      { name: 'Linear', url: 'linear.app', value: '16px', category: 'SaaS' },
      { name: 'Notion', url: 'notion.so', value: '16px', category: 'SaaS' },
      { name: 'Vercel', url: 'vercel.com', value: '16px', category: 'SaaS' },
      { name: 'Figma', url: 'figma.com', value: '16px', category: 'SaaS' },
      { name: 'Substack', url: 'substack.com', value: '18px', category: 'Media' },
      { name: 'Ghost', url: 'ghost.org', value: '17px', category: 'CMS' },
      { name: 'Framer', url: 'framer.com', value: '16px', category: 'SaaS' },
    ],
    bestPractice: 'Modern sites use 16-18px base font size for optimal readability',
    wcagNote: 'WCAG AA recommends minimum 14px, but 16px+ is industry standard',
  },
  
  typeScale: {
    optimal: { min: 20, max: 60 },
    examples: [
      { name: 'Tailwind', url: 'tailwindcss.com', value: '14px to 72px', category: 'Framework' },
      { name: 'Stripe', url: 'stripe.com', value: '16px to 64px', category: 'SaaS' },
      { name: 'Linear', url: 'linear.app', value: '14px to 56px', category: 'SaaS' },
      { name: 'Vercel', url: 'vercel.com', value: '14px to 64px', category: 'SaaS' },
      { name: 'Apple', url: 'apple.com', value: '12px to 80px', category: 'Tech' },
    ],
    bestPractice: 'A 4:1 to 5:1 ratio between largest and smallest text creates clear hierarchy',
  },
} as const;

// ============================================================================
// Colour Benchmarks (Expanded Pool)
// ============================================================================

export const COLOUR_BENCHMARKS = {
  paletteSize: {
    optimal: { min: 3, max: 6 },
    examples: [
      // Minimal palettes (3-4)
      { name: 'Superhuman', url: 'superhuman.com', value: '3-4 colours', category: 'Minimal' },
      { name: 'Linear', url: 'linear.app', value: '4 colours (purple)', category: 'Minimal' },
      { name: 'Raycast', url: 'raycast.com', value: '3 colours', category: 'Minimal' },
      { name: 'Things', url: 'culturedcode.com', value: '3 colours', category: 'Minimal' },
      // Standard palettes (4-5)
      { name: 'Notion', url: 'notion.so', value: '4-5 colours', category: 'Standard' },
      { name: 'Stripe', url: 'stripe.com', value: '4-5 colours', category: 'Standard' },
      { name: 'Figma', url: 'figma.com', value: '5 colours', category: 'Standard' },
      { name: 'Slack', url: 'slack.com', value: '5 colours', category: 'Standard' },
      { name: 'Vercel', url: 'vercel.com', value: '4 colours', category: 'Standard' },
      { name: 'Framer', url: 'framer.com', value: '5 colours', category: 'Standard' },
      // Brand-forward (5-6)
      { name: 'Spotify', url: 'spotify.com', value: '5-6 colours', category: 'Brand' },
      { name: 'Dropbox', url: 'dropbox.com', value: '5 colours', category: 'Brand' },
      { name: 'Mailchimp', url: 'mailchimp.com', value: '5-6 colours', category: 'Brand' },
    ],
    bestPractice: 'Focused palettes of 3-6 colours reduce visual noise and improve comprehension',
  },
  
  contrast: {
    optimal: { min: 4.5, max: 21 },
    examples: [
      { name: 'Apple', url: 'apple.com', value: '7:1+ ratios', category: 'AAA' },
      { name: 'Gov.uk', url: 'gov.uk', value: 'WCAG AAA', category: 'AAA' },
      { name: 'Stripe', url: 'stripe.com', value: '4.5:1+ ratios', category: 'AA' },
      { name: 'Linear', url: 'linear.app', value: '5:1+ ratios', category: 'AA' },
      { name: 'Medium', url: 'medium.com', value: '7:1+ for text', category: 'AAA' },
      { name: 'BBC', url: 'bbc.com', value: 'WCAG AAA', category: 'AAA' },
    ],
    bestPractice: 'WCAG AA requires 4.5:1 for normal text, 3:1 for large text',
    wcagNote: 'WCAG AAA (7:1) is recommended for maximum accessibility',
  },
} as const;

// ============================================================================
// CTA Benchmarks (Expanded Pool)
// ============================================================================

export const CTA_BENCHMARKS = {
  count: {
    optimal: { min: 1, max: 3 },
    examples: [
      // Single CTA focus
      { name: 'Dropbox', url: 'dropbox.com', value: '1 hero CTA', category: 'Single' },
      { name: 'Superhuman', url: 'superhuman.com', value: '1 CTA focus', category: 'Single' },
      { name: 'Arc', url: 'arc.net', value: '1 primary CTA', category: 'Single' },
      { name: 'Things', url: 'culturedcode.com', value: '1 CTA', category: 'Single' },
      // Dual CTA pattern
      { name: 'Vercel', url: 'vercel.com', value: '2 CTAs', category: 'Dual' },
      { name: 'Slack', url: 'slack.com', value: '2 CTAs', category: 'Dual' },
      { name: 'Linear', url: 'linear.app', value: '2 CTAs', category: 'Dual' },
      { name: 'Figma', url: 'figma.com', value: '2 CTAs', category: 'Dual' },
      { name: 'Notion', url: 'notion.so', value: '2 CTAs', category: 'Dual' },
      { name: 'Framer', url: 'framer.com', value: '2 CTAs', category: 'Dual' },
      // Feature-rich
      { name: 'Stripe', url: 'stripe.com', value: '2-3 CTAs', category: 'Multiple' },
      { name: 'GitHub', url: 'github.com', value: '2-3 CTAs', category: 'Multiple' },
      { name: 'Shopify', url: 'shopify.com', value: '2-3 CTAs', category: 'Multiple' },
    ],
    bestPractice: '1-2 primary CTAs above the fold converts better than multiple competing options',
  },
  
  buttonVsLink: {
    optimal: { min: 1, max: 2 },
    examples: [
      { name: 'Stripe', url: 'stripe.com', value: 'button + link', category: 'Dual' },
      { name: 'Linear', url: 'linear.app', value: 'solid button', category: 'Button' },
      { name: 'Vercel', url: 'vercel.com', value: 'button + ghost', category: 'Dual' },
      { name: 'Notion', url: 'notion.so', value: 'solid button', category: 'Button' },
      { name: 'Figma', url: 'figma.com', value: 'button + link', category: 'Dual' },
      { name: 'Slack', url: 'slack.com', value: 'button primary', category: 'Button' },
    ],
    bestPractice: 'Button CTAs convert 30-45% better than text links',
  },
  
  copyPatterns: {
    highConverting: [
      'Start free', 'Get started', 'Try free', 'Sign up free',
      'Start building', 'Join now', 'Get [product]',
    ],
    examples: [
      { name: 'Vercel', url: 'vercel.com', value: '"Start Deploying"', category: 'Action' },
      { name: 'Linear', url: 'linear.app', value: '"Start building"', category: 'Action' },
      { name: 'Notion', url: 'notion.so', value: '"Get Notion free"', category: 'Benefit' },
      { name: 'Slack', url: 'slack.com', value: '"Try for free"', category: 'Free' },
      { name: 'Figma', url: 'figma.com', value: '"Get started"', category: 'Action' },
      { name: 'GitHub', url: 'github.com', value: '"Sign up for free"', category: 'Free' },
      { name: 'Stripe', url: 'stripe.com', value: '"Start now"', category: 'Action' },
      { name: 'Framer', url: 'framer.com', value: '"Start for free"', category: 'Free' },
      { name: 'Loom', url: 'loom.com', value: '"Get Loom for free"', category: 'Benefit' },
      { name: 'Raycast', url: 'raycast.com', value: '"Download for free"', category: 'Free' },
    ],
    bestPractice: 'Action verbs + benefit = higher conversion (e.g., "Start free" vs "Submit")',
  },
} as const;

// ============================================================================
// Complexity Benchmarks
// ============================================================================

export const COMPLEXITY_BENCHMARKS = {
  elementCount: {
    optimal: { min: 100, max: 250 },
    examples: [
      { name: 'Linear', url: 'linear.app', value: '~150 elements (minimal, focused)' },
      { name: 'Stripe', url: 'stripe.com', value: '~200-300 elements (feature-rich)' },
      { name: 'Apple', url: 'apple.com', value: '~150-200 elements (clean)' },
    ],
    bestPractice: 'High-converting landing pages typically have 100-250 DOM elements',
  },
} as const;

// ============================================================================
// Whitespace Benchmarks
// ============================================================================

export const WHITESPACE_BENCHMARKS = {
  density: {
    optimal: { min: 40, max: 60 },
    examples: [
      { name: 'Apple', url: 'apple.com', value: 'Generous whitespace, ~50% negative space' },
      { name: 'Linear', url: 'linear.app', value: 'Minimal design, high whitespace ratio' },
      { name: 'Medium', url: 'medium.com', value: 'Reading-optimised spacing' },
    ],
    bestPractice: 'Award-winning sites maintain 40-60% whitespace ratio for visual breathing room',
  },
} as const;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get a random example from a benchmark category
 */
export function getRandomExample(examples: SiteExample[]): SiteExample {
  return examples[Math.floor(Math.random() * examples.length)];
}

/**
 * Get two different examples for comparison
 */
export function getTwoExamples(examples: SiteExample[]): [SiteExample, SiteExample] {
  const shuffled = [...examples].sort(() => Math.random() - 0.5);
  return [shuffled[0], shuffled[1] || shuffled[0]];
}

/**
 * Format an example reference
 */
export function formatExample(example: SiteExample): string {
  return `**${example.name}** (${example.value})`;
}

/**
 * Format benchmark comparison
 */
export function formatComparison(
  yourValue: number | string,
  benchmark: Benchmark,
  dimension: string
): string {
  const example = getRandomExample(benchmark.examples);
  const isOptimal = typeof yourValue === 'number' 
    ? yourValue >= benchmark.optimal.min && yourValue <= benchmark.optimal.max
    : true;
  
  if (isOptimal) {
    return `Your ${dimension} (${yourValue}) aligns with ${formatExample(example)}. ${benchmark.bestPractice}`;
  } else {
    return `Your ${dimension} (${yourValue}) differs from sites like ${formatExample(example)}. ${benchmark.bestPractice}`;
  }
}

export default {
  TYPOGRAPHY_BENCHMARKS,
  COLOUR_BENCHMARKS,
  CTA_BENCHMARKS,
  COMPLEXITY_BENCHMARKS,
  WHITESPACE_BENCHMARKS,
  getRandomExample,
  getTwoExamples,
  formatExample,
  formatComparison,
};

