/**
 * TypeScript Type Definitions for Analysis Engine
 * Pirouette - Design Confidence for Non-Designers
 */

// ============================================================================
// Pattern Library Types
// ============================================================================

export interface PatternMeta {
  date: string;
  sources: string[];
  shotsAnalyzed: number;
  designsExtracted: number;
  dimensions: string[];
  patternsGenerated: Record<string, number>;
  awaitingReview?: boolean;
}

export interface ColorPattern {
  id: string;
  name: string;
  primary: {
    hex: string;
    rgb: [number, number, number];
  };
  prevalence: string;
  examples: string[];
  sources: string[];
  firstSeen: string;
  lastUpdated: string;
  sampleSize: number;
  qualityScore: number;
  trending: boolean;
}

export interface WhitespacePattern {
  id: string;
  name: string;
  spacing: {
    sectionGap: string;
    contentPadding: string;
    lineHeight: string;
  };
  prevalence: string;
  effectiveness: string;
  examples: string[];
  sources: string[];
  firstSeen: string;
  lastUpdated: string;
  sampleSize: number;
  qualityScore: number;
  trending: boolean;
}

export interface LayoutPattern {
  id: string;
  name: string;
  structure: string;
  prevalence: string;
  effectiveness: string;
  examples: string[];
  sources: string[];
  firstSeen: string;
  lastUpdated: string;
  sampleSize: number;
  qualityScore: number;
  trending: boolean;
}

export interface CTAPattern {
  id: string;
  name: string;
  characteristics: {
    prominence: string;
    contrast: string;
    positioning: string;
  };
  prevalence: string;
  effectiveness: string;
  examples: string[];
  sources: string[];
  firstSeen: string;
  lastUpdated: string;
  sampleSize: number;
  qualityScore: number;
  trending: boolean;
}

export interface PatternLibrary {
  meta: PatternMeta;
  patterns: {
    colors: ColorPattern[];
    whitespace: WhitespacePattern[];
    complexity: any[];
    imageText: any[];
    typography: any[];
    layout: LayoutPattern[];
    ctaProminence: CTAPattern[];
    hierarchy: any[];
  };
}

// ============================================================================
// Analysis Result Types
// ============================================================================

export interface ColorAnalysis {
  primary: string;
  secondary?: string;
  accent?: string;
  palette: string[];
  contrastRatios: ContrastRatio[];
  wcagCompliance: {
    AA: boolean;
    AAA: boolean;
  };
  matchedPatterns: ColorPattern[];
  score: number;
  issues: string[];
  recommendations: string[];
}

export interface ContrastRatio {
  foreground: string;
  background: string;
  ratio: number;
  passes: {
    AA_normal: boolean;
    AA_large: boolean;
    AAA_normal: boolean;
    AAA_large: boolean;
  };
  element?: string;
  context?: string;
}

export interface WhitespaceAnalysis {
  sectionGaps: number[];
  contentPadding: number[];
  lineHeight: number;
  density: 'sparse' | 'balanced' | 'dense';
  matchedPatterns: WhitespacePattern[];
  score: number;
  issues: string[];
  recommendations: string[];
}

export interface TypographyAnalysis {
  fontFamilies: string[];
  fontSizes: number[];
  hierarchy: {
    h1?: number;
    h2?: number;
    h3?: number;
    body?: number;
  };
  scale: 'modular' | 'custom' | 'inconsistent';
  readability: number;
  score: number;
  issues: string[];
  recommendations: string[];
}

export interface LayoutAnalysis {
  structure: 'hero-centric' | 'grid' | 'asymmetric' | 'custom';
  columns: number;
  alignment: 'left' | 'center' | 'right' | 'justified';
  matchedPatterns: LayoutPattern[];
  score: number;
  issues: string[];
  recommendations: string[];
}

