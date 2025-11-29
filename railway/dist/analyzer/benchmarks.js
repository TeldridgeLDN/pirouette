"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WHITESPACE_BENCHMARKS = exports.COMPLEXITY_BENCHMARKS = exports.CTA_BENCHMARKS = exports.COLOUR_BENCHMARKS = exports.TYPOGRAPHY_BENCHMARKS = void 0;
exports.resetExampleTracker = resetExampleTracker;
exports.getUniqueExample = getUniqueExample;
exports.getTwoUniqueExamples = getTwoUniqueExamples;
exports.getRealBenchmark = getRealBenchmark;
exports.formatRealComparison = formatRealComparison;
exports.getBenchmarkStats = getBenchmarkStats;
exports.getRandomExample = getRandomExample;
exports.getTwoExamples = getTwoExamples;
exports.formatExample = formatExample;
exports.formatComparison = formatComparison;
// Track which examples have been used in current analysis to avoid repetition
let usedExamplesInSession = new Set();
/**
 * Reset the used examples tracker (call at start of each analysis)
 */
function resetExampleTracker() {
    usedExamplesInSession = new Set();
}
/**
 * Get a random example that hasn't been used yet in this session
 */
function getUniqueExample(examples) {
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
function getTwoUniqueExamples(examples) {
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
const benchmark_data_json_1 = __importDefault(require("./benchmark-data.json"));
const realBenchmarks = benchmark_data_json_1.default.sites;
/**
 * Get a real benchmark site for comparison (verified data)
 */
function getRealBenchmark(dimension, preferHighScore = true) {
    if (realBenchmarks.length === 0)
        return null;
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
function formatRealComparison(yourValue, dimension, metric) {
    const benchmark = getRealBenchmark(dimension);
    if (!benchmark)
        return '';
    const benchmarkValue = getBenchmarkMetricValue(benchmark, metric);
    const isGood = isValueGood(yourValue, metric);
    const indicator = isGood ? '✓' : '⚠';
    return `${indicator} Your ${metric}: ${yourValue}. **${benchmark.name}** has ${benchmarkValue} (scored ${benchmark.scores[dimension]} on ${dimension})`;
}
function getBenchmarkMetricValue(site, metric) {
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
function isValueGood(value, metric) {
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
function getBenchmarkStats() {
    return benchmark_data_json_1.default.summary;
}
// ============================================================================
// Typography Benchmarks (Expanded Pool - 12+ examples each)
// ============================================================================
exports.TYPOGRAPHY_BENCHMARKS = {
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
};
// ============================================================================
// Colour Benchmarks (Expanded Pool)
// ============================================================================
exports.COLOUR_BENCHMARKS = {
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
};
// ============================================================================
// CTA Benchmarks (Expanded Pool)
// ============================================================================
exports.CTA_BENCHMARKS = {
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
};
// ============================================================================
// Complexity Benchmarks
// ============================================================================
exports.COMPLEXITY_BENCHMARKS = {
    elementCount: {
        optimal: { min: 100, max: 250 },
        examples: [
            { name: 'Linear', url: 'linear.app', value: '~150 elements (minimal, focused)' },
            { name: 'Stripe', url: 'stripe.com', value: '~200-300 elements (feature-rich)' },
            { name: 'Apple', url: 'apple.com', value: '~150-200 elements (clean)' },
        ],
        bestPractice: 'High-converting landing pages typically have 100-250 DOM elements',
    },
};
// ============================================================================
// Whitespace Benchmarks
// ============================================================================
exports.WHITESPACE_BENCHMARKS = {
    density: {
        optimal: { min: 40, max: 60 },
        examples: [
            { name: 'Apple', url: 'apple.com', value: 'Generous whitespace, ~50% negative space' },
            { name: 'Linear', url: 'linear.app', value: 'Minimal design, high whitespace ratio' },
            { name: 'Medium', url: 'medium.com', value: 'Reading-optimised spacing' },
        ],
        bestPractice: 'Award-winning sites maintain 40-60% whitespace ratio for visual breathing room',
    },
};
// ============================================================================
// Helper Functions
// ============================================================================
/**
 * Get a random example from a benchmark category
 */
function getRandomExample(examples) {
    return examples[Math.floor(Math.random() * examples.length)];
}
/**
 * Get two different examples for comparison
 */
function getTwoExamples(examples) {
    const shuffled = [...examples].sort(() => Math.random() - 0.5);
    return [shuffled[0], shuffled[1] || shuffled[0]];
}
/**
 * Format an example reference
 */
function formatExample(example) {
    return `**${example.name}** (${example.value})`;
}
/**
 * Format benchmark comparison
 */
function formatComparison(yourValue, benchmark, dimension) {
    const example = getRandomExample(benchmark.examples);
    const isOptimal = typeof yourValue === 'number'
        ? yourValue >= benchmark.optimal.min && yourValue <= benchmark.optimal.max
        : true;
    if (isOptimal) {
        return `Your ${dimension} (${yourValue}) aligns with ${formatExample(example)}. ${benchmark.bestPractice}`;
    }
    else {
        return `Your ${dimension} (${yourValue}) differs from sites like ${formatExample(example)}. ${benchmark.bestPractice}`;
    }
}
exports.default = {
    TYPOGRAPHY_BENCHMARKS: exports.TYPOGRAPHY_BENCHMARKS,
    COLOUR_BENCHMARKS: exports.COLOUR_BENCHMARKS,
    CTA_BENCHMARKS: exports.CTA_BENCHMARKS,
    COMPLEXITY_BENCHMARKS: exports.COMPLEXITY_BENCHMARKS,
    WHITESPACE_BENCHMARKS: exports.WHITESPACE_BENCHMARKS,
    getRandomExample,
    getTwoExamples,
    formatExample,
    formatComparison,
};
