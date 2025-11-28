/**
 * Industry Classifier
 * 
 * Detects the industry/category of a website based on:
 * - URL patterns (domain keywords)
 * - Common content keywords
 * - Page structure indicators
 */

// ============================================================================
// Types
// ============================================================================

export type Industry = 
  | 'saas'
  | 'ecommerce'
  | 'agency'
  | 'blog'
  | 'marketplace'
  | 'finance'
  | 'health'
  | 'education'
  | 'other';

export interface ClassificationResult {
  industry: Industry;
  confidence: number; // 0-1
  matchedKeywords: string[];
}

// ============================================================================
// Industry Keywords and Patterns
// ============================================================================

const INDUSTRY_PATTERNS: Record<Industry, {
  urlKeywords: string[];
  contentKeywords: string[];
  weight: number;
}> = {
  saas: {
    urlKeywords: ['app', 'software', 'platform', 'cloud', 'dashboard', 'tool', 'api', 'io', 'dev'],
    contentKeywords: [
      'sign up', 'signup', 'free trial', 'pricing', 'plans', 'features',
      'integrations', 'api', 'dashboard', 'analytics', 'automation',
      'workflow', 'team', 'collaboration', 'subscription', 'monthly',
      'enterprise', 'startup', 'developers', 'saas'
    ],
    weight: 1.2, // SaaS is common, slight boost
  },
  ecommerce: {
    urlKeywords: ['shop', 'store', 'buy', 'cart', 'product', 'sale', 'deal'],
    contentKeywords: [
      'add to cart', 'buy now', 'checkout', 'shipping', 'delivery',
      'product', 'price', 'sale', 'discount', 'order', 'stock',
      'shop', 'store', 'collection', 'catalogue', 'free shipping'
    ],
    weight: 1.0,
  },
  agency: {
    urlKeywords: ['agency', 'studio', 'creative', 'design', 'digital', 'media', 'marketing'],
    contentKeywords: [
      'portfolio', 'our work', 'case study', 'clients', 'services',
      'branding', 'design', 'development', 'marketing', 'strategy',
      'creative', 'agency', 'studio', 'we build', 'we create'
    ],
    weight: 1.0,
  },
  blog: {
    urlKeywords: ['blog', 'news', 'magazine', 'journal', 'article', 'post'],
    contentKeywords: [
      'read more', 'article', 'post', 'author', 'published',
      'category', 'tag', 'comment', 'share', 'subscribe',
      'newsletter', 'blog', 'insights', 'thoughts', 'stories'
    ],
    weight: 0.9, // Lower weight as many sites have blogs
  },
  marketplace: {
    urlKeywords: ['marketplace', 'market', 'listings', 'directory', 'find'],
    contentKeywords: [
      'browse', 'listings', 'sellers', 'buyers', 'post listing',
      'find', 'search', 'filter', 'category', 'marketplace',
      'vendors', 'providers', 'services near', 'book now'
    ],
    weight: 1.0,
  },
  finance: {
    urlKeywords: ['finance', 'bank', 'invest', 'money', 'fund', 'capital', 'pay', 'fin'],
    contentKeywords: [
      'invest', 'portfolio', 'returns', 'savings', 'loan',
      'interest rate', 'account', 'banking', 'payment', 'transfer',
      'finance', 'credit', 'debit', 'trading', 'stocks'
    ],
    weight: 1.1,
  },
  health: {
    urlKeywords: ['health', 'medical', 'clinic', 'doctor', 'wellness', 'care', 'fit'],
    contentKeywords: [
      'health', 'wellness', 'medical', 'doctor', 'appointment',
      'treatment', 'patient', 'care', 'clinic', 'therapy',
      'fitness', 'nutrition', 'mental health', 'symptoms', 'diagnosis'
    ],
    weight: 1.0,
  },
  education: {
    urlKeywords: ['edu', 'learn', 'course', 'school', 'academy', 'training', 'class'],
    contentKeywords: [
      'learn', 'course', 'lesson', 'enroll', 'certificate',
      'student', 'instructor', 'curriculum', 'class', 'training',
      'education', 'tutorial', 'bootcamp', 'program', 'skills'
    ],
    weight: 1.0,
  },
  other: {
    urlKeywords: [],
    contentKeywords: [],
    weight: 0.5, // Fallback
  },
};