export interface CTAAnalysis {
  count: number;
  prominence: number; // 0-100
  contrast: number; // contrast ratio
  positioning: string[];
  hierarchy: 'clear' | 'moderate' | 'unclear';
  matchedPatterns: CTAPattern[];
  score: number;
  issues: string[];
  recommendations: string[];
}

export interface ComplexityAnalysis {
  elementCount: number;
  colorCount: number;
  fontCount: number;
  complexity: 'simple' | 'balanced' | 'complex';
  score: number;
  issues: string[];
  recommendations: string[];
}

export interface ImageTextRatioAnalysis {
  imagePercentage: number;
  textPercentage: number;
  ratio: number;
  balance: 'image-heavy' | 'balanced' | 'text-heavy';
  score: number;
  issues: string[];
  recommendations: string[];
}

export interface HierarchyAnalysis {
  visualWeight: {
    primary: number;
    secondary: number;
    tertiary: number;
  };
  clarity: 'excellent' | 'good' | 'fair' | 'poor';
  score: number;
  issues: string[];
  recommendations: string[];
}

// ============================================================================
// Complete Analysis Report
// ============================================================================

export interface AnalysisReport {
  id: string;
  url: string;
  timestamp: string;
  screenshot?: string;
  
  // 7 Dimensions
  dimensions: {
    colors: ColorAnalysis;
    whitespace: WhitespaceAnalysis;
    complexity: ComplexityAnalysis;
    imageText: ImageTextRatioAnalysis;
    typography: TypographyAnalysis;
    layout: LayoutAnalysis;
    ctaProminence: CTAAnalysis;
    hierarchy?: HierarchyAnalysis;
  };
  
  // Overall Metrics
  overallScore: number;
  dimensionScores: {
    colors: number;
    whitespace: number;
    complexity: number;
    imageText: number;
    typography: number;
    layout: number;
    ctaProminence: number;
    hierarchy?: number;
  };
  
  // Prioritized Recommendations
  recommendations: Recommendation[];
  
  // Metadata
  analysisTime: number; // milliseconds
  version: string;
}

export interface Recommendation {
  id: string;
  dimension: string;
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
  effort: 'low' | 'medium' | 'high';
  example?: string;
  pattern?: string; // Pattern ID this recommendation is based on
}

// ============================================================================
// Analyzer Configuration
// ============================================================================

export interface AnalyzerConfig {
  url: string;
  patterns: PatternLibrary;
  options?: {
    verbose?: boolean;
    skipScreenshot?: boolean;
    dimensions?: string[]; // Only analyze specific dimensions
    timeout?: number; // milliseconds
  };
}

// ============================================================================
// Job Status Types (for Railway integration)
// ============================================================================

export interface AnalysisJob {
  id: string;
  url: string;
  userId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number; // 0-100
  currentStep?: string;
  result?: AnalysisReport;
  error?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface JobProgress {
  jobId: string;
  progress: number;
  step: string;
  message: string;
  timestamp: string;
}

// ============================================================================
// Utility Types
// ============================================================================

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface HSL {
  h: number;
  s: number;
  l: number;
}

export interface ColorInfo {
  hex: string;
  rgb: RGB;
  hsl: HSL;
  name?: string;
}

// ============================================================================
// Export all types
// ============================================================================

export type {
  // Patterns
  PatternMeta,
  ColorPattern,
  WhitespacePattern,
  LayoutPattern,
  CTAPattern,
  PatternLibrary,
  
  // Analysis Results
  ColorAnalysis,
  ContrastRatio,
  WhitespaceAnalysis,
  TypographyAnalysis,
  LayoutAnalysis,
  CTAAnalysis,
  ComplexityAnalysis,
  ImageTextRatioAnalysis,
  HierarchyAnalysis,
  AnalysisReport,
  Recommendation,
  
  // Configuration
  AnalyzerConfig,
  
  // Jobs
  AnalysisJob,
  JobProgress,
  
  // Utilities
  RGB,
  HSL,
  ColorInfo,
};


