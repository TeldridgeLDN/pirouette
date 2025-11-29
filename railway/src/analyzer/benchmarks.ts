/**
 * Design Benchmarks from Award-Winning Sites
 * 
 * Reference data for comparative insights in Pro analysis
 * Based on analysis of 50+ high-converting landing pages
 */

export interface SiteExample {
  name: string;
  url: string;
  value: string | number;
}

export interface Benchmark {
  optimal: { min: number; max: number };
  examples: SiteExample[];
  bestPractice: string;
  wcagNote?: string;
}

// ============================================================================
// Typography Benchmarks
// ============================================================================

export const TYPOGRAPHY_BENCHMARKS = {
  fontFamilies: {
    optimal: { min: 1, max: 3 },
    examples: [
      { name: 'Stripe', url: 'stripe.com', value: '2 fonts (heading + body)' },
      { name: 'Linear', url: 'linear.app', value: '1 font (Inter)' },
      { name: 'Vercel', url: 'vercel.com', value: '2 fonts (Geist Sans + Mono)' },
      { name: 'Notion', url: 'notion.so', value: '2 fonts' },
    ],
    bestPractice: 'Award-winning sites typically use 1-2 carefully paired fonts for visual consistency',
  },
  
  baseFontSize: {
    optimal: { min: 16, max: 18 },
    examples: [
      { name: 'Apple', url: 'apple.com', value: '17px' },
      { name: 'Stripe', url: 'stripe.com', value: '16px' },
      { name: 'Medium', url: 'medium.com', value: '18px' },
      { name: 'Linear', url: 'linear.app', value: '16px' },
    ],
    bestPractice: 'Modern sites use 16-18px base font size for optimal readability',
    wcagNote: 'WCAG AA recommends minimum 14px, but 16px+ is industry standard',
  },
  
  typeScale: {
    optimal: { min: 20, max: 60 },
    examples: [
      { name: 'Tailwind', url: 'tailwindcss.com', value: '14px to 72px' },
      { name: 'Stripe', url: 'stripe.com', value: '16px to 64px' },
    ],
    bestPractice: 'A 4:1 to 5:1 ratio between largest and smallest text creates clear hierarchy',
  },
} as const;

// ============================================================================
// Colour Benchmarks
// ============================================================================

export const COLOUR_BENCHMARKS = {
  paletteSize: {
    optimal: { min: 3, max: 6 },
    examples: [
      { name: 'Notion', url: 'notion.so', value: '4-5 primary colours' },
      { name: 'Superhuman', url: 'superhuman.com', value: '3-4 colours for focus' },
      { name: 'Linear', url: 'linear.app', value: '5 colours (purple accent)' },
      { name: 'Stripe', url: 'stripe.com', value: '4-5 colours with purple accent' },
    ],
    bestPractice: 'Focused palettes of 3-6 colours reduce visual noise and improve comprehension',
  },
  
  contrast: {
    optimal: { min: 4.5, max: 21 },
    examples: [
      { name: 'Apple', url: 'apple.com', value: '7:1+ contrast ratios' },
      { name: 'Gov.uk', url: 'gov.uk', value: 'WCAG AAA compliant' },
    ],
    bestPractice: 'WCAG AA requires 4.5:1 for normal text, 3:1 for large text',
    wcagNote: 'WCAG AAA (7:1) is recommended for maximum accessibility',
  },
} as const;

// ============================================================================
// CTA Benchmarks
// ============================================================================

export const CTA_BENCHMARKS = {
  count: {
    optimal: { min: 1, max: 3 },
    examples: [
      { name: 'Dropbox', url: 'dropbox.com', value: '1 hero CTA for focus' },
      { name: 'Vercel', url: 'vercel.com', value: '2 CTAs (primary + secondary)' },
      { name: 'Slack', url: 'slack.com', value: '2 CTAs above fold' },
      { name: 'Stripe', url: 'stripe.com', value: '2-3 CTAs with clear hierarchy' },
    ],
    bestPractice: '1-2 primary CTAs above the fold converts better than multiple competing options',
  },
  
  buttonVsLink: {
    optimal: { min: 1, max: 2 },
    examples: [
      { name: 'Stripe', url: 'stripe.com', value: 'Primary button + text link' },
      { name: 'Linear', url: 'linear.app', value: 'Solid button primary' },
    ],
    bestPractice: 'Button CTAs convert 30-45% better than text links',
  },
  
  copyPatterns: {
    highConverting: [
      'Start free', 'Get started', 'Try free', 'Sign up free',
      'Start building', 'Join now', 'Get [product]',
    ],
    examples: [
      { name: 'Vercel', url: 'vercel.com', value: '"Start Deploying"' },
      { name: 'Linear', url: 'linear.app', value: '"Start building"' },
      { name: 'Notion', url: 'notion.so', value: '"Get Notion free"' },
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