// ============================================================================
// Main Classification Function
// ============================================================================

/**
 * Classify a website into an industry category
 */
export function classifyIndustry(
  url: string,
  pageContent?: string
): ClassificationResult {
  const scores: Record<Industry, { score: number; matches: string[] }> = {
    saas: { score: 0, matches: [] },
    ecommerce: { score: 0, matches: [] },
    agency: { score: 0, matches: [] },
    blog: { score: 0, matches: [] },
    marketplace: { score: 0, matches: [] },
    finance: { score: 0, matches: [] },
    health: { score: 0, matches: [] },
    education: { score: 0, matches: [] },
    other: { score: 0, matches: [] },
  };

  const urlLower = url.toLowerCase();
  const contentLower = (pageContent || '').toLowerCase();

  // Score each industry
  for (const [industry, patterns] of Object.entries(INDUSTRY_PATTERNS) as [Industry, typeof INDUSTRY_PATTERNS[Industry]][]) {
    if (industry === 'other') continue;

    // Check URL keywords (higher weight)
    for (const keyword of patterns.urlKeywords) {
      if (urlLower.includes(keyword)) {
        scores[industry].score += 2;
        scores[industry].matches.push(`url:${keyword}`);
      }
    }

    // Check content keywords
    for (const keyword of patterns.contentKeywords) {
      if (contentLower.includes(keyword)) {
        scores[industry].score += 1;
        scores[industry].matches.push(keyword);
      }
    }

    // Apply industry weight
    scores[industry].score *= patterns.weight;
  }

  // Find the best match
  let bestIndustry: Industry = 'other';
  let bestScore = 0;

  for (const [industry, data] of Object.entries(scores) as [Industry, { score: number; matches: string[] }][]) {
    if (data.score > bestScore) {
      bestScore = data.score;
      bestIndustry = industry;
    }
  }

  // Calculate confidence (0-1)
  // Score of 5+ = high confidence, 2-4 = medium, <2 = low
  const confidence = Math.min(1, bestScore / 10);

  // If confidence is too low, default to 'other'
  if (confidence < 0.2) {
    return {
      industry: 'other',
      confidence: 0.5, // Default confidence for 'other'
      matchedKeywords: [],
    };
  }

  return {
    industry: bestIndustry,
    confidence,
    matchedKeywords: scores[bestIndustry].matches.slice(0, 5), // Top 5 matches
  };
}

/**
 * Get display name for an industry
 */
export function getIndustryDisplayName(industry: Industry): string {
  const names: Record<Industry, string> = {
    saas: 'SaaS',
    ecommerce: 'E-commerce',
    agency: 'Agency / Portfolio',
    blog: 'Blog / Content',
    marketplace: 'Marketplace',
    finance: 'Finance',
    health: 'Health & Wellness',
    education: 'Education',
    other: 'Other',
  };
  return names[industry];
}

/**
 * Get all industries for dropdown/selection
 */
export function getAllIndustries(): { value: Industry; label: string }[] {
  return [
    { value: 'saas', label: 'SaaS' },
    { value: 'ecommerce', label: 'E-commerce' },
    { value: 'agency', label: 'Agency / Portfolio' },
    { value: 'blog', label: 'Blog / Content' },
    { value: 'marketplace', label: 'Marketplace' },
    { value: 'finance', label: 'Finance' },
    { value: 'health', label: 'Health & Wellness' },
    { value: 'education', label: 'Education' },
    { value: 'other', label: 'Other' },
  ];
}

