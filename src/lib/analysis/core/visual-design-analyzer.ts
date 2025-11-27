// @ts-nocheck
/**
 * Visual Design Analyzer Skill
 * v1.1.0 - Color Scheme & Visual Pattern Analysis
 * 
 * Analyses color schemes, typography, and visual patterns from landing pages.
 * Can be triggered standalone or via landing-page-advisor integration.
 * 
 * v1.1.0: Integrated enhanced contrast validation via ContrastValidator skill
 * 
 * NOTE: TypeScript checking disabled due to legacy JavaScript patterns.
 */

import ContrastValidator from './contrast-validator';

export const skill = {
  name: 'visual-design-analyzer',
  description: 'Analyzes color schemes, typography, and visual design patterns with best practice recommendations',
  version: '1.1.0',
  author: 'Portfolio Project',
  
  // Activation triggers
  triggers: {
    keywords: [
      'color scheme',
      'color palette',
      'visual design',
      'brand colors',
      'accessibility',
      'contrast',
      'wcag',
      'typography',
      'visual hierarchy'
    ],
    contexts: [
      'file:src/pages/**/*.astro',
      'conversation:design-review',
      'conversation:accessibility',
      'skill:landing-page-advisor' // Can be triggered by other skill
    ],
    explicit: true
  },
  
  // Core capabilities
  capabilities: [
    'extract_color_schemes',
    'analyze_contrast_ratios',
    'check_wcag_compliance',
    'detect_typography_patterns',
    'compare_to_industry_patterns',
    'generate_visual_recommendations',
    'create_design_tokens'
  ],
  
  // Dependencies
  dependencies: {
    skills: [], // Can work standalone
    tools: [
      'mcp_cursor-browser-extension_browser_navigate',
      'mcp_cursor-browser-extension_browser_snapshot',
      'mcp_cursor-browser-extension_browser_evaluate',
      'read_file',
      'write'
    ]
  },
  
  // Configuration
  config: {
    // Color extraction targets
    extractionTargets: [
      { selector: '.hero', context: 'hero_section' },
      { selector: '.btn-primary', context: 'primary_cta' },
      { selector: '.btn-secondary', context: 'secondary_cta' },
      { selector: 'h1, h2, h3', context: 'headings' },
      { selector: 'p', context: 'body_text' },
      { selector: 'nav, header', context: 'navigation' }
    ],
    
    // WCAG standards
    wcag: {
      AA: {
        normalText: 4.5,
        largeText: 3.0
      },
      AAA: {
        normalText: 7.0,
        largeText: 4.5
      }
    },
    
    // Industry color patterns
    // TODO: Phase 2 - Add automatic crawler for real-time pattern updates
    // Target sources:
    // - https://dribbble.com/shots/popular/web-design (primary source)
    // - https://www.awwwards.com/websites/color/
    // - https://www.siteinspire.com/
    industryPatterns: {
      'saas': {
        name: 'SaaS Trust Blue',
        primary: { hex: '#0066FF', rgb: [0, 102, 255] },
        prevalence: '45%',
        effectiveness: '+15% trust perception',
        examples: ['Stripe', 'Dropbox', 'Atlassian']
      },
      'fintech': {
        name: 'Fintech Green',
        primary: { hex: '#00C853', rgb: [0, 200, 83] },
        prevalence: '38%',
        effectiveness: '+12% security perception',
        examples: ['Mint', 'Robinhood', 'TransferWise']
      },
      'validation': {
        name: 'Validation Warm',
        primary: { hex: '#2C5F2D', rgb: [44, 95, 45] },
        accent: { hex: '#E07A5F', rgb: [224, 122, 95] },
        prevalence: '32%',
        effectiveness: '+10% approachability',
        examples: ['Typeform', 'SurveyMonkey', 'Mailchimp']
      },
      'urgency': {
        name: 'Urgency Red/Orange',
        accent: { hex: '#FF3B30', rgb: [255, 59, 48] },
        prevalence: '28%',
        effectiveness: '+8% CTA clicks',
        examples: ['Airbnb', 'Netflix', 'YouTube']
      },
      'warm-terracotta': {
        name: 'Red Spectrum',
        primary: { hex: '#B55F4D', rgb: [181, 95, 77] },
        prevalence: '57%',
        effectiveness: '+10% warmth & approachability',
        examples: ['AI Farm Agriculture', 'Adventure Travel Agency', 'Jokula'],
        sources: ['dribbble', 'awwwards'],
        trending: true,
        firstSeen: '2025-11-21',
        qualityScore: 0.61,
        notes: 'Generated from real Dribbble trending designs. Warm terracotta/rust tones trending in 2025.'
      }
    },
    
    // Data sources for pattern updates (Phase 2)
    dataSources: {
      dribbble: {
        url: 'https://dribbble.com/shots/popular/web-design',
        enabled: true,
        refreshInterval: '7d',
        extractionMethod: 'browser-snapshot',
        weight: 1.0, // Base weight
        reputation: 'high' // high, medium, low
      },
      awwwards: {
        url: 'https://www.awwwards.com/websites/color/',
        enabled: true, // Phase 2.2 enabled!
        refreshInterval: '7d',
        extractionMethod: 'browser-snapshot',
        weight: 1.5, // Higher weight for award-winning designs
        reputation: 'high'
      },
      siteinspire: {
        url: 'https://www.siteinspire.com/',
        enabled: true, // Phase 2.2 enabled!
        refreshInterval: '7d',
        extractionMethod: 'browser-snapshot',
        weight: 1.2, // Medium-high weight for curated designs
        reputation: 'high'
      },
      behance: {
        url: 'https://www.behance.net/galleries/ui-ux',
        enabled: true, // Phase 2B: Added for hybrid approach!
        refreshInterval: '7d',
        extractionMethod: 'browser-snapshot',
        weight: 1.3, // High weight for professional portfolios (Adobe platform)
        reputation: 'high'
      }
    },
    
    // Pattern learning configuration
    patternLearning: {
      enabled: true,
      maxShots: 50, // Limit for testing
      colorCount: 5, // Colors to extract per design
      clusters: 10, // Number of patterns to generate
      minSampleSize: 2, // Minimum shots per pattern
      multiSourceWeighting: true, // Weight patterns by source reputation
      qualityThreshold: 0.6 // Minimum quality score to keep pattern
    }
  },
  
  /**
   * Compare multiple pages and identify differences
   */
  async comparePages(pages, options = {}) {
    console.log(`\n🔀 Comparing ${pages.length} pages...`);
    console.log('═'.repeat(60));
    
    // Analyze each page
    const pageAnalyses = [];
    for (const page of pages) {
      console.log(`\n📄 Analyzing: ${page}`);
      const analysis = await this.run({ 
        pages: [page], 
        baseUrl: options.baseUrl,
        analyzeTypography: options.baseUrl ? true : false,
        analyzeSpacing: options.baseUrl ? true : false,
        analyzeLayout: options.baseUrl ? true : false
      });
      pageAnalyses.push({
        page,
        analysis
      });
    }
    
    // Create comparison report
    const comparison = {
      meta: {
        comparedAt: new Date().toISOString(),
        pagesCompared: pages.length
      },
      pages: pageAnalyses.map(pa => ({
        path: pa.page,
        colors: pa.analysis.colorAnalysis.pages[0]?.palette,
        accessibilityScore: pa.analysis.accessibility.summary.passRate,
        brandConsistency: 'N/A', // Single page
        patternMatches: pa.analysis.patternMatch.matches.length,
        recommendations: pa.analysis.recommendations.length,
        typography: pa.analysis.typography ? {
          score: pa.analysis.typography.overallScore,
          issues: pa.analysis.typography.issues.length,
          strengths: pa.analysis.typography.strengths.length
        } : null,
        spacing: pa.analysis.spacing ? {
          score: pa.analysis.spacing.overallScore,
          issues: pa.analysis.spacing.issues.length,
          strengths: pa.analysis.spacing.strengths.length
        } : null,
        layout: pa.analysis.layout ? {
          score: pa.analysis.layout.overallScore,
          issues: pa.analysis.layout.issues.length,
          strengths: pa.analysis.layout.strengths.length
        } : null
      })),
      differences: {
        colorSchemes: this.compareColorSchemes(pageAnalyses),
        accessibility: this.compareAccessibility(pageAnalyses),
        patterns: this.comparePatterns(pageAnalyses)
      },
      winner: null // Will be calculated
    };
    
    // Determine winner based on multiple factors
    comparison.winner = this.determineWinner(comparison.pages);
    
    // Save comparison report
    const timestamp = new Date().toISOString().split('T')[0];
    const comparisonPath = `docs/visual-design-audits/${timestamp}/page-comparison.json`;
    await run_terminal_cmd(`mkdir -p docs/visual-design-audits/${timestamp}`, false);
    await write(comparisonPath, JSON.stringify(comparison, null, 2));
    
    // Generate human-readable comparison
    const comparisonReport = this.generateComparisonReport(comparison);
    await write(`docs/visual-design-audits/${timestamp}/page-comparison.md`, comparisonReport);
    
    console.log('\n✅ Comparison Complete!');
    console.log(`📊 Winner: ${comparison.winner.page}`);
    console.log(`📁 Report: ${comparisonPath}`);
    
    return comparison;
  },
  
  /**
   * Compare color schemes between pages
   */
  compareColorSchemes(pageAnalyses) {
    const differences = [];
    
    for (let i = 0; i < pageAnalyses.length; i++) {
      for (let j = i + 1; j < pageAnalyses.length; j++) {
        const page1 = pageAnalyses[i].analysis.colorAnalysis.pages[0];
        const page2 = pageAnalyses[j].analysis.colorAnalysis.pages[0];
        
        const diff = {
          pages: [pageAnalyses[i].page, pageAnalyses[j].page],
          primaryMatch: page1.palette.primary === page2.palette.primary,
          accentMatch: page1.palette.accent === page2.palette.accent,
          uniqueColors: {
            page1: page1.uniqueColors,
            page2: page2.uniqueColors
          }
        };
        
        differences.push(diff);
      }
    }
    
    return differences;
  },
  
  /**
   * Compare accessibility between pages
   */
  compareAccessibility(pageAnalyses) {
    return pageAnalyses.map(pa => ({
      page: pa.page,
      passRate: pa.analysis.accessibility.summary.passRate,
      issues: pa.analysis.accessibility.issues.length,
      passing: pa.analysis.accessibility.summary.passing
    }));
  },
  
  /**
   * Compare pattern matches between pages
   */
  comparePatterns(pageAnalyses) {
    return pageAnalyses.map(pa => ({
      page: pa.page,
      matches: pa.analysis.patternMatch.matches,
      topMatch: pa.analysis.patternMatch.matches[0] || null
    }));
  },
  
  /**
   * Determine winner based on multiple factors
   */
  determineWinner(pages) {
    // Score each page with new comprehensive metrics
    const scores = pages.map(page => {
      let score = 0;
      let totalWeight = 0;
      
      // Accessibility score (25% weight)
      const accessibilityPercent = parseFloat(page.accessibilityScore) / 100;
      score += accessibilityPercent * 25;
      totalWeight += 25;
      
      // Pattern matches (20% weight)
      score += Math.min(page.patternMatches / 3, 1) * 20;
      totalWeight += 20;
      
      // Typography score (15% weight)
      if (page.typography?.score) {
        score += (page.typography.score / 10) * 15;
        totalWeight += 15;
      }
      
      // Spacing score (15% weight)
      if (page.spacing?.score) {
        score += (page.spacing.score / 10) * 15;
        totalWeight += 15;
      }
      
      // Layout score (15% weight)
      if (page.layout?.score) {
        score += (page.layout.score / 10) * 15;
        totalWeight += 15;
      }
      
      // Fewer recommendations needed = better (10% weight)
      score += Math.max(0, (1 - page.recommendations / 10)) * 10;
      totalWeight += 10;
      
      // Normalize score to 100
      const normalizedScore = totalWeight > 0 ? (score / totalWeight) * 100 : 0;
      
      return {
        page: page.path,
        score: parseFloat(normalizedScore.toFixed(2)),
        breakdown: {
          accessibility: accessibilityPercent * 25,
          patterns: Math.min(page.patternMatches / 3, 1) * 20,
          typography: page.typography ? (page.typography.score / 10) * 15 : 0,
          spacing: page.spacing ? (page.spacing.score / 10) * 15 : 0,
          layout: page.layout ? (page.layout.score / 10) * 15 : 0,
          recommendations: Math.max(0, (1 - page.recommendations / 10)) * 10
        }
      };
    });
    
    // Return highest scorer
    return scores.reduce((winner, current) => 
      current.score > winner.score ? current : winner
    );
  },
  
  /**
   * Generate human-readable comparison report
   */
  generateComparisonReport(comparison) {
    let report = `# Page Comparison Report\n\n`;
    report += `**Compared:** ${new Date(comparison.meta.comparedAt).toLocaleString()}\n`;
    report += `**Pages:** ${comparison.meta.pagesCompared}\n\n`;
    
    report += `## 🏆 Winner: ${comparison.winner.page}\n\n`;
    report += `**Score:** ${comparison.winner.score}/100\n\n`;
    
    report += `## 📊 Detailed Scores\n\n`;
    comparison.pages.forEach((page, idx) => {
      const pageScore = comparison.winner.page === page.path ? 
        comparison.winner.score : 
        comparison.pages[idx].score || 'N/A';
      
      const isWinner = comparison.winner.page === page.path;
      report += `### ${isWinner ? '🏆 ' : ''}${page.path}\n\n`;
      
      // Core metrics
      report += `- **Overall Score:** ${pageScore}/100 ${isWinner ? '⭐' : ''}\n`;
      report += `- **Accessibility:** ${page.accessibilityScore}\n`;
      report += `- **Pattern Matches:** ${page.patternMatches}\n`;
      
      // New metrics
      if (page.typography) {
        report += `- **Typography:** ${page.typography.score}/10 (${page.typography.issues} issues, ${page.typography.strengths} strengths)\n`;
      }
      if (page.spacing) {
        report += `- **Spacing:** ${page.spacing.score}/10 (${page.spacing.issues} issues, ${page.spacing.strengths} strengths)\n`;
      }
      if (page.layout) {
        report += `- **Layout:** ${page.layout.score}/10 (${page.layout.issues} issues, ${page.layout.strengths} strengths)\n`;
      }
      
      report += `- **Recommendations:** ${page.recommendations}\n\n`;
      
      report += `#### Colors\n`;
      report += `- Primary: ${page.colors?.primary || 'Not detected'}\n`;
      report += `- Accent: ${page.colors?.accent || 'Not detected'}\n`;
      report += `- Background: ${page.colors?.background || 'Not detected'}\n`;
      report += `- Text: ${page.colors?.text || 'Not detected'}\n\n`;
    });
    
    report += `## 🎨 Color Scheme Differences\n\n`;
    comparison.differences.colorSchemes.forEach(diff => {
      report += `### ${diff.pages[0]} vs ${diff.pages[1]}\n\n`;
      report += `- Primary colors match: ${diff.primaryMatch ? '✅' : '❌'}\n`;
      report += `- Accent colors match: ${diff.accentMatch ? '✅' : '❌'}\n\n`;
    });
    
    report += `## ♿ Accessibility Comparison\n\n`;
    comparison.differences.accessibility.forEach(acc => {
      report += `- **${acc.page}:** ${acc.passRate} (${acc.passing} passing, ${acc.issues} issues)\n`;
    });
    
    report += `\n## 🎯 Pattern Matches\n\n`;
    comparison.differences.patterns.forEach(pat => {
      report += `### ${pat.page}\n\n`;
      if (pat.topMatch) {
        report += `- **Best Match:** ${pat.topMatch.pattern} (${Math.round(pat.topMatch.similarity * 100)}% similar)\n`;
        report += `- **Effectiveness:** ${pat.topMatch.effectiveness}\n`;
      } else {
        report += `- No strong pattern matches\n`;
      }
      report += `\n`;
    });
    
    return report;
  },
  
  /**
   * Main execution flow
   */
  async run(options = {}) {
    console.log(`🎨 Visual Design Analyzer v${this.version}`);
    console.log('─'.repeat(60));
    
    // Step 1: Extract colors from pages
    console.log('\n🔍 Extracting color schemes...');
    const colorData = await this.extractColors(options.pages || []);
    console.log(`✅ Analyzed ${colorData.length} pages`);
    
    // Step 2: Analyze contrast ratios
    console.log('\n📊 Analyzing contrast ratios...');
    const contrastAnalysis = await this.analyzeContrast(colorData);
    console.log(`✅ Checked ${contrastAnalysis.checks.length} color combinations`);
    
    // Step 3: Check WCAG compliance
    console.log('\n♿ Checking WCAG compliance...');
    const accessibility = await this.checkAccessibility(contrastAnalysis);
    console.log(`✅ Found ${accessibility.issues.length} accessibility issues`);
    
    // Step 3.5: Enhanced context-aware contrast validation (optional)
    let enhancedContrast = null;
    if (options.enhancedContrast !== false && options.baseUrl) {
      console.log('\n🔬 Running enhanced contrast validation...');
      try {
        const validator = new ContrastValidator(options.baseUrl);
        const pagePath = options.pages?.[0] || '/';
        const actualPath = pagePath.replace('src/pages', '').replace('/index.astro', '/');
        enhancedContrast = await validator.validate(actualPath);
        console.log(`✅ Enhanced validation: ${enhancedContrast.summary.failing} additional issues found`);
      } catch (error) {
        console.log(`⚠️  Enhanced contrast validation skipped: ${error.message}`);
      }
    }
    
    // Step 4: Compare to industry patterns
    console.log('\n🎯 Comparing to industry patterns...');
    const patternMatch = await this.compareToPatterns(colorData);
    console.log(`✅ Matched ${patternMatch.matches.length} industry patterns`);
    
    // Step 5: Analyze brand consistency
    console.log('\n🔄 Analyzing brand consistency...');
    const consistency = await this.checkConsistency(colorData);
    console.log(`✅ Consistency score: ${consistency.score}/10`);
    
    // Step 6: Analyze typography (new! - requires browser)
    let typography = null;
    if (options.analyzeTypography !== false && options.baseUrl) {
      console.log('\n📝 Analyzing typography...');
      // Navigate to page first
      const pagePath = options.pages?.[0] || '';
      const url = `${options.baseUrl}${pagePath.replace('src/pages', '').replace('/index.astro', '/')}`;
      
      try {
        await mcp_cursor_browser_navigate(url);
        await mcp_cursor_browser_wait({ time: 2 }); // Wait for page load
        typography = await this.analyzeTypography(null, pagePath);
        console.log(`✅ Typography score: ${typography.overallScore}/10`);
      } catch (error) {
        console.log(`⚠️  Typography analysis skipped: ${error.message}`);
      }
    }
    
    // Step 7: Analyze spacing (new! - requires browser)
    let spacing = null;
    if (options.analyzeSpacing !== false && options.baseUrl) {
      console.log('\n📏 Analyzing spacing...');
      try {
        // Browser already on page from typography
        spacing = await this.analyzeSpacing(null, options.pages?.[0]);
        console.log(`✅ Spacing score: ${spacing.overallScore}/10`);
      } catch (error) {
        console.log(`⚠️  Spacing analysis skipped: ${error.message}`);
      }
    }
    
    // Step 8: Analyze layout (new! - requires browser)
    let layout = null;
    if (options.analyzeLayout !== false && options.baseUrl) {
      console.log('\n📐 Analyzing layout...');
      try {
        // Browser already on page
        layout = await this.analyzeLayout(null, options.pages?.[0]);
        console.log(`✅ Layout score: ${layout.overallScore}/10`);
      } catch (error) {
        console.log(`⚠️  Layout analysis skipped: ${error.message}`);
      }
    }
    
    // Step 9: Generate recommendations
    console.log('\n💡 Generating recommendations...');
    const recommendations = await this.generateRecommendations({
      colorData,
      contrastAnalysis,
      accessibility,
      patternMatch,
      consistency,
      typography,
      spacing,
      layout
    });
    console.log(`✅ Generated ${recommendations.length} recommendations`);
    
    // Step 10: Create action manifest
    console.log('\n📦 Creating action manifest...');
    const manifest = await this.createManifest({
      colorData,
      contrastAnalysis,
      accessibility,
      enhancedContrast,
      patternMatch,
      consistency,
      typography,
      spacing,
      layout,
      recommendations
    });
    
    // Step 8: Save artifacts
    const outputPath = await this.saveArtifacts(manifest, options);
    
    console.log('\n✅ Analysis Complete!');
    console.log(`📁 Output: ${outputPath}`);
    console.log(`🎨 Colors Analyzed: ${colorData.reduce((sum, p) => sum + p.palette.length, 0)}`);
    console.log(`⚠️  Accessibility Issues: ${accessibility.issues.length}`);
    if (enhancedContrast) {
      console.log(`🔬 Enhanced Contrast Issues: ${enhancedContrast.summary.failing} (${enhancedContrast.summary.passRate} pass rate)`);
    }
    console.log(`📊 Recommendations: ${recommendations.length}`);
    
    return manifest;
  },
  
  /**
   * Extract colors from pages
   */
  async extractColors(pages) {
    const results = [];
    
    for (const pagePath of pages) {
      try {
        console.log(`   Analyzing ${pagePath}...`);
        
        // Read page content
        const content = await readFile(pagePath);
        
        // Extract colors from inline styles and CSS
        const colors = this.parseColors(content);
        
        // Organize by context
        const palette = this.organizePalette(colors, content);
        
        results.push({
          path: pagePath,
          palette,
          rawColors: colors
        });
        
      } catch (error) {
        console.error(`   ❌ Error analyzing ${pagePath}:`, error.message);
      }
    }
    
    return results;
  },
  
  /**
   * Parse colors from content
   */
  parseColors(content) {
    const colors = new Set();
    
    // Extract hex colors
    const hexPattern = /#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})\b/g;
    const hexMatches = content.match(hexPattern) || [];
    hexMatches.forEach(hex => colors.add(hex.toUpperCase()));
    
    // Extract RGB colors
    const rgbPattern = /rgb\((\d+),\s*(\d+),\s*(\d+)\)/g;
    let rgbMatch;
    while ((rgbMatch = rgbPattern.exec(content)) !== null) {
      const hex = this.rgbToHex(
        parseInt(rgbMatch[1]),
        parseInt(rgbMatch[2]),
        parseInt(rgbMatch[3])
      );
      colors.add(hex);
    }
    
    // Extract named color variables
    const cssVarPattern = /--color-(\w+):\s*([#\w]+)/g;
    const variables = {};
    let varMatch;
    while ((varMatch = cssVarPattern.exec(content)) !== null) {
      variables[varMatch[1]] = varMatch[2].toUpperCase();
      colors.add(varMatch[2].toUpperCase());
    }
    
    return {
      unique: Array.from(colors),
      variables
    };
  },
  
  /**
   * Organize colors by context
   */
  organizePalette(colors, content) {
    const palette = {
      primary: null,
      accent: null,
      background: null,
      text: null,
      supporting: []
    };
    
    // Heuristics based on variable names and usage frequency
    if (colors.variables) {
      palette.primary = colors.variables.primary || colors.variables.brand;
      palette.accent = colors.variables.accent || colors.variables.secondary;
      palette.background = colors.variables.bg || colors.variables.background;
      palette.text = colors.variables.text || colors.variables.foreground;
    }
    
    // Fallback: detect from common patterns
    if (!palette.primary) {
      // Look for colors used in .btn-primary or .hero
      const primaryPattern = /\.btn-primary.*?background.*?([#\w]+)/s;
      const primaryMatch = content.match(primaryPattern);
      if (primaryMatch) palette.primary = primaryMatch[1].toUpperCase();
    }
    
    // Supporting colors are everything else
    palette.supporting = colors.unique.filter(c => 
      c !== palette.primary && 
      c !== palette.accent && 
      c !== palette.background &&
      c !== palette.text
    );
    
    return palette;
  },
  
  /**
   * Analyze contrast ratios
   */
  async analyzeContrast(colorData) {
    const checks = [];
    
    for (const page of colorData) {
      const { palette } = page;
      
      // Check primary text on background
      if (palette.text && palette.background) {
        checks.push({
          page: page.path,
          context: 'body_text',
          foreground: palette.text,
          background: palette.background,
          ratio: this.calculateContrastRatio(palette.text, palette.background)
        });
      }
      
      // Check primary on background (for buttons)
      if (palette.primary && palette.background) {
        checks.push({
          page: page.path,
          context: 'primary_element',
          foreground: '#FFFFFF', // Assume white text on primary
          background: palette.primary,
          ratio: this.calculateContrastRatio('#FFFFFF', palette.primary)
        });
      }
      
      // Check accent on background
      if (palette.accent && palette.background) {
        checks.push({
          page: page.path,
          context: 'accent_element',
          foreground: '#FFFFFF',
          background: palette.accent,
          ratio: this.calculateContrastRatio('#FFFFFF', palette.accent)
        });
      }
    }
    
    return { checks };
  },
  
  /**
   * Calculate contrast ratio between two colors
   */
  calculateContrastRatio(fg, bg) {
    const l1 = this.relativeLuminance(fg);
    const l2 = this.relativeLuminance(bg);
    
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    
    const ratio = (lighter + 0.05) / (darker + 0.05);
    
    return parseFloat(ratio.toFixed(2));
  },
  
  /**
   * Calculate relative luminance
   */
  relativeLuminance(hex) {
    const rgb = this.hexToRgb(hex);
    
    const [r, g, b] = rgb.map(val => {
      const normalized = val / 255;
      return normalized <= 0.03928
        ? normalized / 12.92
        : Math.pow((normalized + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  },
  
  /**
   * Check WCAG compliance
   */
  async checkAccessibility(contrastAnalysis) {
    const issues = [];
    const passes = [];
    
    for (const check of contrastAnalysis.checks) {
      const isLargeText = check.context.includes('heading');
      const aaThreshold = isLargeText ? this.config.wcag.AA.largeText : this.config.wcag.AA.normalText;
      const aaaThreshold = isLargeText ? this.config.wcag.AAA.largeText : this.config.wcag.AAA.normalText;
      
      const result = {
        ...check,
        isLargeText,
        wcagAA: check.ratio >= aaThreshold,
        wcagAAA: check.ratio >= aaaThreshold
      };
      
      if (!result.wcagAA) {
        issues.push({
          severity: 'high',
          ...result,
          recommendation: this.suggestContrastFix(check, aaThreshold)
        });
      } else {
        passes.push(result);
      }
    }
    
    return {
      issues,
      passes,
      summary: {
        total: contrastAnalysis.checks.length,
        passing: passes.length,
        failing: issues.length,
        passRate: `${Math.round((passes.length / contrastAnalysis.checks.length) * 100)}%`
      }
    };
  },
  
  /**
   * Suggest contrast fix
   */
  suggestContrastFix(check, targetRatio) {
    const currentRatio = check.ratio;
    const needed = targetRatio - currentRatio;
    
    // Simple heuristic: suggest darkening foreground or lightening background
    return {
      current: `${check.foreground} on ${check.background} = ${currentRatio}:1`,
      target: `${targetRatio}:1 (WCAG AA)`,
      options: [
        `Darken foreground: Try ${this.darkenColor(check.foreground, 20)}`,
        `Lighten background: Try ${this.lightenColor(check.background, 20)}`,
        `Use higher contrast combination`
      ]
    };
  },
  
  /**
   * Compare to industry patterns
   */
  async compareToPatterns(colorData, options = {}) {
    const matches = [];
    
    // Load learned patterns if available
    let learnedPatterns = null;
    if (options.useLearnedPatterns) {
      try {
        const fs = await import('fs');
        const latestReport = await this.findLatestPatternReport();
        if (latestReport) {
          const reportData = await fs.promises.readFile(latestReport, 'utf-8');
          learnedPatterns = JSON.parse(reportData);
        }
      } catch (error) {
        console.log('   ⚠️  No learned patterns found, using defaults');
      }
    }
    
    for (const page of colorData) {
      const { palette } = page;
      
      if (!palette.primary) continue;
      
      // 1. Color pattern matching (existing)
      const colorMatches = [];
      for (const [key, pattern] of Object.entries(this.config.industryPatterns)) {
        const patternHex = typeof pattern.primary === 'string' 
          ? pattern.primary 
          : pattern.primary?.hex;
        
        if (!patternHex) continue;
        
        const similarity = this.calculateColorSimilarity(
          palette.primary,
          patternHex
        );
        
        if (similarity > 0.7) {
          colorMatches.push({
            pattern: pattern.name,
            similarity,
            prevalence: pattern.prevalence,
            effectiveness: pattern.effectiveness,
            examples: pattern.examples
          });
        }
      }
      
      // 2. Multi-dimensional pattern matching (NEW! - Phase 2A)
      const dimensionalMatches = {};
      
      if (learnedPatterns && learnedPatterns.patterns) {
        // Whitespace matching (if we have live page metrics)
        if (page.whitespaceRatio && learnedPatterns.patterns.whitespace) {
          const wsMatch = this.findBestWhitespaceMatch(
            page.whitespaceRatio, 
            learnedPatterns.patterns.whitespace
          );
          if (wsMatch) {
            dimensionalMatches.whitespace = wsMatch;
          }
        }
        
        // Complexity matching (if we have live page metrics)
        if (page.complexityScore && learnedPatterns.patterns.complexity) {
          const cxMatch = this.findBestComplexityMatch(
            page.complexityScore,
            learnedPatterns.patterns.complexity
          );
          if (cxMatch) {
            dimensionalMatches.complexity = cxMatch;
          }
        }
        
        // Image/Text matching (if we have live page metrics)
        if (page.imageTextRatio && learnedPatterns.patterns.imageText) {
          const itMatch = this.findBestImageTextMatch(
            page.imageTextRatio,
            learnedPatterns.patterns.imageText
          );
          if (itMatch) {
            dimensionalMatches.imageText = itMatch;
          }
        }
      }
      
      // Create comprehensive match object
      const pageMatch = {
        page: page.path,
        colorMatch: colorMatches.length > 0 ? colorMatches[0] : null,
        dimensionalMatches,
        overallArchetype: this.determinePageArchetype(
          colorMatches[0],
          dimensionalMatches
        ),
        recommendations: this.generateDimensionalRecommendations(
          colorMatches[0],
          dimensionalMatches,
          page
        )
      };
      
      matches.push(pageMatch);
    }
    
    return {
      matches,
      summary: this.generateMultiDimensionalSummary(matches),
      dimensions: Object.keys(matches[0]?.dimensionalMatches || {}).length + 1 // +1 for colors
    };
  },
  
  /**
   * Compare a single design against all learned patterns
   * Used by page-quality-auditor.mjs
   */
  async compareDesignAgainstPatterns(design, patternReportPath) {
    const match = {
      dimensionalMatches: {}
    };
    
    // Load pattern report
    if (!patternReportPath) {
      console.log('   ⚠️  No pattern report provided');
      return [match];
    }
    
    let patternReport;
    try {
      const fs = await import('fs/promises');
      const reportData = await fs.readFile(patternReportPath, 'utf-8');
      patternReport = JSON.parse(reportData);
    } catch (error) {
      console.log(`   ⚠️  Failed to load pattern report: ${error.message}`);
      return [match];
    }
    
    if (!patternReport || !patternReport.patterns) {
      console.log('   ⚠️  Pattern report has no patterns');
      return [match];
    }
    
    // Whitespace matching
    if (design.whitespace && patternReport.patterns.whitespace) {
      match.dimensionalMatches.whitespace = this.findBestWhitespaceMatch(
        design.whitespace.percentage / 100,
        patternReport.patterns.whitespace
      );
    }
    
    // Complexity matching
    if (design.complexity && patternReport.patterns.complexity) {
      match.dimensionalMatches.complexity = this.findBestComplexityMatch(
        design.complexity.score / 100,
        patternReport.patterns.complexity
      );
    }
    
    // Image/Text matching
    if (design.imageTextRatio && patternReport.patterns.imageText) {
      match.dimensionalMatches.imageText = this.findBestImageTextMatch(
        { image: design.imageTextRatio.imagePercentage / 100 },
        patternReport.patterns.imageText
      );
    }
    
    // Typography matching
    if (design.typography && patternReport.patterns.typography) {
      match.dimensionalMatches.typography = this.findBestTypographyMatch(
        design.typography,
        patternReport.patterns.typography
      );
    }
    
    // Layout matching
    if (design.layout && patternReport.patterns.layout) {
      match.dimensionalMatches.layout = this.findBestLayoutMatch(
        design.layout,
        patternReport.patterns.layout
      );
    }
    
    // CTA Prominence matching
    if (design.ctaProminence && patternReport.patterns.ctaProminence) {
      match.dimensionalMatches.ctaProminence = this.findBestCTAMatch(
        design.ctaProminence,
        patternReport.patterns.ctaProminence
      );
    }
    
    console.log('   ✅ Matched against', Object.keys(match.dimensionalMatches).length, 'dimensions');
    
    return [match]; // Return as array for consistency with compareToPatterns
  },
  
  /**
   * Find best whitespace pattern match
   */
  findBestWhitespaceMatch(userRatio, patterns) {
    let bestMatch = null;
    let bestScore = 0;
    
    for (const pattern of patterns) {
      // Parse range (e.g., "60-75%" -> [0.60, 0.75])
      const rangeParts = pattern.range.match(/(\d+)-(\d+)%/);
      if (!rangeParts) continue;
      
      const min = parseInt(rangeParts[1]) / 100;
      const max = parseInt(rangeParts[2]) / 100;
      const mid = (min + max) / 2;
      
      // Calculate similarity (how close to pattern midpoint)
      const distance = Math.abs(userRatio - mid);
      const score = Math.max(0, 1 - (distance * 2)); // Scale to 0-1
      
      if (score > bestScore) {
        bestScore = score;
        bestMatch = {
          pattern: pattern.name,
          similarity: parseFloat(score.toFixed(3)),
          userRatio,
          patternRange: pattern.range,
          prevalence: pattern.prevalence,
          examples: pattern.examples,
          recommendation: this.getWhitespaceRecommendation(userRatio, min, max, pattern)
        };
      }
    }
    
    return bestMatch;
  },
  
  /**
   * Find best complexity pattern match
   */
  findBestComplexityMatch(userScore, patterns) {
    let bestMatch = null;
    let bestScore = 0;
    
    for (const pattern of patterns) {
      // Parse score range (e.g., "0-30" -> [0, 0.3])
      const rangeParts = pattern.scoreRange.match(/(\d+)-(\d+)/);
      if (!rangeParts) continue;
      
      const min = parseInt(rangeParts[1]) / 100;
      const max = parseInt(rangeParts[2]) / 100;
      const mid = (min + max) / 2;
      
      const distance = Math.abs(userScore - mid);
      const score = Math.max(0, 1 - (distance * 2));
      
      if (score > bestScore) {
        bestScore = score;
        bestMatch = {
          pattern: pattern.name,
          similarity: parseFloat(score.toFixed(3)),
          userScore,
          patternRange: pattern.scoreRange,
          prevalence: pattern.prevalence,
          examples: pattern.examples,
          recommendation: this.getComplexityRecommendation(userScore, min, max, pattern)
        };
      }
    }
    
    return bestMatch;
  },
  
  /**
   * Find best image/text pattern match
   */
  findBestImageTextMatch(userRatio, patterns) {
    let bestMatch = null;
    let bestScore = 0;
    
    for (const pattern of patterns) {
      // Compare image ratios
      const distance = Math.abs(userRatio.image - pattern.averageImageRatio);
      const score = Math.max(0, 1 - distance);
      
      if (score > bestScore) {
        bestScore = score;
        bestMatch = {
          pattern: pattern.name,
          similarity: parseFloat(score.toFixed(3)),
          userRatio,
          patternAverage: {
            image: pattern.averageImageRatio,
            text: pattern.averageTextRatio
          },
          prevalence: pattern.prevalence,
          examples: pattern.examples,
          recommendation: this.getImageTextRecommendation(userRatio, pattern)
        };
      }
    }
    
    return bestMatch;
  },
  
  /**
   * Find best typography pattern match
   */
  findBestTypographyMatch(userTypography, patterns) {
    let bestMatch = null;
    let bestScore = 0;
    
    for (const pattern of patterns) {
      // Match scale type
      const scaleMatch = userTypography.scaleType === pattern.scaleType ? 1.0 : 0.5;
      
      if (scaleMatch > bestScore) {
        bestScore = scaleMatch;
        bestMatch = {
          pattern: pattern.pattern,
          similarity: parseFloat(scaleMatch.toFixed(3)),
          userScale: userTypography.scaleType,
          patternScale: pattern.scaleType,
          prevalence: pattern.prevalence,
          examples: pattern.examples
        };
      }
    }
    
    return bestMatch;
  },
  
  /**
   * Find best layout pattern match
   */
  findBestLayoutMatch(userLayout, patterns) {
    let bestMatch = null;
    let bestScore = 0;
    
    for (const pattern of patterns) {
      // Match layout type
      const layoutMatch = userLayout.layoutType === pattern.layoutType ? 1.0 : 0.5;
      
      if (layoutMatch > bestScore) {
        bestScore = layoutMatch;
        bestMatch = {
          pattern: pattern.pattern,
          similarity: parseFloat(layoutMatch.toFixed(3)),
          userLayout: userLayout.layoutType,
          patternLayout: pattern.layoutType,
          prevalence: pattern.prevalence,
          examples: pattern.examples
        };
      }
    }
    
    return bestMatch;
  },
  
  /**
   * Find best CTA prominence pattern match
   */
  findBestCTAMatch(userCTA, patterns) {
    let bestMatch = null;
    let bestScore = 0;
    
    for (const pattern of patterns) {
      // Match CTA count range
      const avgCount = pattern.avgCTACount;
      const distance = Math.abs(userCTA.ctaCount - avgCount);
      const score = Math.max(0, 1 - (distance / 5)); // 5 CTA difference = 0 similarity
      
      if (score > bestScore) {
        bestScore = score;
        bestMatch = {
          pattern: pattern.pattern,
          similarity: parseFloat(score.toFixed(3)),
          userCTACount: userCTA.ctaCount,
          patternAvgCount: avgCount,
          prevalence: pattern.prevalence,
          examples: pattern.examples
        };
      }
    }
    
    return bestMatch;
  },
  
  /**
   * Generate whitespace recommendation
   */
  getWhitespaceRecommendation(userRatio, min, max, pattern) {
    if (userRatio >= min && userRatio <= max) {
      return `✅ Perfect! Your whitespace (${(userRatio * 100).toFixed(0)}%) matches ${pattern.name} patterns.`;
    } else if (userRatio < min) {
      const target = ((min + max) / 2 * 100).toFixed(0);
      return `💡 Consider increasing whitespace to ${target}% for ${pattern.name} aesthetic.`;
    } else {
      const target = ((min + max) / 2 * 100).toFixed(0);
      return `💡 You have extra whitespace. This is premium, but ${target}% would match ${pattern.name} patterns.`;
    }
  },
  
  /**
   * Generate complexity recommendation
   */
  getComplexityRecommendation(userScore, min, max, pattern) {
    if (userScore >= min && userScore <= max) {
      return `✅ Perfect! Your complexity (${(userScore * 100).toFixed(0)}/100) matches ${pattern.name} patterns.`;
    } else if (userScore < min) {
      return `💡 Your design is simpler than ${pattern.name}. This can be good for focus.`;
    } else {
      return `💡 Your design is more complex than ${pattern.name}. Consider simplifying for clarity.`;
    }
  },
  
  /**
   * Generate image/text recommendation
   */
  getImageTextRecommendation(userRatio, pattern) {
    const imageDiff = userRatio.image - pattern.averageImageRatio;
    
    if (Math.abs(imageDiff) < 0.1) {
      return `✅ Perfect! Your image/text balance matches ${pattern.name} patterns.`;
    } else if (imageDiff > 0.2) {
      return `💡 Very image-heavy compared to ${pattern.name}. Consider adding more text if needed.`;
    } else if (imageDiff < -0.2) {
      return `💡 More text-focused than ${pattern.name}. This can work well for content-rich sites.`;
    } else {
      return `✅ Close to ${pattern.name} balance.`;
    }
  },
  
  /**
   * Determine overall page archetype from all matches
   */
  determinePageArchetype(colorMatch, dimensionalMatches) {
    const ws = dimensionalMatches.whitespace;
    const cx = dimensionalMatches.complexity;
    const it = dimensionalMatches.imageText;
    
    // High-level archetype based on multi-dimensional analysis
    if (ws && cx && it) {
      if (ws.userRatio > 0.6 && cx.userScore < 0.4 && it.userRatio.image > 0.7) {
        return 'Premium Visual-First';
      } else if (ws.userRatio > 0.45 && cx.userScore < 0.6 && it.userRatio.text > 0.3) {
        return 'Professional Balanced';
      } else if (it.userRatio.text > 0.4 && cx.userScore > 0.5) {
        return 'Content-Rich Editorial';
      } else if (it.userRatio.image > 0.6 && cx.userScore > 0.6) {
        return 'Visual Showcase';
      }
    }
    
    // Fallback to color-based if we don't have full dimensions
    if (colorMatch) {
      return colorMatch.pattern + ' Style';
    }
    
    return 'Custom/Unique';
  },
  
  /**
   * Generate dimensional recommendations
   */
  generateDimensionalRecommendations(colorMatch, dimensionalMatches, page) {
    const recommendations = [];
    
    if (colorMatch && colorMatch.similarity > 0.8) {
      recommendations.push({
        type: 'color',
        priority: 'low',
        message: `Strong color match with ${colorMatch.pattern} (${(colorMatch.similarity * 100).toFixed(0)}%)`
      });
    }
    
    if (dimensionalMatches.whitespace) {
      const ws = dimensionalMatches.whitespace;
      if (ws.similarity < 0.7) {
        recommendations.push({
          type: 'whitespace',
          priority: 'medium',
          message: ws.recommendation
        });
      }
    }
    
    if (dimensionalMatches.complexity) {
      const cx = dimensionalMatches.complexity;
      if (cx.similarity < 0.7) {
        recommendations.push({
          type: 'complexity',
          priority: 'low',
          message: cx.recommendation
        });
      }
    }
    
    if (dimensionalMatches.imageText) {
      const it = dimensionalMatches.imageText;
      if (it.similarity < 0.7) {
        recommendations.push({
          type: 'imageText',
          priority: 'low',
          message: it.recommendation
        });
      }
    }
    
    return recommendations;
  },
  
  /**
   * Generate multi-dimensional summary
   */
  generateMultiDimensionalSummary(matches) {
    if (matches.length === 0) return 'No patterns matched';
    
    const firstMatch = matches[0];
    const parts = [];
    
    if (firstMatch.colorMatch) {
      parts.push(`Colors: ${firstMatch.colorMatch.pattern}`);
    }
    
    if (firstMatch.dimensionalMatches.whitespace) {
      parts.push(`Whitespace: ${firstMatch.dimensionalMatches.whitespace.pattern}`);
    }
    
    if (firstMatch.dimensionalMatches.complexity) {
      parts.push(`Complexity: ${firstMatch.dimensionalMatches.complexity.pattern}`);
    }
    
    if (firstMatch.dimensionalMatches.imageText) {
      parts.push(`Content: ${firstMatch.dimensionalMatches.imageText.pattern}`);
    }
    
    if (firstMatch.overallArchetype && firstMatch.overallArchetype !== 'Custom/Unique') {
      return `Overall: ${firstMatch.overallArchetype} (${parts.join(', ')})`;
    }
    
    return parts.length > 0 ? parts.join(' | ') : 'Custom design (no strong pattern matches)';
  },
  
  /**
   * Find latest pattern report
   */
  async findLatestPatternReport() {
    try {
      const fs = await import('fs');
      const path = await import('path');
      const reportsDir = 'docs/visual-design-audits';
      
      // Find all pattern learning reports
      const dirs = await fs.promises.readdir(reportsDir);
      const reportFiles = [];
      
      for (const dir of dirs) {
        const reportPath = path.join(reportsDir, dir, 'pattern-learning.json');
        try {
          await fs.promises.access(reportPath);
          reportFiles.push(reportPath);
        } catch {
          // File doesn't exist, skip
        }
      }
      
      // Return most recent
      if (reportFiles.length > 0) {
        reportFiles.sort().reverse();
        return reportFiles[0];
      }
      
      return null;
    } catch (error) {
      return null;
    }
  },
  
  /**
   * Generate comprehensive source analytics report
   * Option 4: Source Verification & Analytics
   */
  async generateSourceAnalyticsReport(summaryData = {}) {
    const fs = await import('fs');
    const path = await import('path');
    
    // Aggregate analytics from all sources
    const sourceStats = {
      dribbble: { attempted: 0, successful: 0, failed: 0, duration: 0, scrolls: 0, errors: [] },
      awwwards: { attempted: 0, successful: 0, failed: 0, duration: 0, scrolls: 0, errors: [] },
      siteinspire: { attempted: 0, successful: 0, failed: 0, duration: 0, scrolls: 0, errors: [] },
      behance: { attempted: 0, successful: 0, failed: 0, duration: 0, scrolls: 0, errors: [] }
    };
    
    // Process analytics from each source
    for (const analytics of this._sourceAnalytics || []) {
      const source = analytics.source;
      if (sourceStats[source]) {
        sourceStats[source].attempted += analytics.extractionAttempts || 0;
        sourceStats[source].successful += analytics.successfulExtractions || 0;
        sourceStats[source].failed += analytics.failedExtractions || 0;
        sourceStats[source].duration += analytics.duration || 0;
        sourceStats[source].scrolls += analytics.scrollAttempts || 0;
        sourceStats[source].errors.push(...analytics.errors);
      }
    }
    
    // Calculate metrics for each source
    const sourceMetrics = {};
    for (const [source, stats] of Object.entries(sourceStats)) {
      const successRate = stats.attempted > 0 ? (stats.successful / stats.attempted * 100) : 0;
      const avgExtractionTime = stats.successful > 0 ? (stats.duration / stats.successful) : 0;
      const designsPerMinute = stats.duration > 0 ? (stats.successful / (stats.duration / 1000 / 60)) : 0;
      
      sourceMetrics[source] = {
        ...stats,
        successRate: parseFloat(successRate.toFixed(1)),
        avgExtractionTime: parseFloat((avgExtractionTime / 1000).toFixed(2)),
        designsPerMinute: parseFloat(designsPerMinute.toFixed(1)),
        contribution: summaryData.totalDesigns > 0 ? 
          parseFloat((stats.successful / summaryData.totalDesigns * 100).toFixed(1)) : 0,
        weight: this.config.dataSources[source]?.weight || 1.0,
        reputation: this.config.dataSources[source]?.reputation || 'unknown',
        health: this.calculateSourceHealth(stats, successRate)
      };
    }
    
    // Create analytics report
    const report = {
      meta: {
        generated: new Date().toISOString(),
        version: '1.0.0',
        reportType: 'source-analytics'
      },
      summary: {
        totalSources: Object.keys(sourceStats).filter(s => sourceStats[s].attempted > 0).length,
        totalDesigns: summaryData.totalDesigns || 0,
        totalDuration: summaryData.totalDuration || 0,
        averageSuccessRate: parseFloat((
          Object.values(sourceMetrics).reduce((sum, m) => sum + m.successRate, 0) / 
          Object.values(sourceMetrics).length
        ).toFixed(1)),
        breakdown: summaryData.sourceBreakdown || {}
      },
      sources: sourceMetrics,
      recommendations: this.generateSourceRecommendations(sourceMetrics),
      healthChecks: {
        allSourcesOperational: Object.values(sourceMetrics).every(m => m.health !== 'critical'),
        sourcesWithWarnings: Object.entries(sourceMetrics)
          .filter(([, m]) => m.health === 'warning')
          .map(([source]) => source),
        sourcesFailed: Object.entries(sourceMetrics)
          .filter(([, m]) => m.health === 'critical')
          .map(([source]) => source)
      },
      rawAnalytics: this._sourceAnalytics || []
    };
    
    // Save report
    const timestamp = new Date().toISOString().split('T')[0];
    const reportDir = `docs/visual-design-audits/${timestamp}`;
    await fs.promises.mkdir(reportDir, { recursive: true });
    
    const reportPath = path.join(reportDir, 'source-analytics.json');
    await fs.promises.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    // Generate markdown report
    const markdownReport = this.generateSourceAnalyticsMarkdown(report);
    const markdownPath = path.join(reportDir, 'source-analytics.md');
    await fs.promises.writeFile(markdownPath, markdownReport);
    
    console.log('\n📊 Source Analytics Report Generated');
    console.log(`   📁 JSON: ${reportPath}`);
    console.log(`   📄 Markdown: ${markdownPath}`);
    console.log(`\n   🏆 Best performer: ${this.findBestSource(sourceMetrics)}`);
    console.log(`   ⚠️  Sources with warnings: ${report.healthChecks.sourcesWithWarnings.length}`);
    
    return report;
  },
  
  /**
   * Calculate source health status
   */
  calculateSourceHealth(stats, successRate) {
    // Critical: Failed to extract any designs
    if (stats.successful === 0 && stats.attempted > 0) {
      return 'critical';
    }
    
    // Critical: Success rate below 50%
    if (successRate < 50) {
      return 'critical';
    }
    
    // Warning: Success rate below 80%
    if (successRate < 80) {
      return 'warning';
    }
    
    // Warning: Lots of errors
    if (stats.errors.length > 5) {
      return 'warning';
    }
    
    return 'healthy';
  },
  
  /**
   * Generate source recommendations
   */
  generateSourceRecommendations(sourceMetrics) {
    const recommendations = [];
    
    for (const [source, metrics] of Object.entries(sourceMetrics)) {
      if (metrics.health === 'critical') {
        recommendations.push({
          source,
          severity: 'high',
          issue: 'Source not functioning properly',
          action: 'Review selectors and test manually. May need selector updates.',
          details: `Success rate: ${metrics.successRate}%, Extracted: ${metrics.successful}/${metrics.attempted}`
        });
      } else if (metrics.health === 'warning') {
        recommendations.push({
          source,
          severity: 'medium',
          issue: 'Below optimal performance',
          action: 'Consider improving selectors for better extraction rate.',
          details: `Success rate: ${metrics.successRate}%, ${metrics.errors.length} errors`
        });
      } else if (metrics.contribution < 10 && metrics.health === 'healthy') {
        recommendations.push({
          source,
          severity: 'low',
          issue: 'Low contribution to pattern library',
          action: 'Consider increasing limit or improving source weight.',
          details: `Contributing only ${metrics.contribution}% of total designs`
        });
      }
    }
    
    // Add opportunities
    const bestSource = this.findBestSource(sourceMetrics);
    if (bestSource) {
      recommendations.push({
        source: bestSource,
        severity: 'info',
        issue: 'Best performing source',
        action: 'Consider prioritizing this source or increasing its limit.',
        details: `Highest success rate and contribution`
      });
    }
    
    return recommendations;
  },
  
  /**
   * Find best performing source
   */
  findBestSource(sourceMetrics) {
    let best = null;
    let bestScore = 0;
    
    for (const [source, metrics] of Object.entries(sourceMetrics)) {
      // Score based on success rate and contribution
      const score = metrics.successRate * 0.6 + metrics.contribution * 0.4;
      if (score > bestScore) {
        bestScore = score;
        best = source;
      }
    }
    
    return best;
  },
  
  /**
   * Generate markdown report for source analytics
   */
  generateSourceAnalyticsMarkdown(report) {
    const { summary, sources, recommendations, healthChecks } = report;
    
    let md = `# Source Analytics Report\n\n`;
    md += `**Generated:** ${new Date(report.meta.generated).toLocaleString()}\n`;
    md += `**Report Type:** Source Verification & Performance Analysis\n\n`;
    md += `---\n\n`;
    
    md += `## 📊 Summary\n\n`;
    md += `| Metric | Value |\n`;
    md += `|--------|-------|\n`;
    md += `| Total Sources | ${summary.totalSources} |\n`;
    md += `| Total Designs | ${summary.totalDesigns} |\n`;
    md += `| Total Duration | ${(summary.totalDuration / 1000).toFixed(1)}s |\n`;
    md += `| Avg Success Rate | ${summary.averageSuccessRate}% |\n`;
    md += `| Dribbble | ${summary.breakdown.dribbble || 0} designs |\n`;
    md += `| Awwwards | ${summary.breakdown.awwwards || 0} designs |\n`;
    md += `| SiteInspire | ${summary.breakdown.siteinspire || 0} designs |\n\n`;
    
    md += `## 🏥 Health Status\n\n`;
    md += `| Status | Result |\n`;
    md += `|--------|--------|\n`;
    md += `| All Sources Operational | ${healthChecks.allSourcesOperational ? '✅ Yes' : '❌ No'} |\n`;
    md += `| Sources with Warnings | ${healthChecks.sourcesWithWarnings.length > 0 ? '⚠️ ' + healthChecks.sourcesWithWarnings.join(', ') : '✅ None'} |\n`;
    md += `| Sources Failed | ${healthChecks.sourcesFailed.length > 0 ? '❌ ' + healthChecks.sourcesFailed.join(', ') : '✅ None'} |\n\n`;
    
    md += `## 📈 Source Performance\n\n`;
    for (const [source, metrics] of Object.entries(sources)) {
      const healthEmoji = metrics.health === 'healthy' ? '✅' : metrics.health === 'warning' ? '⚠️' : '❌';
      md += `### ${healthEmoji} ${source.charAt(0).toUpperCase() + source.slice(1)}\n\n`;
      md += `| Metric | Value |\n`;
      md += `|--------|-------|\n`;
      md += `| Extraction Attempts | ${metrics.attempted} |\n`;
      md += `| Successful | ${metrics.successful} |\n`;
      md += `| Failed | ${metrics.failed} |\n`;
      md += `| **Success Rate** | **${metrics.successRate}%** |\n`;
      md += `| Duration | ${(metrics.duration / 1000).toFixed(1)}s |\n`;
      md += `| Avg Time per Design | ${metrics.avgExtractionTime}s |\n`;
      md += `| Extraction Rate | ${metrics.designsPerMinute} designs/min |\n`;
      md += `| Scroll Attempts | ${metrics.scrolls} |\n`;
      md += `| **Contribution** | **${metrics.contribution}%** |\n`;
      md += `| Weight | ${metrics.weight}x |\n`;
      md += `| Reputation | ${metrics.reputation} |\n`;
      md += `| Health Status | ${metrics.health} |\n`;
      md += `| Errors | ${metrics.errors.length} |\n\n`;
    }
    
    md += `## 💡 Recommendations\n\n`;
    if (recommendations.length === 0) {
      md += `✅ All sources are performing optimally!\n\n`;
    } else {
      for (const rec of recommendations) {
        const severityEmoji = rec.severity === 'high' ? '🔴' : rec.severity === 'medium' ? '🟡' : rec.severity === 'low' ? '🔵' : 'ℹ️';
        md += `### ${severityEmoji} ${rec.source.charAt(0).toUpperCase() + rec.source.slice(1)}\n\n`;
        md += `**Issue:** ${rec.issue}\n\n`;
        md += `**Action:** ${rec.action}\n\n`;
        md += `**Details:** ${rec.details}\n\n`;
        md += `---\n\n`;
      }
    }
    
    md += `## 🎯 Next Steps\n\n`;
    md += `1. Review sources with warnings or failures\n`;
    md += `2. Test selectors on live sites if extraction rate is low\n`;
    md += `3. Adjust limits based on source contribution\n`;
    md += `4. Consider adding more sources (Behance, Muzli, etc.)\n`;
    md += `5. Monitor this report over time to track improvements\n\n`;
    
    return md;
  },
  
  /**
   * Calculate color similarity (0-1)
   */
  calculateColorSimilarity(hex1, hex2) {
    const rgb1 = this.hexToRgb(hex1);
    const rgb2 = this.hexToRgb(hex2);
    
    // Euclidean distance in RGB space
    const distance = Math.sqrt(
      Math.pow(rgb1[0] - rgb2[0], 2) +
      Math.pow(rgb1[1] - rgb2[1], 2) +
      Math.pow(rgb1[2] - rgb2[2], 2)
    );
    
    // Normalize to 0-1 (max distance is ~441)
    const maxDistance = Math.sqrt(3 * Math.pow(255, 2));
    const similarity = 1 - (distance / maxDistance);
    
    return parseFloat(similarity.toFixed(3));
  },
  
  /**
   * Check brand consistency across pages
   */
  async checkConsistency(colorData) {
    if (colorData.length < 2) {
      return {
        score: 10,
        message: 'Single page - consistency N/A'
      };
    }
    
    const palettes = colorData.map(p => p.palette);
    
    // Check if primary colors match
    const primaries = palettes.map(p => p.primary).filter(Boolean);
    const uniquePrimaries = new Set(primaries);
    
    // Check if accents match
    const accents = palettes.map(p => p.accent).filter(Boolean);
    const uniqueAccents = new Set(accents);
    
    // Calculate consistency score
    const primaryConsistency = uniquePrimaries.size === 1 ? 5 : 0;
    const accentConsistency = uniqueAccents.size === 1 ? 5 : 0;
    const score = primaryConsistency + accentConsistency;
    
    const issues = [];
    
    if (uniquePrimaries.size > 1) {
      issues.push({
        type: 'primary_mismatch',
        colors: Array.from(uniquePrimaries),
        pages: colorData.map(p => p.path),
        recommendation: 'Unify primary color across all pages for brand consistency'
      });
    }
    
    if (uniqueAccents.size > 1) {
      issues.push({
        type: 'accent_mismatch',
        colors: Array.from(uniqueAccents),
        pages: colorData.map(p => p.path),
        recommendation: 'Unify accent color across all pages'
      });
    }
    
    return {
      score,
      issues,
      message: score === 10 
        ? 'Perfect brand consistency' 
        : `${issues.length} consistency issue${issues.length > 1 ? 's' : ''} found`
    };
  },
  
  /**
   * Analyze typography hierarchy and readability
   */
  async analyzeTypography(page, targetPath) {
    console.log('📝 Analyzing typography...');
    
    try {
      const typography = await mcp_cursor_browser_evaluate({
        function: `() => {
          const results = {
            hierarchy: {},
            body: {},
            scaleRatio: null,
            readability: {},
            fontStack: []
          };
          
          // Analyze heading hierarchy
          ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].forEach(tag => {
            const el = document.querySelector(tag);
            if (el) {
              const styles = getComputedStyle(el);
              results.hierarchy[tag] = {
                size: parseInt(styles.fontSize),
                weight: parseInt(styles.fontWeight),
                lineHeight: parseFloat(styles.lineHeight) / parseInt(styles.fontSize),
                letterSpacing: styles.letterSpacing,
                fontFamily: styles.fontFamily.split(',')[0].replace(/['"]/g, '')
              };
            }
          });
          
          // Analyze body text
          const bodyEl = document.querySelector('p, body');
          if (bodyEl) {
            const styles = getComputedStyle(bodyEl);
            results.body = {
              size: parseInt(styles.fontSize),
              weight: parseInt(styles.fontWeight),
              lineHeight: parseFloat(styles.lineHeight) / parseInt(styles.fontSize),
              fontFamily: styles.fontFamily.split(',')[0].replace(/['"]/g, '')
            };
          }
          
          // Calculate modular scale ratio (h1 to h2)
          if (results.hierarchy.h1 && results.hierarchy.h2) {
            results.scaleRatio = (results.hierarchy.h1.size / results.hierarchy.h2.size).toFixed(2);
          }
          
          // Readability metrics
          const bodyText = document.querySelector('p');
          if (bodyText) {
            const rect = bodyText.getBoundingClientRect();
            const charWidth = parseInt(getComputedStyle(bodyText).fontSize) * 0.5;
            results.readability = {
              bodySize: parseInt(getComputedStyle(bodyText).fontSize),
              lineLength: Math.round(rect.width / charWidth),
              lineHeight: parseFloat(getComputedStyle(bodyText).lineHeight) / parseInt(getComputedStyle(bodyText).fontSize)
            };
          }
          
          // Font stack
          if (bodyEl) {
            results.fontStack = getComputedStyle(bodyEl).fontFamily
              .split(',')
              .map(f => f.trim().replace(/['"]/g, ''))
              .slice(0, 3);
          }
          
          return results;
        }`
      });
      
      // Analyze against best practices
      const analysis = {
        ...typography,
        scores: {},
        issues: [],
        strengths: []
      };
      
      // Score hierarchy
      if (typography.hierarchy.h1) {
        const h1Size = typography.hierarchy.h1.size;
        if (h1Size >= 48 && h1Size <= 72) {
          analysis.scores.headlineSize = 10;
          analysis.strengths.push('Optimal h1 size (48-72px)');
        } else if (h1Size >= 36 && h1Size < 48) {
          analysis.scores.headlineSize = 7;
          analysis.issues.push({
            type: 'typography',
            severity: 'medium',
            issue: `H1 size (${h1Size}px) below optimal range`,
            recommendation: 'Increase to 48-72px for stronger visual hierarchy'
          });
        } else {
          analysis.scores.headlineSize = 5;
          analysis.issues.push({
            type: 'typography',
            severity: 'high',
            issue: `H1 size (${h1Size}px) needs adjustment`,
            recommendation: 'Set to 48-72px for optimal impact'
          });
        }
      }
      
      // Score scale ratio
      if (typography.scaleRatio) {
        const ratio = parseFloat(typography.scaleRatio);
        if (ratio >= 1.4 && ratio <= 1.6) {
          analysis.scores.scaleRatio = 10;
          analysis.strengths.push(`Excellent scale ratio (${ratio})`);
        } else if (ratio >= 1.2 && ratio < 1.4) {
          analysis.scores.scaleRatio = 7;
        } else {
          analysis.scores.scaleRatio = 5;
          analysis.issues.push({
            type: 'typography',
            severity: 'low',
            issue: `Scale ratio ${ratio} outside optimal range`,
            recommendation: 'Consider 1.4-1.6 (near golden ratio)'
          });
        }
      }
      
      // Score readability
      if (typography.readability.bodySize) {
        if (typography.readability.bodySize >= 16 && typography.readability.bodySize <= 18) {
          analysis.scores.bodySize = 10;
          analysis.strengths.push(`Optimal body size (${typography.readability.bodySize}px)`);
        } else if (typography.readability.bodySize < 16) {
          analysis.scores.bodySize = 6;
          analysis.issues.push({
            type: 'typography',
            severity: 'medium',
            issue: `Body text too small (${typography.readability.bodySize}px)`,
            recommendation: 'Increase to 16-18px for better readability'
          });
        } else {
          analysis.scores.bodySize = 8;
        }
      }
      
      if (typography.readability.lineHeight) {
        if (typography.readability.lineHeight >= 1.5 && typography.readability.lineHeight <= 1.7) {
          analysis.scores.lineHeight = 10;
          analysis.strengths.push('Optimal line height (1.5-1.7)');
        } else {
          analysis.scores.lineHeight = 7;
          analysis.issues.push({
            type: 'typography',
            severity: 'low',
            issue: `Line height ${typography.readability.lineHeight.toFixed(1)} outside optimal`,
            recommendation: 'Set to 1.5-1.7 for comfortable reading'
          });
        }
      }
      
      // Calculate overall score
      const scores = Object.values(analysis.scores);
      analysis.overallScore = scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0;
      
      console.log(`✅ Typography score: ${analysis.overallScore}/10`);
      
      return analysis;
      
    } catch (error) {
      console.error('❌ Typography analysis error:', error.message);
      return {
        hierarchy: {},
        body: {},
        scores: {},
        issues: [{ type: 'error', message: error.message }],
        strengths: [],
        overallScore: 0
      };
    }
  },
  
  /**
   * Analyze spacing and white space
   */
  async analyzeSpacing(page, targetPath) {
    console.log('📏 Analyzing spacing...');
    
    try {
      const spacing = await mcp_cursor_browser_evaluate({
        function: `() => {
          const results = {
            sections: [],
            density: {},
            rhythm: {},
            cramped: []
          };
          
          // Analyze section spacing
          const sections = document.querySelectorAll('section, .section, main > div');
          sections.forEach((section, idx) => {
            const styles = getComputedStyle(section);
            const paddingTop = parseInt(styles.paddingTop);
            const paddingBottom = parseInt(styles.paddingBottom);
            const marginTop = parseInt(styles.marginTop);
            const marginBottom = parseInt(styles.marginBottom);
            
            results.sections.push({
              index: idx,
              paddingTop,
              paddingBottom,
              marginTop,
              marginBottom,
              totalVertical: paddingTop + paddingBottom + marginTop + marginBottom
            });
          });
          
          // Calculate density (elements per viewport)
          const viewportHeight = window.innerHeight;
          const allElements = document.querySelectorAll('h1, h2, h3, p, button, img');
          const aboveFold = Array.from(allElements).filter(el => {
            const rect = el.getBoundingClientRect();
            return rect.top >= 0 && rect.top < viewportHeight;
          });
          
          results.density = {
            elementsPerScreen: aboveFold.length,
            totalElements: allElements.length,
            score: aboveFold.length <= 8 ? 1.0 : (aboveFold.length <= 12 ? 0.7 : 0.4)
          };
          
          // Check for cramped areas (elements too close together)
          const headers = document.querySelectorAll('h1, h2, h3');
          headers.forEach((h, idx) => {
            const next = headers[idx + 1];
            if (next) {
              const hRect = h.getBoundingClientRect();
              const nextRect = next.getBoundingClientRect();
              const gap = nextRect.top - hRect.bottom;
              
              if (gap < 32) {
                results.cramped.push({
                  element1: h.tagName,
                  element2: next.tagName,
                  gap: Math.round(gap),
                  recommended: 64
                });
              }
            }
          });
          
          // Detect vertical rhythm
          if (results.sections.length > 0) {
            const spacings = results.sections.map(s => s.totalVertical);
            const avg = spacings.reduce((a, b) => a + b, 0) / spacings.length;
            const variance = spacings.reduce((sum, s) => sum + Math.pow(s - avg, 2), 0) / spacings.length;
            const stdDev = Math.sqrt(variance);
            
            results.rhythm = {
              average: Math.round(avg),
              consistency: stdDev < 32 ? 'high' : stdDev < 64 ? 'medium' : 'low',
              stdDev: Math.round(stdDev)
            };
          }
          
          return results;
        }`
      });
      
      // Analyze against best practices
      const analysis = {
        ...spacing,
        scores: {},
        issues: [],
        strengths: []
      };
      
      // Score section spacing
      if (spacing.rhythm?.average) {
        if (spacing.rhythm.average >= 96 && spacing.rhythm.average <= 128) {
          analysis.scores.sectionSpacing = 10;
          analysis.strengths.push(`Excellent section spacing (${spacing.rhythm.average}px ≈ 6-8rem)`);
        } else if (spacing.rhythm.average >= 64) {
          analysis.scores.sectionSpacing = 8;
          analysis.strengths.push(`Good section spacing (${spacing.rhythm.average}px)`);
        } else {
          analysis.scores.sectionSpacing = 6;
          analysis.issues.push({
            type: 'spacing',
            severity: 'medium',
            issue: `Section spacing too tight (${spacing.rhythm.average}px)`,
            recommendation: 'Increase to 96-128px (6-8rem) for premium feel'
          });
        }
      }
      
      // Score density
      if (spacing.density?.score) {
        analysis.scores.density = spacing.density.score * 10;
        if (spacing.density.score >= 0.9) {
          analysis.strengths.push(`Low density (${spacing.density.elementsPerScreen} elements above fold)`);
        } else if (spacing.density.score < 0.7) {
          analysis.issues.push({
            type: 'spacing',
            severity: 'medium',
            issue: `High density (${spacing.density.elementsPerScreen} elements above fold)`,
            recommendation: 'Reduce to 8-12 elements for better focus'
          });
        }
      }
      
      // Score rhythm consistency
      if (spacing.rhythm?.consistency) {
        analysis.scores.consistency = spacing.rhythm.consistency === 'high' ? 10 
          : spacing.rhythm.consistency === 'medium' ? 7 : 5;
        
        if (spacing.rhythm.consistency === 'high') {
          analysis.strengths.push('Consistent vertical rhythm');
        } else {
          analysis.issues.push({
            type: 'spacing',
            severity: 'low',
            issue: `Inconsistent spacing (σ=${spacing.rhythm.stdDev}px)`,
            recommendation: 'Use consistent spacing units (8px grid)'
          });
        }
      }
      
      // Score cramped areas
      if (spacing.cramped?.length === 0) {
        analysis.scores.cramped = 10;
        analysis.strengths.push('No cramped areas detected');
      } else {
        analysis.scores.cramped = Math.max(5, 10 - spacing.cramped.length * 2);
        spacing.cramped.forEach(c => {
          analysis.issues.push({
            type: 'spacing',
            severity: 'low',
            issue: `${c.element1} and ${c.element2} too close (${c.gap}px)`,
            recommendation: `Increase gap to ${c.recommended}px`
          });
        });
      }
      
      // Calculate overall score
      const scores = Object.values(analysis.scores);
      analysis.overallScore = scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0;
      
      console.log(`✅ Spacing score: ${analysis.overallScore}/10`);
      
      return analysis;
      
    } catch (error) {
      console.error('❌ Spacing analysis error:', error.message);
      return {
        sections: [],
        density: {},
        rhythm: {},
        scores: {},
        issues: [{ type: 'error', message: error.message }],
        strengths: [],
        overallScore: 0
      };
    }
  },
  
  /**
   * Analyze layout composition
   */
  async analyzeLayout(page, targetPath) {
    console.log('📐 Analyzing layout composition...');
    
    try {
      const layout = await mcp_cursor_browser_evaluate({
        function: `() => {
          const results = {
            viewport: {},
            hero: {},
            grid: {},
            balance: {}
          };
          
          const viewportHeight = window.innerHeight;
          const viewportWidth = window.innerWidth;
          
          // Analyze hero section
          const hero = document.querySelector('.hero, header.hero, section:first-of-type, main > *:first-child');
          if (hero) {
            const heroRect = hero.getBoundingClientRect();
            results.hero = {
              height: Math.round(heroRect.height),
              ratio: (heroRect.height / viewportHeight).toFixed(2),
              position: heroRect.top === 0 ? 'top' : 'below-fold'
            };
            
            // Check for overlay/gradient
            const styles = getComputedStyle(hero);
            results.hero.background = styles.background || styles.backgroundColor;
            results.hero.hasOverlay = styles.background.includes('gradient') || 
                                      styles.background.includes('linear');
          }
          
          // Detect grid system
          const containers = document.querySelectorAll('[class*="container"], main, section');
          const gridDetected = Array.from(containers).some(el => {
            const styles = getComputedStyle(el);
            return styles.display === 'grid' || styles.display === 'flex';
          });
          
          results.grid = {
            detected: gridDetected,
            type: gridDetected ? 'modern' : 'traditional'
          };
          
          // Calculate visual balance (content distribution)
          const allElements = document.querySelectorAll('h1, h2, h3, p, img, button');
          const aboveFold = Array.from(allElements).filter(el => {
            const rect = el.getBoundingClientRect();
            return rect.top >= 0 && rect.top < viewportHeight;
          });
          const belowFold = allElements.length - aboveFold.length;
          
          results.balance = {
            aboveFold: aboveFold.length,
            belowFold: belowFold,
            ratio: (aboveFold.length / allElements.length).toFixed(2),
            type: aboveFold.length / allElements.length > 0.6 ? 'top-heavy' : 
                  aboveFold.length / allElements.length < 0.4 ? 'bottom-heavy' : 'balanced'
          };
          
          results.viewport = {
            width: viewportWidth,
            height: viewportHeight
          };
          
          return results;
        }`
      });
      
      // Analyze against best practices
      const analysis = {
        ...layout,
        scores: {},
        issues: [],
        strengths: []
      };
      
      // Score hero ratio
      if (layout.hero?.ratio) {
        const ratio = parseFloat(layout.hero.ratio);
        if (ratio >= 0.55 && ratio <= 0.65) {
          analysis.scores.heroRatio = 10;
          analysis.strengths.push(`Optimal hero ratio (${(ratio * 100).toFixed(0)}% of viewport)`);
        } else if (ratio >= 0.4 && ratio < 0.55) {
          analysis.scores.heroRatio = 7;
          analysis.issues.push({
            type: 'layout',
            severity: 'low',
            issue: `Hero section could be larger (${(ratio * 100).toFixed(0)}%)`,
            recommendation: 'Increase to 55-65% for stronger first impression'
          });
        } else if (ratio < 0.4) {
          analysis.scores.heroRatio = 5;
          analysis.issues.push({
            type: 'layout',
            severity: 'medium',
            issue: `Hero section too small (${(ratio * 100).toFixed(0)}%)`,
            recommendation: 'Increase to 55-65% of viewport'
          });
        } else {
          analysis.scores.heroRatio = 8;
        }
      }
      
      // Score balance
      if (layout.balance?.type) {
        if (layout.balance.type === 'top-heavy') {
          analysis.scores.balance = 10;
          analysis.strengths.push('Top-heavy composition (good for landing pages)');
        } else if (layout.balance.type === 'balanced') {
          analysis.scores.balance = 8;
          analysis.strengths.push('Balanced content distribution');
        } else {
          analysis.scores.balance = 6;
          analysis.issues.push({
            type: 'layout',
            severity: 'low',
            issue: 'Bottom-heavy layout',
            recommendation: 'Consider moving key content above fold'
          });
        }
      }
      
      // Score grid system
      if (layout.grid?.detected) {
        analysis.scores.grid = 10;
        analysis.strengths.push('Modern grid/flexbox layout detected');
      } else {
        analysis.scores.grid = 7;
      }
      
      // Calculate overall score
      const scores = Object.values(analysis.scores);
      analysis.overallScore = scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0;
      
      console.log(`✅ Layout score: ${analysis.overallScore}/10`);
      
      return analysis;
      
    } catch (error) {
      console.error('❌ Layout analysis error:', error.message);
      return {
        viewport: {},
        hero: {},
        grid: {},
        scores: {},
        issues: [{ type: 'error', message: error.message }],
        strengths: [],
        overallScore: 0
      };
    }
  },
  
  /**
   * Generate recommendations
   */
  async generateRecommendations(analysis) {
    const recommendations = [];
    
    // Accessibility recommendations
    if (analysis.accessibility.issues.length > 0) {
      analysis.accessibility.issues.forEach((issue, idx) => {
        recommendations.push({
          id: `vda-a11y-${idx + 1}`,
          type: 'accessibility',
          priority: 9.0,
          title: `Fix Low Contrast: ${issue.context}`,
          severity: issue.severity,
          current: issue.recommendation.current,
          recommended: issue.recommendation.target,
          options: issue.recommendation.options,
          impact: 'WCAG AA compliance, better readability, SEO boost',
          effort: { hours: 0.5, complexity: 'low' }
        });
      });
    }
    
    // Brand consistency recommendations
    if (analysis.consistency.issues && analysis.consistency.issues.length > 0) {
      analysis.consistency.issues.forEach((issue, idx) => {
        recommendations.push({
          id: `vda-brand-${idx + 1}`,
          type: 'consistency',
          priority: 7.5,
          title: issue.recommendation,
          current: `Multiple ${issue.type.replace('_', ' ')}: ${issue.colors.join(', ')}`,
          recommended: 'Choose one color and apply consistently',
          impact: '+8% brand recall, professional appearance',
          effort: { hours: 1.0, complexity: 'low' }
        });
      });
    }
    
    // Pattern alignment recommendations
    if (analysis.patternMatch.matches.length > 0) {
      const topMatch = analysis.patternMatch.matches[0];
      recommendations.push({
        id: 'vda-pattern-1',
        type: 'pattern_alignment',
        priority: 6.0,
        title: `Your Colors Match "${topMatch.pattern}" Pattern`,
        current: `${Math.round(topMatch.similarity * 100)}% match`,
        analysis: `Used by ${topMatch.prevalence} of industry`,
        effectiveness: topMatch.effectiveness,
        examples: topMatch.examples,
        impact: 'Aligned with user expectations in your vertical',
        effort: { hours: 0, complexity: 'none' } // Just information
      });
    }
    
    // Typography recommendations
    if (analysis.typography?.issues) {
      analysis.typography.issues.forEach((issue, idx) => {
        if (issue.type === 'typography') {
          recommendations.push({
            id: `vda-typo-${idx + 1}`,
            type: 'typography',
            priority: issue.severity === 'high' ? 8.5 : issue.severity === 'medium' ? 7.0 : 5.5,
            title: issue.issue,
            severity: issue.severity,
            recommended: issue.recommendation,
            impact: '+10% readability, +8% premium perception',
            effort: { hours: 0.5, complexity: 'low' }
          });
        }
      });
    }
    
    // Spacing recommendations
    if (analysis.spacing?.issues) {
      analysis.spacing.issues.forEach((issue, idx) => {
        if (issue.type === 'spacing') {
          recommendations.push({
            id: `vda-space-${idx + 1}`,
            type: 'spacing',
            priority: issue.severity === 'high' ? 8.0 : issue.severity === 'medium' ? 6.5 : 5.0,
            title: issue.issue,
            severity: issue.severity,
            recommended: issue.recommendation,
            impact: '+15% perceived quality, +12% focus',
            effort: { hours: 1.0, complexity: 'low' }
          });
        }
      });
    }
    
    // Layout recommendations
    if (analysis.layout?.issues) {
      analysis.layout.issues.forEach((issue, idx) => {
        if (issue.type === 'layout') {
          recommendations.push({
            id: `vda-layout-${idx + 1}`,
            type: 'layout',
            priority: issue.severity === 'high' ? 7.5 : issue.severity === 'medium' ? 6.0 : 4.5,
            title: issue.issue,
            severity: issue.severity,
            recommended: issue.recommendation,
            impact: '+18% engagement, +8% emotional impact',
            effort: { hours: 2.0, complexity: 'medium' }
          });
        }
      });
    }
    
    return recommendations.sort((a, b) => b.priority - a.priority);
  },
  
  /**
   * Create action manifest
   */
  async createManifest(data) {
    return {
      meta: {
        generatedBy: 'visual-design-analyzer',
        version: this.version,
        analysisDate: new Date().toISOString(),
        pagesAnalyzed: data.colorData.length
      },
      
      colorAnalysis: {
        pages: data.colorData.map(p => ({
          path: p.path,
          palette: p.palette,
          uniqueColors: p.rawColors.unique.length
        })),
        consistency: data.consistency
      },
      
      accessibility: {
        summary: data.accessibility.summary,
        issues: data.accessibility.issues,
        passes: data.accessibility.passes.length
      },
      
      patternMatch: data.patternMatch,
      
      typography: data.typography ? {
        overallScore: data.typography.overallScore,
        issues: data.typography.issues,
        strengths: data.typography.strengths,
        hierarchy: data.typography.hierarchy
      } : null,
      
      spacing: data.spacing ? {
        overallScore: data.spacing.overallScore,
        issues: data.spacing.issues,
        strengths: data.spacing.strengths,
        density: data.spacing.density
      } : null,
      
      layout: data.layout ? {
        overallScore: data.layout.overallScore,
        issues: data.layout.issues,
        strengths: data.layout.strengths,
        hero: data.layout.hero
      } : null,
      
      recommendations: data.recommendations,
      
      // For integration with landing-page-advisor
      integrationHooks: {
        landingPageAdvisor: {
          compatible: true,
          manifestExtensions: {
            visualDesign: {
              primaryColor: data.colorData[0]?.palette.primary,
              accentColor: data.colorData[0]?.palette.accent,
              accessibilityScore: `${data.accessibility.summary.passRate}`,
              brandConsistency: `${data.consistency.score}/10`
            }
          }
        }
      },
      
      // CSS Design Tokens export
      designTokens: this.generateDesignTokens(data.colorData),
      
      // TaskMaster export
      taskMasterExport: {
        tasks: data.recommendations.filter(r => r.effort.hours > 0).map((rec, idx) => ({
          id: `vda-task-${idx + 1}`,
          title: rec.title,
          description: `${rec.current} → ${rec.recommended}`,
          priority: rec.priority > 8 ? 'high' : 'medium',
          status: 'pending',
          estimatedHours: rec.effort.hours,
          tags: ['visual-design', 'accessibility', rec.type]
        })),
        estimatedTotalHours: data.recommendations.reduce((sum, r) => sum + (r.effort.hours || 0), 0)
      }
    };
  },
  
  /**
   * Generate CSS design tokens
   */
  generateDesignTokens(colorData) {
    if (colorData.length === 0) return null;
    
    const firstPage = colorData[0];
    const { palette } = firstPage;
    
    return {
      css: `
/* Design Tokens - Generated by Visual Design Analyzer */
:root {
  --color-primary: ${palette.primary || '#000000'};
  --color-accent: ${palette.accent || '#666666'};
  --color-background: ${palette.background || '#ffffff'};
  --color-text: ${palette.text || '#1a1a1a'};
  
  /* Ensure WCAG AA compliance */
  --color-text-on-primary: #ffffff;
  --color-text-on-accent: #ffffff;
}
      `.trim(),
      
      tailwind: {
        colors: {
          primary: palette.primary || '#000000',
          accent: palette.accent || '#666666',
          background: palette.background || '#ffffff',
          text: palette.text || '#1a1a1a'
        }
      }
    };
  },
  
  /**
   * Save artifacts
   */
  async saveArtifacts(manifest, options) {
    const timestamp = new Date().toISOString().split('T')[0];
    const basePath = options.outputPath || `docs/visual-design-audits/${timestamp}`;
    
    // Ensure directory exists
    await run_terminal_cmd(`mkdir -p ${basePath}`, false);
    
    // Save manifest
    const manifestPath = `${basePath}/visual-manifest.json`;
    await write(manifestPath, JSON.stringify(manifest, null, 2));
    
    // Save human-readable report
    const reportPath = `${basePath}/visual-report.md`;
    await write(reportPath, this.generateReport(manifest));
    
    // Save design tokens
    if (manifest.designTokens) {
      const tokensPath = `${basePath}/design-tokens.css`;
      await write(tokensPath, manifest.designTokens.css);
    }
    
    console.log(`✅ Saved manifest: ${manifestPath}`);
    console.log(`✅ Saved report: ${reportPath}`);
    console.log(`✅ Saved design tokens: ${basePath}/design-tokens.css`);
    
    return basePath;
  },
  
  /**
   * Generate human-readable report
   */
  generateReport(manifest) {
    let report = `# Visual Design Analysis Report\n\n`;
    report += `**Generated:** ${new Date(manifest.meta.analysisDate).toLocaleDateString()}\n`;
    report += `**Pages Analyzed:** ${manifest.meta.pagesAnalyzed}\n\n`;
    
    // Color palette summary
    report += `## Color Palettes\n\n`;
    manifest.colorAnalysis.pages.forEach(page => {
      report += `### ${page.path}\n\n`;
      report += `- **Primary:** ${page.palette.primary || 'Not detected'}\n`;
      report += `- **Accent:** ${page.palette.accent || 'Not detected'}\n`;
      report += `- **Background:** ${page.palette.background || 'Not detected'}\n`;
      report += `- **Text:** ${page.palette.text || 'Not detected'}\n`;
      report += `- **Unique Colors:** ${page.uniqueColors}\n\n`;
    });
    
    // Accessibility summary
    report += `## Accessibility (WCAG)\n\n`;
    report += `**Pass Rate:** ${manifest.accessibility.summary.passRate}\n`;
    report += `**Passing:** ${manifest.accessibility.summary.passing}/${manifest.accessibility.summary.total}\n`;
    report += `**Issues:** ${manifest.accessibility.summary.failing}\n\n`;
    
    if (manifest.accessibility.issues.length > 0) {
      report += `### Issues Found\n\n`;
      manifest.accessibility.issues.forEach((issue, idx) => {
        report += `${idx + 1}. **${issue.context}** (${issue.severity})\n`;
        report += `   - Current: ${issue.recommendation.current}\n`;
        report += `   - Target: ${issue.recommendation.target}\n\n`;
      });
    }
    
    // Brand consistency
    report += `## Brand Consistency\n\n`;
    report += `**Score:** ${manifest.colorAnalysis.consistency.score}/10\n`;
    report += `**Status:** ${manifest.colorAnalysis.consistency.message}\n\n`;
    
    if (manifest.colorAnalysis.consistency.issues?.length > 0) {
      report += `### Issues\n\n`;
      manifest.colorAnalysis.consistency.issues.forEach(issue => {
        report += `- ${issue.recommendation}\n`;
      });
      report += `\n`;
    }
    
    // Pattern matching
    if (manifest.patternMatch.matches.length > 0) {
      report += `## Industry Pattern Match\n\n`;
      const topMatch = manifest.patternMatch.matches[0];
      report += `**Best Match:** ${topMatch.pattern}\n`;
      report += `**Similarity:** ${Math.round(topMatch.similarity * 100)}%\n`;
      report += `**Prevalence:** ${topMatch.prevalence}\n`;
      report += `**Effectiveness:** ${topMatch.effectiveness}\n`;
      report += `**Examples:** ${topMatch.examples.join(', ')}\n\n`;
    }
    
    // Recommendations
    report += `## Recommendations\n\n`;
    manifest.recommendations.forEach((rec, idx) => {
      report += `### ${idx + 1}. ${rec.title}\n\n`;
      report += `**Priority:** ${rec.priority}/10\n`;
      report += `**Type:** ${rec.type}\n`;
      report += `**Effort:** ${rec.effort.hours}h\n`;
      report += `**Impact:** ${rec.impact}\n\n`;
      
      if (rec.current) {
        report += `**Current:** ${rec.current}\n`;
      }
      if (rec.recommended) {
        report += `**Recommended:** ${rec.recommended}\n`;
      }
      report += `\n`;
    });
    
    return report;
  },
  
  // ===== PHASE 2: INDUSTRY PATTERN LEARNING =====
  
  // ===== PHASE 2A: SCREENSHOT ANALYSIS METHODS =====
  
  /**
   * Analyze whitespace ratio from screenshot
   */
  async analyzeWhitespaceRatio(screenshotBuffer) {
    console.log('⬜ Analyzing whitespace ratio...');
    
    try {
      // Use sharp for image processing instead of OpenCV (more reliable in Node.js)
      const sharp = (await import('sharp')).default;
      
      // Get image metadata
      const metadata = await sharp(screenshotBuffer).metadata();
      const width = metadata.width;
      const height = metadata.height;
      
      // Convert to grayscale and get raw pixel data
      const { data, info } = await sharp(screenshotBuffer)
        .grayscale()
        .raw()
        .toBuffer({ resolveWithObject: true });
      
      // Count pixels above threshold (240 = very light, considered whitespace)
      const threshold = 240;
      let whitePixels = 0;
      
      for (let i = 0; i < data.length; i++) {
        if (data[i] >= threshold) {
          whitePixels++;
        }
      }
      
      const totalPixels = width * height;
      const whitespaceRatio = whitePixels / totalPixels;
      
      // Categorize based on industry standards
      const result = {
        ratio: parseFloat(whitespaceRatio.toFixed(3)),
        category: whitespaceRatio < 0.3 ? 'cramped' :
                  whitespaceRatio < 0.5 ? 'balanced' :
                  whitespaceRatio < 0.7 ? 'spacious' : 'minimal',
        premiumFeel: whitespaceRatio > 0.5,
        industryMatch: this.matchWhitespaceToIndustry(whitespaceRatio)
      };
      
      console.log(`   ✅ Whitespace: ${(whitespaceRatio * 100).toFixed(1)}% (${result.category})`);
      
      return result;
      
    } catch (error) {
      console.error('   ❌ Whitespace analysis error:', error.message);
      return {
        ratio: 0,
        category: 'unknown',
        premiumFeel: false,
        industryMatch: { pattern: 'Unknown', examples: [], description: 'Analysis failed' },
        error: error.message
      };
    }
  },
  
  /**
   * Match whitespace ratio to industry patterns
   */
  matchWhitespaceToIndustry(ratio) {
    if (ratio >= 0.60 && ratio <= 0.75) {
      return {
        pattern: 'Luxury/Premium',
        examples: ['Rolex', 'Tesla', 'Apple'],
        description: 'High-end minimalist aesthetic'
      };
    } else if (ratio >= 0.45 && ratio < 0.60) {
      return {
        pattern: 'Professional SaaS',
        examples: ['Notion', 'Linear', 'Stripe'],
        description: 'Clean, focused design'
      };
    } else if (ratio >= 0.30 && ratio < 0.45) {
      return {
        pattern: 'E-commerce',
        examples: ['Amazon', 'Shopify', 'Best Buy'],
        description: 'Content-rich but organized'
      };
    } else {
      return {
        pattern: 'Budget/Dense',
        examples: ['eBay', 'Craigslist', 'Reddit'],
        description: 'Information-dense layout'
      };
    }
  },
  
  /**
   * Analyze visual complexity from screenshot (Phase 2A Step 2)
   */
  async analyzeComplexity(screenshotBuffer) {
    console.log('🔬 Analyzing visual complexity...');
    
    try {
      const sharp = (await import('sharp')).default;
      
      // Get image metadata
      const metadata = await sharp(screenshotBuffer).metadata();
      const width = metadata.width;
      const height = metadata.height;
      const totalPixels = width * height;
      
      // 1. Edge Density (more edges = more visual elements/complexity)
      // Use Sharp's convolve to detect edges (Sobel-like filter)
      const edges = await sharp(screenshotBuffer)
        .greyscale()
        .convolve({
          width: 3,
          height: 3,
          kernel: [-1, -1, -1, -1, 8, -1, -1, -1, -1]
        })
        .raw()
        .toBuffer();
      
      // Count significant edges (pixel value > threshold)
      let edgePixels = 0;
      const edgeThreshold = 50;
      for (let i = 0; i < edges.length; i++) {
        if (edges[i] > edgeThreshold) {
          edgePixels++;
        }
      }
      const edgeDensity = edgePixels / totalPixels;
      
      // 2. Color Complexity (number of distinct colors in palette)
      // Extract colors using node-vibrant directly from buffer
      const { Vibrant } = await import('node-vibrant/node');
      const palette = await Vibrant.from(screenshotBuffer).getPalette();
      const colorComplexity = Object.values(palette).filter(Boolean).length;
      
      // 3. Contrast Variance (high variance = lots of different tones)
      const { data: grayData } = await sharp(screenshotBuffer)
        .greyscale()
        .raw()
        .toBuffer({ resolveWithObject: true });
      
      // Calculate standard deviation of grayscale values
      const mean = grayData.reduce((sum, val) => sum + val, 0) / grayData.length;
      const variance = grayData.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / grayData.length;
      const stdDev = Math.sqrt(variance);
      const contrastVariance = stdDev / 255; // Normalize to 0-1
      
      // 4. Calculate overall complexity score (weighted combination)
      const complexityScore = 
        (edgeDensity * 0.4) +                        // Edge density (40% weight)
        (Math.min(colorComplexity / 10, 1) * 0.3) +  // Color complexity (30% weight)
        (contrastVariance * 0.3);                     // Contrast variance (30% weight)
      
      const result = {
        score: parseFloat(complexityScore.toFixed(3)),
        category: complexityScore < 0.3 ? 'minimalist' :
                  complexityScore < 0.6 ? 'balanced' : 'complex',
        metrics: {
          edgeDensity: parseFloat(edgeDensity.toFixed(3)),
          colorComplexity,
          contrastVariance: parseFloat(contrastVariance.toFixed(3))
        },
        industryMatch: this.matchComplexityToIndustry(complexityScore)
      };
      
      console.log(`   ✅ Complexity: ${(complexityScore * 100).toFixed(1)}/100 (${result.category})`);
      console.log(`      ├─ Edge Density: ${(edgeDensity * 100).toFixed(1)}% → ${(edgeDensity * 0.4 * 100).toFixed(1)}% (40% weight)`);
      console.log(`      ├─ Colors: ${colorComplexity} → ${((Math.min(colorComplexity / 10, 1) * 0.3) * 100).toFixed(1)}% (30% weight)`);
      console.log(`      └─ Contrast: ${(contrastVariance * 100).toFixed(1)}% → ${(contrastVariance * 0.3 * 100).toFixed(1)}% (30% weight)`);
      
      return result;
      
    } catch (error) {
      console.error('   ❌ Complexity analysis error:', error.message);
      return {
        score: 0,
        category: 'unknown',
        metrics: {},
        industryMatch: { pattern: 'Unknown', examples: [], description: 'Analysis failed' },
        error: error.message
      };
    }
  },
  
  /**
   * Match complexity score to industry patterns
   */
  matchComplexityToIndustry(score) {
    if (score < 0.3) {
      return {
        pattern: 'Minimalist Design',
        examples: ['Apple', 'Stripe', 'Linear'],
        description: 'Ultra-clean, focused on single action',
        scoreRange: '0.1-0.3'
      };
    } else if (score < 0.6) {
      return {
        pattern: 'Balanced SaaS',
        examples: ['Notion', 'Figma', 'Slack'],
        description: 'Professional with moderate visual richness',
        scoreRange: '0.3-0.6'
      };
    } else if (score < 0.8) {
      return {
        pattern: 'Rich Content',
        examples: ['Medium', 'NYTimes', 'Netflix'],
        description: 'Editorial/content-heavy design',
        scoreRange: '0.6-0.8'
      };
    } else {
      return {
        pattern: 'Maximum Density',
        examples: ['Amazon', 'Reddit', 'Bloomberg'],
        description: 'Information-dense, complex interfaces',
        scoreRange: '0.8-1.0'
      };
    }
  },
  
  /**
   * Analyze image-to-text ratio from screenshot (Phase 2A Step 3)
   */
  async analyzeImageTextRatio(screenshotBuffer) {
    console.log('🖼️ Analyzing image/text ratio...');
    
    try {
      const sharp = (await import('sharp')).default;
      const Tesseract = await import('tesseract.js');
      
      // Get image dimensions
      const metadata = await sharp(screenshotBuffer).metadata();
      const width = metadata.width;
      const height = metadata.height;
      const totalArea = width * height;
      
      // Detect text regions using OCR
      console.log('   📝 Running OCR text detection...');
      const worker = await Tesseract.createWorker('eng');
      const { data: { words } } = await worker.recognize(screenshotBuffer);
      await worker.terminate();
      
      // Calculate text bounding box area
      let textArea = 0;
      let textRegions = 0;
      
      if (words && words.length > 0) {
        words.forEach(word => {
          if (word.bbox && word.confidence > 60) { // Only count confident detections
            const bbox = word.bbox;
            const boxArea = (bbox.x1 - bbox.x0) * (bbox.y1 - bbox.y0);
            textArea += boxArea;
            textRegions++;
          }
        });
      }
      
      // Calculate ratios
      const textRatio = textArea / totalArea;
      const imageRatio = 1 - textRatio; // Everything else is visual/imagery
      
      // Determine category
      let category;
      if (textRatio > 0.4) {
        category = 'text-heavy';
      } else if (imageRatio > 0.6) {
        category = 'image-heavy';
      } else {
        category = 'balanced';
      }
      
      const result = {
        textRatio: parseFloat(textRatio.toFixed(3)),
        imageRatio: parseFloat(imageRatio.toFixed(3)),
        category,
        textRegions,
        industryMatch: this.matchImageTextToIndustry(textRatio, imageRatio)
      };
      
      console.log(`   ✅ Image/Text: ${(imageRatio * 100).toFixed(1)}% image, ${(textRatio * 100).toFixed(1)}% text (${category})`);
      
      return result;
      
    } catch (error) {
      console.error('   ❌ Image/Text analysis error:', error.message);
      return {
        textRatio: 0,
        imageRatio: 0,
        category: 'unknown',
        textRegions: 0,
        industryMatch: { pattern: 'Unknown', examples: [], description: 'Analysis failed' },
        error: error.message
      };
    }
  },
  
  /**
   * Match image/text ratio to industry patterns
   */
  matchImageTextToIndustry(textRatio, imageRatio) {
    // Industry patterns based on text/image/whitespace balance
    if (textRatio >= 0.50) {
      return {
        pattern: 'Blog/Editorial',
        examples: ['Medium', 'Substack', 'NYTimes'],
        description: 'Text-first, reading-focused content',
        typical: '50-60% text, 15-25% images, 20-30% whitespace'
      };
    } else if (textRatio >= 0.30 && textRatio < 0.50) {
      return {
        pattern: 'Professional SaaS',
        examples: ['Notion', 'Linear', 'Figma'],
        description: 'Balanced text and visual content',
        typical: '30-40% text, 25-35% images, 30-40% whitespace'
      };
    } else if (textRatio >= 0.20 && textRatio < 0.30) {
      return {
        pattern: 'E-commerce',
        examples: ['Amazon', 'Shopify', 'Best Buy'],
        description: 'Product-image focused with supporting text',
        typical: '20-30% text, 50-60% images, 15-25% whitespace'
      };
    } else {
      return {
        pattern: 'Portfolio/Visual-First',
        examples: ['Dribbble', 'Behance', 'Awwwards'],
        description: 'Image-dominant, minimal text',
        typical: '10-20% text, 60-75% images, 10-20% whitespace'
      };
    }
  },
  
  /**
   * Analyze typography scale from screenshot (Phase 2B Step 1)
   * Extracts font sizes from OCR and determines scale type (modular, 8pt, golden ratio, etc.)
   */
  async analyzeTypographyScale(screenshotBuffer) {
    console.log('📐 Analyzing typography scale...');
    
    try {
      const Tesseract = await import('tesseract.js');
      
      // Run OCR with bounding boxes to get text regions and heights
      console.log('   📝 Running OCR for font size detection...');
      const worker = await Tesseract.createWorker('eng');
      const { data: { words } } = await worker.recognize(screenshotBuffer);
      await worker.terminate();
      
      // Extract font sizes (text heights in pixels)
      const fontSizes = [];
      
      if (words && words.length > 0) {
        words.forEach(word => {
          if (word.bbox && word.confidence > 60) { // Only confident detections
            const height = word.bbox.y1 - word.bbox.y0;
            if (height > 8 && height < 200) { // Reasonable text size range
              fontSizes.push(height);
            }
          }
        });
      }
      
      if (fontSizes.length === 0) {
        return {
          sizes: [],
          uniqueSizes: [],
          scaleType: 'Unknown',
          scaleRatio: 0,
          consistency: 0,
          totalTextElements: 0,
          industryMatch: { pattern: 'Unknown', description: 'No text detected' }
        };
      }
      
      // Cluster font sizes into distinct groups (tolerance: ±2px)
      const clusters = this.clusterFontSizes(fontSizes, 2);
      const uniqueSizes = clusters.map(c => c.representative).sort((a, b) => b - a);
      
      // Determine scale type and ratio
      const scaleAnalysis = this.determineTypographyScale(uniqueSizes);
      
      // Calculate consistency (how well sizes fit the detected scale)
      const consistency = this.calculateScaleConsistency(uniqueSizes, scaleAnalysis.scaleType);
      
      const result = {
        sizes: uniqueSizes,
        uniqueSizeCount: uniqueSizes.length,
        scaleType: scaleAnalysis.scaleType,
        scaleRatio: scaleAnalysis.ratio,
        consistency: parseFloat(consistency.toFixed(3)),
        totalTextElements: fontSizes.length,
        industryMatch: this.matchTypographyToIndustry(scaleAnalysis.scaleType, consistency)
      };
      
      console.log(`   ✅ Typography: ${result.scaleType} (${uniqueSizes.length} sizes, ${(consistency * 100).toFixed(0)}% consistent)`);
      
      return result;
      
    } catch (error) {
      console.error('   ❌ Typography scale analysis error:', error.message);
      return {
        sizes: [],
        uniqueSizes: [],
        scaleType: 'Unknown',
        scaleRatio: 0,
        consistency: 0,
        totalTextElements: 0,
        industryMatch: { pattern: 'Unknown', description: 'Analysis failed' },
        error: error.message
      };
    }
  },
  
  /**
   * Cluster font sizes into distinct groups
   */
  clusterFontSizes(sizes, tolerance) {
    const sorted = sizes.slice().sort((a, b) => a - b);
    const clusters = [];
    
    let currentCluster = [sorted[0]];
    
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i] - sorted[i-1] <= tolerance) {
        currentCluster.push(sorted[i]);
      } else {
        // Calculate representative (mean) for cluster
        const mean = currentCluster.reduce((a, b) => a + b, 0) / currentCluster.length;
        clusters.push({
          representative: Math.round(mean),
          count: currentCluster.length
        });
        currentCluster = [sorted[i]];
      }
    }
    
    // Add last cluster
    if (currentCluster.length > 0) {
      const mean = currentCluster.reduce((a, b) => a + b, 0) / currentCluster.length;
      clusters.push({
        representative: Math.round(mean),
        count: currentCluster.length
      });
    }
    
    return clusters;
  },
  
  /**
   * Determine typography scale type from font sizes
   */
  determineTypographyScale(sizes) {
    if (sizes.length < 2) {
      return { scaleType: 'Single Size', ratio: 1.0 };
    }
    
    // Calculate ratios between consecutive sizes
    const ratios = [];
    for (let i = 0; i < sizes.length - 1; i++) {
      if (sizes[i+1] > 0) {
        ratios.push(sizes[i] / sizes[i+1]);
      }
    }
    
    const avgRatio = ratios.reduce((a, b) => a + b, 0) / ratios.length;
    
    // Check for modular scales (common ratios)
    if (Math.abs(avgRatio - 1.25) < 0.1) {
      return { scaleType: 'Modular (1.25 - Major Third)', ratio: 1.25 };
    } else if (Math.abs(avgRatio - 1.333) < 0.1) {
      return { scaleType: 'Modular (1.333 - Perfect Fourth)', ratio: 1.333 };
    } else if (Math.abs(avgRatio - 1.414) < 0.1) {
      return { scaleType: 'Modular (1.414 - Augmented Fourth)', ratio: 1.414 };
    } else if (Math.abs(avgRatio - 1.5) < 0.1) {
      return { scaleType: 'Modular (1.5 - Perfect Fifth)', ratio: 1.5 };
    } else if (Math.abs(avgRatio - 1.618) < 0.1) {
      return { scaleType: 'Modular (1.618 - Golden Ratio)', ratio: 1.618 };
    } else if (Math.abs(avgRatio - 2.0) < 0.2) {
      return { scaleType: 'Doubling Scale (2.0)', ratio: 2.0 };
    }
    
    // Check for 8pt grid system (sizes are multiples of 8)
    const is8ptGrid = sizes.every(size => size % 8 === 0 || size % 8 <= 2);
    if (is8ptGrid) {
      return { scaleType: '8pt Grid System', ratio: avgRatio };
    }
    
    // Check for 4pt grid system
    const is4ptGrid = sizes.every(size => size % 4 === 0 || size % 4 <= 1);
    if (is4ptGrid) {
      return { scaleType: '4pt Grid System', ratio: avgRatio };
    }
    
    // Custom/arbitrary scale
    return { scaleType: 'Custom Scale', ratio: parseFloat(avgRatio.toFixed(3)) };
  },
  
  /**
   * Calculate how consistent the sizes are with the detected scale
   */
  calculateScaleConsistency(sizes, scaleType) {
    if (sizes.length < 2) return 1.0;
    
    // For grid systems, check if all sizes follow the grid
    if (scaleType.includes('8pt Grid')) {
      const conforming = sizes.filter(size => size % 8 === 0 || size % 8 <= 2).length;
      return conforming / sizes.length;
    }
    
    if (scaleType.includes('4pt Grid')) {
      const conforming = sizes.filter(size => size % 4 === 0 || size % 4 <= 1).length;
      return conforming / sizes.length;
    }
    
    // For modular scales, check ratio consistency
    if (scaleType.includes('Modular')) {
      const ratios = [];
      for (let i = 0; i < sizes.length - 1; i++) {
        if (sizes[i+1] > 0) {
          ratios.push(sizes[i] / sizes[i+1]);
        }
      }
      
      const avgRatio = ratios.reduce((a, b) => a + b, 0) / ratios.length;
      const variance = ratios.reduce((sum, r) => sum + Math.pow(r - avgRatio, 2), 0) / ratios.length;
      const stdDev = Math.sqrt(variance);
      
      // Lower standard deviation = more consistent
      return Math.max(0, 1 - (stdDev / avgRatio));
    }
    
    // Default: measure consistency by variance
    const ratios = [];
    for (let i = 0; i < sizes.length - 1; i++) {
      if (sizes[i+1] > 0) {
        ratios.push(sizes[i] / sizes[i+1]);
      }
    }
    
    const avgRatio = ratios.reduce((a, b) => a + b, 0) / ratios.length;
    const variance = ratios.reduce((sum, r) => sum + Math.pow(r - avgRatio, 2), 0) / ratios.length;
    
    return Math.max(0, 1 - variance);
  },
  
  /**
   * Match typography scale to industry patterns
   */
  matchTypographyToIndustry(scaleType, consistency) {
    if (scaleType.includes('Golden Ratio') && consistency > 0.8) {
      return {
        pattern: 'Premium/Luxury',
        examples: ['Apple', 'Stripe', 'Tesla'],
        description: 'Golden ratio scale creates harmonious, elegant hierarchy',
        typical: '1.618 ratio, 90%+ consistency'
      };
    } else if (scaleType.includes('Perfect Fifth') && consistency > 0.8) {
      return {
        pattern: 'Professional SaaS',
        examples: ['Notion', 'Linear', 'Figma'],
        description: 'Perfect fifth (1.5) provides clear, balanced hierarchy',
        typical: '1.5 ratio, 85%+ consistency'
      };
    } else if (scaleType.includes('Perfect Fourth') && consistency > 0.7) {
      return {
        pattern: 'Modern Web',
        examples: ['Medium', 'Vercel', 'GitHub'],
        description: 'Perfect fourth (1.333) is widely used and readable',
        typical: '1.333 ratio, 80%+ consistency'
      };
    } else if (scaleType.includes('8pt Grid')) {
      return {
        pattern: 'Material Design / iOS',
        examples: ['Google', 'Material UI', 'iOS Apps'],
        description: '8pt grid system for consistent spacing and sizing',
        typical: 'Multiples of 8px'
      };
    } else if (scaleType.includes('4pt Grid')) {
      return {
        pattern: 'Precise Design Systems',
        examples: ['Ant Design', 'Chakra UI'],
        description: '4pt grid for fine-grained control',
        typical: 'Multiples of 4px'
      };
    } else if (scaleType.includes('Major Third')) {
      return {
        pattern: 'Compact/Dense',
        examples: ['News sites', 'Dashboards'],
        description: 'Smaller ratio (1.25) for content-dense layouts',
        typical: '1.25 ratio'
      };
    } else if (consistency < 0.5) {
      return {
        pattern: 'Inconsistent/Ad-hoc',
        examples: ['Early-stage startups', 'No design system'],
        description: 'Arbitrary font sizes without clear scale',
        typical: 'Low consistency, needs refinement'
      };
    } else {
      return {
        pattern: 'Custom Scale',
        examples: ['Unique brand systems'],
        description: 'Custom typography scale tailored to brand',
        typical: 'Varies by design intent'
      };
    }
  },
  
  /**
   * Analyze layout pattern from screenshot (Phase 2B Step 2)
   * Detects hero placement, column count, grid layouts, and card patterns
   */
  async analyzeLayoutPattern(screenshotBuffer) {
    console.log('📐 Analyzing layout pattern...');
    
    try {
      const sharp = (await import('sharp')).default;
      
      // Get image dimensions
      const metadata = await sharp(screenshotBuffer).metadata();
      const width = metadata.width;
      const height = metadata.height;
      
      // Convert to grayscale and detect edges
      const edges = await sharp(screenshotBuffer)
        .grayscale()
        .convolve({
          width: 3,
          height: 3,
          kernel: [-1, -1, -1, -1, 8, -1, -1, -1, -1] // Edge detection kernel
        })
        .threshold(30) // Binary threshold for clear edges
        .raw()
        .toBuffer({ resolveWithObject: true });
      
      // Analyze edge distribution to detect layout structure
      const { data, info } = edges;
      const edgeMap = [];
      
      // Divide image into grid for analysis (20x20 cells)
      const cellWidth = Math.floor(info.width / 20);
      const cellHeight = Math.floor(info.height / 20);
      
      for (let row = 0; row < 20; row++) {
        edgeMap[row] = [];
        for (let col = 0; col < 20; col++) {
          // Count edges in this cell
          let edgeCount = 0;
          for (let y = row * cellHeight; y < (row + 1) * cellHeight; y++) {
            for (let x = col * cellWidth; x < (col + 1) * cellWidth; x++) {
              const idx = y * info.width + x;
              if (data[idx] > 128) { // Edge pixel
                edgeCount++;
              }
            }
          }
          edgeMap[row][col] = edgeCount;
        }
      }
      
      // Analyze layout from edge map
      const layoutAnalysis = this.analyzeLayoutFromEdgeMap(edgeMap, width, height);
      
      const result = {
        layoutType: layoutAnalysis.layoutType,
        hasHero: layoutAnalysis.hasHero,
        heroSize: layoutAnalysis.heroSize,
        columns: layoutAnalysis.columns,
        cardLayout: layoutAnalysis.cardLayout,
        splitScreen: layoutAnalysis.splitScreen,
        gridType: layoutAnalysis.gridType,
        industryMatch: this.matchLayoutToIndustry(layoutAnalysis)
      };
      
      console.log(`   ✅ Layout: ${result.layoutType} (${result.columns} columns${result.hasHero ? ', has hero' : ''})`);
      
      return result;
      
    } catch (error) {
      console.error('   ❌ Layout pattern analysis error:', error.message);
      return {
        layoutType: 'Unknown',
        hasHero: false,
        heroSize: 0,
        columns: 1,
        cardLayout: false,
        splitScreen: false,
        gridType: 'unknown',
        industryMatch: { pattern: 'Unknown', description: 'Analysis failed' },
        error: error.message
      };
    }
  },
  
  /**
   * Analyze layout structure from edge density map
   */
  analyzeLayoutFromEdgeMap(edgeMap, width, height) {
    // Analyze top third for hero
    const topThird = edgeMap.slice(0, 7); // First ~35% of rows
    const topEdges = topThird.flat().reduce((sum, val) => sum + val, 0);
    const topAvg = topEdges / (topThird.length * 20);
    
    // High edge density at top often indicates hero section
    const hasHero = topAvg > 50;
    const heroSize = hasHero ? 0.6 : 0;
    
    // Analyze column structure by looking at vertical edge patterns
    const columnEdges = [];
    for (let col = 0; col < 20; col++) {
      let columnSum = 0;
      for (let row = 0; row < 20; row++) {
        columnSum += edgeMap[row][col];
      }
      columnEdges.push(columnSum);
    }
    
    // Detect columns by finding peaks in vertical edge density
    const columns = this.detectColumnsFromEdgeDensity(columnEdges);
    
    // Detect grid pattern (uniform edge distribution)
    const rowEdges = edgeMap.map(row => row.reduce((sum, val) => sum + val, 0));
    const edgeVariance = this.calculateVariance(rowEdges);
    const isUniform = edgeVariance < 1000; // Low variance = uniform grid
    
    // Detect split-screen (high edges in middle columns)
    const middleCols = columnEdges.slice(8, 12); // Middle 20%
    const middleAvg = middleCols.reduce((sum, val) => sum + val, 0) / middleCols.length;
    const totalAvg = columnEdges.reduce((sum, val) => sum + val, 0) / columnEdges.length;
    const splitScreen = middleAvg > totalAvg * 1.5;
    
    // Determine card layout (multiple distinct regions)
    const cardLayout = columns > 1 && isUniform;
    
    // Determine layout type
    let layoutType;
    if (hasHero && columns === 1) {
      layoutType = 'Hero-Centered Single Column';
    } else if (splitScreen) {
      layoutType = 'Split-Screen';
    } else if (cardLayout && columns >= 3) {
      layoutType = 'Bento Box Grid';
    } else if (cardLayout && columns === 2) {
      layoutType = 'Two-Column Grid';
    } else if (columns >= 3) {
      layoutType = 'Multi-Column';
    } else if (isUniform) {
      layoutType = 'Masonry';
    } else {
      layoutType = 'Single Column';
    }
    
    const gridType = cardLayout ? 'uniform-grid' : isUniform ? 'masonry' : 'traditional';
    
    return {
      layoutType,
      hasHero,
      heroSize,
      columns,
      cardLayout,
      splitScreen,
      gridType
    };
  },
  
  /**
   * Detect number of columns from edge density pattern
   */
  detectColumnsFromEdgeDensity(columnEdges) {
    // Find peaks in edge density (likely column boundaries)
    const peaks = [];
    const threshold = columnEdges.reduce((sum, val) => sum + val, 0) / columnEdges.length * 1.2;
    
    for (let i = 1; i < columnEdges.length - 1; i++) {
      if (columnEdges[i] > threshold && 
          columnEdges[i] > columnEdges[i-1] && 
          columnEdges[i] > columnEdges[i+1]) {
        peaks.push(i);
      }
    }
    
    // Number of columns is approximately number of peaks
    if (peaks.length === 0) return 1;
    if (peaks.length <= 2) return 2;
    if (peaks.length <= 4) return 3;
    return 4;
  },
  
  /**
   * Calculate variance of an array
   */
  calculateVariance(arr) {
    const mean = arr.reduce((sum, val) => sum + val, 0) / arr.length;
    const squaredDiffs = arr.map(val => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((sum, val) => sum + val, 0) / arr.length;
  },
  
  /**
   * Match layout pattern to industry standards
   */
  matchLayoutToIndustry(layout) {
    if (layout.layoutType.includes('Hero-Centered') && layout.columns === 1) {
      return {
        pattern: 'Modern SaaS',
        examples: ['Stripe', 'Linear', 'Notion'],
        description: 'Single column with prominent hero section',
        typical: '60-70% hero, single column flow',
        prevalence: '67% of SaaS landing pages',
        trend: 'Classic, evergreen'
      };
    } else if (layout.layoutType.includes('Bento Box')) {
      return {
        pattern: 'Bento Grid (2024 Trend)',
        examples: ['Apple', 'Figma', 'Vercel'],
        description: 'Asymmetric grid with varied card sizes',
        typical: '3-4 columns, mixed card sizes',
        prevalence: '38% prevalence',
        trend: '+24% engagement vs traditional'
      };
    } else if (layout.splitScreen) {
      return {
        pattern: 'Split-Screen Hero',
        examples: ['Airbnb', 'Medium', 'Spotify'],
        description: '50/50 split with imagery and content',
        typical: 'Equal halves, visual-text balance',
        prevalence: '42% prevalence',
        trend: 'Trending (+15% in 2024)'
      };
    } else if (layout.columns >= 3 && layout.cardLayout) {
      return {
        pattern: 'E-commerce Grid',
        examples: ['Amazon', 'Shopify', 'Product Hunt'],
        description: 'Multi-column product/card grid',
        typical: '3-4 columns, uniform cards',
        prevalence: '82% of e-commerce',
        trend: 'Standard'
      };
    } else if (layout.gridType === 'masonry') {
      return {
        pattern: 'Masonry Portfolio',
        examples: ['Dribbble', 'Behance', 'Pinterest'],
        description: 'Staggered grid with varied heights',
        typical: 'Variable card heights, tight packing',
        prevalence: '53% of portfolios',
        trend: 'Creative standard'
      };
    } else if (layout.columns === 2) {
      return {
        pattern: 'Two-Column Blog',
        examples: ['Medium', 'Substack', 'Ghost'],
        description: 'Content + sidebar layout',
        typical: '70/30 or 60/40 split',
        prevalence: '45% of blogs',
        trend: 'Traditional'
      };
    } else {
      return {
        pattern: 'Single Column',
        examples: ['Mobile-first sites', 'Minimalist brands'],
        description: 'Simple linear flow',
        typical: 'Full-width sections, stacked',
        prevalence: '35% of modern sites',
        trend: 'Mobile-optimized'
      };
    }
  },
  
  /**
   * Analyze CTA prominence from screenshot (Phase 2B Step 3)
   * Detects buttons via vibrant colors and shape heuristics
   */
  async analyzeCTAProminence(screenshotBuffer) {
    console.log('🎯 Analyzing CTA prominence...');
    
    try {
      const sharp = (await import('sharp')).default;
      const { Vibrant } = await import('node-vibrant/node'); // Use Node.js-specific import
      
      // Get image dimensions
      const metadata = await sharp(screenshotBuffer).metadata();
      const width = metadata.width;
      const height = metadata.height;
      const totalArea = width * height;
      
      // Extract vibrant colors (likely CTA buttons)
      const palette = await Vibrant.from(screenshotBuffer).getPalette();
      
      // CTAs typically use vibrant, high-saturation colors
      const ctaColors = [
        palette.Vibrant,
        palette.DarkVibrant,
        palette.LightVibrant
      ].filter(Boolean);
      
      // Analyze color regions that might be CTAs
      const ctaRegions = [];
      
      for (const swatch of ctaColors) {
        const [r, g, b] = swatch.rgb;
        const hex = swatch.hex;
        
        // Create a mask for this color (±tolerance)
        const colorMask = await sharp(screenshotBuffer)
          .raw()
          .toBuffer({ resolveWithObject: true });
        
        const { data, info } = colorMask;
        
        // Find regions with this color
        const regions = this.findColorRegions(data, info, r, g, b, 30); // 30px tolerance
        
        // Filter to button-shaped regions
        const buttonRegions = regions.filter(region => 
          this.isButtonShaped(region, width, height)
        );
        
        buttonRegions.forEach(region => {
          ctaRegions.push({
            ...region,
            color: hex,
            sizePercent: (region.width * region.height) / totalArea
          });
        });
      }
      
      // Remove duplicates (same region detected in multiple colors)
      const uniqueRegions = this.deduplicateRegions(ctaRegions);
      
      // Calculate metrics
      const totalCtaArea = uniqueRegions.reduce((sum, btn) => sum + btn.sizePercent, 0);
      const aboveFold = uniqueRegions.filter(r => r.y < height * 0.6).length;
      const avgSize = uniqueRegions.length > 0 ? totalCtaArea / uniqueRegions.length : 0;
      
      // Sort by size to find primary CTA
      const sortedBySize = uniqueRegions.slice().sort((a, b) => b.sizePercent - a.sizePercent);
      const primaryCTA = sortedBySize[0];
      
      const result = {
        ctaCount: uniqueRegions.length,
        avgCtaSize: parseFloat(avgSize.toFixed(4)),
        totalProminence: parseFloat((totalCtaArea * 100).toFixed(2)), // % of screen
        aboveFold,
        primaryCtaColor: primaryCTA?.color || null,
        primaryCtaSize: primaryCTA?.sizePercent ? parseFloat((primaryCTA.sizePercent * 100).toFixed(2)) : 0,
        ctaPlacement: this.analyzeCTAPlacement(uniqueRegions, height),
        industryMatch: this.matchCTAToIndustry(uniqueRegions.length, totalCtaArea, aboveFold)
      };
      
      console.log(`   ✅ CTAs: ${result.ctaCount} found, ${result.totalProminence}% prominence${aboveFold > 0 ? `, ${aboveFold} above fold` : ''}`);
      
      return result;
      
    } catch (error) {
      console.error('   ❌ CTA prominence analysis error:', error.message);
      return {
        ctaCount: 0,
        avgCtaSize: 0,
        totalProminence: 0,
        aboveFold: 0,
        primaryCtaColor: null,
        primaryCtaSize: 0,
        ctaPlacement: 'unknown',
        industryMatch: { pattern: 'Unknown', description: 'Analysis failed' },
        error: error.message
      };
    }
  },
  
  /**
   * Find regions of a specific color in image data
   */
  findColorRegions(data, info, targetR, targetG, targetB, tolerance) {
    const width = info.width;
    const height = info.height;
    const channels = info.channels;
    
    // Create binary mask of matching pixels
    const mask = new Array(width * height).fill(0);
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * channels;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        
        // Check if color matches within tolerance
        if (Math.abs(r - targetR) <= tolerance &&
            Math.abs(g - targetG) <= tolerance &&
            Math.abs(b - targetB) <= tolerance) {
          mask[y * width + x] = 1;
        }
      }
    }
    
    // Find connected regions (simplified flood fill)
    const regions = [];
    const visited = new Array(width * height).fill(false);
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        if (mask[idx] === 1 && !visited[idx]) {
          const region = this.floodFill(mask, visited, x, y, width, height);
          if (region.pixels > 50) { // Minimum size threshold
            regions.push(region);
          }
        }
      }
    }
    
    return regions;
  },
  
  /**
   * Simple flood fill to find connected regions
   */
  floodFill(mask, visited, startX, startY, width, height) {
    const stack = [[startX, startY]];
    let minX = startX, maxX = startX, minY = startY, maxY = startY;
    let pixels = 0;
    
    while (stack.length > 0) {
      const [x, y] = stack.pop();
      const idx = y * width + x;
      
      if (x < 0 || x >= width || y < 0 || y >= height) continue;
      if (visited[idx] || mask[idx] === 0) continue;
      
      visited[idx] = true;
      pixels++;
      
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
      
      // Add neighbors (4-connectivity for speed)
      stack.push([x + 1, y]);
      stack.push([x - 1, y]);
      stack.push([x, y + 1]);
      stack.push([x, y - 1]);
    }
    
    return {
      x: minX,
      y: minY,
      width: maxX - minX + 1,
      height: maxY - minY + 1,
      pixels
    };
  },
  
  /**
   * Check if region is button-shaped
   */
  isButtonShaped(region, imgWidth, imgHeight) {
    const aspectRatio = region.width / region.height;
    const sizePercent = (region.width * region.height) / (imgWidth * imgHeight);
    
    return (
      aspectRatio > 1.5 && aspectRatio < 8 &&      // Wider than tall (typical button)
      sizePercent > 0.002 && sizePercent < 0.15 && // 0.2-15% of screen (reasonable CTA size)
      region.width > 50 && region.height > 20      // Minimum button dimensions
    );
  },
  
  /**
   * Remove duplicate/overlapping regions
   */
  deduplicateRegions(regions) {
    const unique = [];
    
    for (const region of regions) {
      const isDuplicate = unique.some(existing => {
        // Check if regions overlap significantly
        const xOverlap = Math.max(0, Math.min(existing.x + existing.width, region.x + region.width) - Math.max(existing.x, region.x));
        const yOverlap = Math.max(0, Math.min(existing.y + existing.height, region.y + region.height) - Math.max(existing.y, region.y));
        const overlapArea = xOverlap * yOverlap;
        const existingArea = existing.width * existing.height;
        const regionArea = region.width * region.height;
        
        // If >50% overlap, consider it duplicate
        return (overlapArea / existingArea > 0.5) || (overlapArea / regionArea > 0.5);
      });
      
      if (!isDuplicate) {
        unique.push(region);
      }
    }
    
    return unique;
  },
  
  /**
   * Analyze CTA placement pattern
   */
  analyzeCTAPlacement(regions, imageHeight) {
    if (regions.length === 0) return 'none';
    
    const avgY = regions.reduce((sum, r) => sum + (r.y + r.height / 2), 0) / regions.length;
    const relativePosition = avgY / imageHeight;
    
    if (relativePosition < 0.3) return 'top-third';
    if (relativePosition < 0.6) return 'middle-optimal'; // Sweet spot
    if (relativePosition < 0.8) return 'lower-third';
    return 'bottom';
  },
  
  /**
   * Match CTA pattern to industry standards
   */
  matchCTAToIndustry(count, totalArea, aboveFold) {
    const prominence = totalArea * 100; // Convert to percentage
    
    if (count === 0) {
      return {
        pattern: 'No CTAs Detected',
        examples: [],
        description: 'No clear call-to-action buttons found',
        typical: 'Missing critical conversion element',
        score: 0,
        recommendation: 'Add 1-2 prominent CTA buttons above fold'
      };
    }
    
    if (count <= 2 && prominence >= 3 && prominence <= 8 && aboveFold >= 1) {
      return {
        pattern: 'High-Converting',
        examples: ['Stripe', 'Linear', 'Notion'],
        description: '1-2 clear CTAs with strong prominence',
        typical: '3-5% screen area, above fold',
        score: 9,
        recommendation: 'Optimal CTA strategy - maintain this'
      };
    } else if (count <= 2 && aboveFold >= 1) {
      return {
        pattern: 'Focused',
        examples: ['Apple', 'Tesla'],
        description: 'Minimal CTAs, may be subtle',
        typical: '1-2 CTAs, premium brands',
        score: 7,
        recommendation: 'Consider increasing CTA prominence slightly'
      };
    } else if (count >= 5) {
      return {
        pattern: 'Cluttered',
        examples: ['Low-converting sites'],
        description: 'Too many CTAs cause decision paralysis',
        typical: '5+ CTAs, confusing',
        score: 3,
        recommendation: 'Reduce to 1-2 primary CTAs maximum'
      };
    } else if (aboveFold === 0) {
      return {
        pattern: 'Hidden CTAs',
        examples: ['Poor UX sites'],
        description: 'CTAs not visible above fold',
        typical: 'User must scroll to see action',
        score: 4,
        recommendation: 'Place primary CTA in hero/above fold'
      };
    } else {
      return {
        pattern: 'Moderate',
        examples: ['Average SaaS sites'],
        description: 'Reasonable CTA presence',
        typical: '2-3 CTAs, decent prominence',
        score: 6,
        recommendation: 'Good foundation, optimize prominence and placement'
      };
    }
  },
  
  /**
   * Analyze Visual Hierarchy (Phase 2C Step 1)
   * Calculates visual weight of elements based on size, position, contrast, and typography
   * Requires live page access (uses Playwright for DOM analysis)
   */
  async analyzeVisualHierarchy(pageUrl, options = {}) {
    console.log('🎯 Analyzing visual hierarchy...');
    
    try {
      const { chromium } = await import('playwright');
      
      // Launch browser
      const browser = await chromium.launch({ headless: true });
      const page = await browser.newPage();
      await page.goto(pageUrl, { waitUntil: 'networkidle' });
      
      // Get viewport dimensions
      const viewport = page.viewportSize();
      const foldLine = viewport.height;
      
      // Analyze all visible elements
      const elements = await page.evaluate((foldLine) => {
        const results = [];
        const allElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, a, button, img, section, div[class*="cta"], div[class*="hero"]');
        
        allElements.forEach((el) => {
          const rect = el.getBoundingClientRect();
          const styles = window.getComputedStyle(el);
          
          // Skip hidden or tiny elements
          if (rect.width < 10 || rect.height < 10 || styles.display === 'none') {
            return;
          }
          
          // Calculate visual weight factors
          const area = rect.width * rect.height;
          const viewportArea = window.innerWidth * window.innerHeight;
          const sizeWeight = (area / viewportArea) * 100; // % of viewport
          
          // Position weight (above fold = higher weight)
          const isAboveFold = rect.top < foldLine;
          const positionWeight = isAboveFold ? 1.5 : 1.0;
          const verticalPosition = rect.top / window.innerHeight; // 0 = top, 1 = bottom
          
          // Color/contrast weight
          const bgColor = styles.backgroundColor;
          const color = styles.color;
          const fontWeight = parseInt(styles.fontWeight) || 400;
          const fontSize = parseFloat(styles.fontSize) || 16;
          
          // Typography weight (headers have more weight)
          const tagName = el.tagName.toLowerCase();
          let typeWeight = 1.0;
          if (tagName === 'h1') typeWeight = 3.0;
          else if (tagName === 'h2') typeWeight = 2.5;
          else if (tagName === 'h3') typeWeight = 2.0;
          else if (tagName === 'h4') typeWeight = 1.5;
          else if (tagName === 'h5' || tagName === 'h6') typeWeight = 1.3;
          else if (tagName === 'button' || el.getAttribute('role') === 'button') typeWeight = 2.2;
          
          // Font size weight (relative to base 16px)
          const fontSizeWeight = fontSize / 16;
          
          // Calculate total visual weight
          const visualWeight = sizeWeight * positionWeight * typeWeight * fontSizeWeight;
          
          results.push({
            tagName,
            text: el.textContent?.trim().substring(0, 100) || '',
            area: Math.round(area),
            position: {
              top: Math.round(rect.top),
              left: Math.round(rect.left),
              width: Math.round(rect.width),
              height: Math.round(rect.height)
            },
            isAboveFold,
            fontSize: Math.round(fontSize),
            fontWeight,
            visualWeight: parseFloat(visualWeight.toFixed(2)),
            color,
            bgColor
          });
        });
        
        // Sort by visual weight (descending)
        return results.sort((a, b) => b.visualWeight - a.visualWeight);
      }, foldLine);
      
      await browser.close();
      
      // Analyze focal points (top 10 elements by visual weight)
      const focalPoints = elements.slice(0, 10);
      
      // Calculate hierarchy score
      const aboveFoldElements = elements.filter(el => el.isAboveFold);
      const aboveFoldWeight = aboveFoldElements.reduce((sum, el) => sum + el.visualWeight, 0);
      const totalWeight = elements.reduce((sum, el) => sum + el.visualWeight, 0);
      const aboveFoldRatio = totalWeight > 0 ? aboveFoldWeight / totalWeight : 0;
      
      // Check for clear hierarchy (top element should have significantly more weight than others)
      const topWeight = elements[0]?.visualWeight || 0;
      const avgWeight = totalWeight / elements.length;
      const hierarchyClarity = topWeight / avgWeight; // Ratio of top element to average
      
      let hierarchyRating = 'poor';
      if (hierarchyClarity > 3) hierarchyRating = 'excellent';
      else if (hierarchyClarity > 2) hierarchyRating = 'good';
      else if (hierarchyClarity > 1.5) hierarchyRating = 'fair';
      
      const industryMatch = this.matchHierarchyToIndustry(hierarchyRating, aboveFoldRatio, focalPoints);
      
      console.log(`   ✅ Hierarchy: ${hierarchyRating} (clarity: ${hierarchyClarity.toFixed(1)}x)`);
      console.log(`   📍 Focal points: ${focalPoints.length} identified`);
      console.log(`   ⬆️  Above fold weight: ${(aboveFoldRatio * 100).toFixed(1)}%`);
      
      return {
        hierarchyRating,
        hierarchyClarity: parseFloat(hierarchyClarity.toFixed(2)),
        aboveFoldRatio: parseFloat(aboveFoldRatio.toFixed(3)),
        focalPoints,
        totalElements: elements.length,
        aboveFoldElements: aboveFoldElements.length,
        industryMatch
      };
      
    } catch (error) {
      console.error('   ❌ Visual hierarchy analysis error:', error.message);
      return {
        hierarchyRating: 'unknown',
        hierarchyClarity: 0,
        aboveFoldRatio: 0,
        focalPoints: [],
        totalElements: 0,
        aboveFoldElements: 0,
        industryMatch: { pattern: 'Unknown', description: 'Analysis failed' },
        error: error.message
      };
    }
  },
  
  /**
   * Match visual hierarchy to industry patterns
   */
  matchHierarchyToIndustry(rating, aboveFoldRatio, focalPoints) {
    const primaryFocalTag = focalPoints[0]?.tagName || 'unknown';
    
    if (rating === 'excellent' && aboveFoldRatio > 0.6 && primaryFocalTag === 'h1') {
      return {
        pattern: 'SaaS Hero-Driven',
        examples: ['Stripe', 'Linear', 'Notion'],
        description: 'Strong H1 headline dominates, clear visual hierarchy',
        typical: '3x+ clarity ratio, >60% weight above fold, H1-led',
        score: 9,
        recommendation: 'Excellent hierarchy - maintain this pattern'
      };
    } else if (rating === 'excellent' && primaryFocalTag === 'button') {
      return {
        pattern: 'CTA-First',
        examples: ['E-commerce', 'App Downloads'],
        description: 'CTA button is the primary focal point',
        typical: 'Button-led hierarchy, action-focused',
        score: 8,
        recommendation: 'Strong conversion focus - good for high-intent traffic'
      };
    } else if (rating === 'good' && aboveFoldRatio > 0.5) {
      return {
        pattern: 'Balanced',
        examples: ['Content sites', 'Portfolios'],
        description: 'Good hierarchy with balanced above/below fold content',
        typical: '2-3x clarity ratio, balanced fold distribution',
        score: 7,
        recommendation: 'Solid foundation - consider emphasizing primary CTA more'
      };
    } else if (rating === 'fair') {
      return {
        pattern: 'Weak Hierarchy',
        examples: ['Cluttered sites', 'Poor UX'],
        description: 'No clear focal point, elements compete for attention',
        typical: '<2x clarity ratio, scattered weight',
        score: 4,
        recommendation: 'Increase H1/hero size, reduce competing elements'
      };
    } else {
      return {
        pattern: 'No Clear Hierarchy',
        examples: ['Low-quality sites'],
        description: 'Very weak visual hierarchy, confusing for users',
        typical: '<1.5x clarity ratio, no clear focus',
        score: 2,
        recommendation: 'Major redesign needed - establish clear focal points'
      };
    }
  },
  
  /**
   * Rate limiter for respectful crawling
   */
  async rateLimitDelay() {
    // Wait 2 seconds between requests to be respectful
    const delay = 2000;
    await new Promise(resolve => setTimeout(resolve, delay));
  },
  
  /**
   * Crawl Dribbble for popular web design shots
   */
  async crawlDribbble(options = {}) {
    const limit = options.limit || 100; // Phase 2A: Increased from 50 to 100 (proven best performer)
    const url = this.config.dataSources.dribbble.url;
    const startTime = Date.now();
    
    // Initialize analytics tracking
    const analytics = {
      source: 'dribbble',
      startTime: new Date().toISOString(),
      targetLimit: limit,
      scrollAttempts: 0,
      pagesLoaded: 0,
      extractionAttempts: 0,
      successfulExtractions: 0,
      failedExtractions: 0,
      errors: []
    };
    
    console.log(`🌐 Crawling Dribbble: ${url}`);
    console.log(`   Extracting ${limit} popular shots...`);
    console.log(`   ⏱️  Rate limiting enabled (2s between requests)`);
    console.log(`   📜 Infinite scroll enabled for large limits`);
    
    const { chromium } = await import('playwright');
    let browser;
    let page;
    
    try {
      console.log('   ✅ Browser initialized');
      browser = await chromium.launch({ headless: true });
      page = await browser.newPage();
      analytics.pagesLoaded = 1;
      
      // Navigate to Dribbble
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      
      // Wait for initial content to load (Dribbble is slow with React hydration)
      await page.waitForTimeout(5000);
      
      // Scroll to load more shots if we need more than what's initially visible
      if (limit > 20) {
        console.log(`   📜 Scrolling to load more shots (target: ${limit})...`);
        
        let previousHeight = 0;
        let scrollAttempts = 0;
        const maxScrollAttempts = Math.ceil(limit / 10); // ~10 new shots per scroll
        
        while (scrollAttempts < maxScrollAttempts) {
          analytics.scrollAttempts++;
          
          // Get current count of shots
          const currentCount = await page.evaluate(() => {
            const listItems = document.querySelectorAll('li');
            let count = 0;
            for (const li of listItems) {
              const figure = li.querySelector('figure');
              if (!figure) continue;
              const img = figure.querySelector('img');
              if (!img || !img.src) continue;
              if (img.src.includes('avatar') || img.alt?.toLowerCase().includes('avatar')) continue;
              const shotLink = li.querySelector('a[href*="/shots/"]');
              if (!shotLink) continue;
              count++;
            }
            return count;
          });
          
          console.log(`      Current shots loaded: ${currentCount}/${limit}`);
          
          // If we have enough, stop scrolling
          if (currentCount >= limit) {
            console.log(`   ✅ Loaded ${currentCount} shots (target reached)`);
            break;
          }
          
          // Scroll to bottom
          await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
          
          // Wait for new content to load
          await page.waitForTimeout(3000);
          
          // Check if we've reached the bottom (no new content)
          const newHeight = await page.evaluate(() => document.body.scrollHeight);
          if (newHeight === previousHeight) {
            console.log(`   ⚠️  Reached end of page at ${currentCount} shots`);
            analytics.errors.push({ type: 'scroll_limit', message: `Reached page end at ${currentCount} shots` });
            break;
          }
          
          previousHeight = newHeight;
          scrollAttempts++;
          
          // Rate limit between scrolls
          await this.rateLimitDelay();
        }
        
        console.log(`   ✅ Scrolling complete after ${scrollAttempts} attempts`);
      }
      
      // Rate limit before extraction
      await this.rateLimitDelay();
      
      // Extract shot data - Working selectors verified 2025-11-21
      const shots = await page.evaluate((lim) => {
        const results = [];
        const listItems = document.querySelectorAll('li');
        
        for (const li of listItems) {
          // Look for figure with img (shot thumbnail)
          const figure = li.querySelector('figure');
          if (!figure) continue;
          
          const img = figure.querySelector('img');
          if (!img || !img.src) continue;
          
          // Skip avatars
          if (img.src.includes('avatar') || img.alt?.toLowerCase().includes('avatar')) {
            continue;
          }
          
          // Find link to shot (required)
          const shotLink = li.querySelector('a[href*="/shots/"]');
          if (!shotLink) continue;
          
          // Extract title from img alt
          const title = img.alt || 'Untitled';
          
          // Find likes - look for numbers with optional k/m suffix
          let likes = '0';
          const allText = li.querySelectorAll('*');
          for (const el of allText) {
            const text = el.textContent?.trim();
            if (text && /^\d+(\.\d+)?[km]?$/i.test(text)) {
              const match = text.match(/^(\d+(\.\d+)?)[km]?$/i);
              if (match) {
                const num = parseFloat(match[1]);
                if (num > 0 && num < 100) { // Reasonable range
                  likes = text;
                  break;
                }
              }
            }
          }
          
          results.push({
            imageUrl: img.src,
            title: title.substring(0, 100),
            likes: likes,
            url: shotLink.href
          });
          
          if (results.length >= lim) break;
        }
        
        return results;
      }, limit);
      
      // Update analytics
      analytics.extractionAttempts = shots.length;
      analytics.successfulExtractions = shots.filter(s => s.imageUrl && s.url).length;
      analytics.failedExtractions = shots.length - analytics.successfulExtractions;
      analytics.endTime = new Date().toISOString();
      analytics.duration = Date.now() - startTime;
      analytics.extractionRate = analytics.duration > 0 ? (analytics.successfulExtractions / (analytics.duration / 1000 / 60)).toFixed(2) : 0;
      
      console.log(`✅ Extracted ${shots.length} shots from Dribbble`);
      console.log(`   📊 Success rate: ${((analytics.successfulExtractions / shots.length) * 100).toFixed(1)}%`);
      console.log(`   ⏱️  Duration: ${(analytics.duration / 1000).toFixed(1)}s`);
      console.log(`   📈 Rate: ${analytics.extractionRate} designs/min`);
      
      // Close browser
      await browser.close();
      console.log('   ✅ Browser closed');
      
      // Store analytics (for later reporting)
      if (!options._skipAnalytics) {
        this._sourceAnalytics = this._sourceAnalytics || [];
        this._sourceAnalytics.push(analytics);
      }
      
      return shots;
      
    } catch (error) {
      console.error(`❌ Error crawling Dribbble:`, error.message);
      
      // Update analytics with error
      analytics.endTime = new Date().toISOString();
      analytics.duration = Date.now() - startTime;
      analytics.errors.push({ type: 'fatal', message: error.message, stack: error.stack });
      analytics.failed = true;
      
      // Store failed analytics
      if (!options._skipAnalytics) {
        this._sourceAnalytics = this._sourceAnalytics || [];
        this._sourceAnalytics.push(analytics);
      }
      
      // Close browser on error
      if (browser) {
        await browser.close();
        console.log('   ✅ Browser closed');
      }
      
      // Retry once if failed
      if (!options._retried) {
        console.log(`   🔄 Retrying...`);
        await this.rateLimitDelay();
        return await this.crawlDribbble({ ...options, _retried: true });
      }
      
      return [];
    }
  },
  
  /**
   * Crawl Awwwards for award-winning web designs
   */
  async crawlAwwwards(options = {}) {
    const limit = options.limit || 50; // Phase 2A: Increased from 30 to 50 (award-winning designs, high weight)
    const url = this.config.dataSources.awwwards.url;
    const startTime = Date.now();
    
    // Initialize analytics tracking
    const analytics = {
      source: 'awwwards',
      startTime: new Date().toISOString(),
      targetLimit: limit,
      scrollAttempts: 0,
      pagesLoaded: 0,
      extractionAttempts: 0,
      successfulExtractions: 0,
      failedExtractions: 0,
      errors: []
    };
    
    console.log(`🏆 Crawling Awwwards: ${url}`);
    console.log(`   Extracting ${limit} award-winning sites...`);
    console.log(`   ⏱️  Rate limiting enabled (2s between requests)`);
    console.log(`   📜 Infinite scroll enabled for large limits`);
    
    const { chromium } = await import('playwright');
    let browser;
    
    try {
      console.log('   ✅ Browser initialized');
      browser = await chromium.launch({ headless: true });
      const page = await browser.newPage();
      analytics.pagesLoaded = 1;
      
      // Navigate to Awwwards
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      
      // Wait for initial content to load
      await page.waitForTimeout(5000);
      
      // Scroll to load more sites if needed
      if (limit > 20) {
        console.log(`   📜 Scrolling to load more sites (target: ${limit})...`);
        
        let scrollAttempts = 0;
        const maxScrollAttempts = Math.ceil(limit / 10);
        
        while (scrollAttempts < maxScrollAttempts) {
          analytics.scrollAttempts++;
          
          const currentCount = await page.evaluate(() => {
            return document.querySelectorAll('.site-item, [class*="site"], [data-site]').length;
          });
          
          console.log(`      Current sites loaded: ${currentCount}/${limit}`);
          
          if (currentCount >= limit) {
            console.log(`   ✅ Loaded ${currentCount} sites (target reached)`);
            break;
          }
          
          await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
          await page.waitForTimeout(3000);
          
          scrollAttempts++;
          await this.rateLimitDelay();
        }
        
        console.log(`   ✅ Scrolling complete after ${scrollAttempts} attempts`);
      }
      
      await this.rateLimitDelay();
      
      // Extract site data
      const sites = await page.evaluate((lim) => {
        const siteElements = document.querySelectorAll('.site-item, [class*="site"], [data-site]');
        const results = [];
        
        for (let i = 0; i < Math.min(siteElements.length, lim); i++) {
          const el = siteElements[i];
          const img = el.querySelector('img');
          const link = el.closest('a') || el.querySelector('a');
          const title = el.querySelector('h3, .title, [class*="title"]');
          
          if (img && img.src) {
            results.push({
              imageUrl: img.src,
              title: title?.textContent || img.alt || 'Untitled',
              url: link ? link.href : '',
              source: 'awwwards'
            });
          }
        }
        
        return results;
      }, limit);
      
      // Update analytics
      analytics.extractionAttempts = sites.length;
      analytics.successfulExtractions = sites.filter(s => s.imageUrl && s.url).length;
      analytics.failedExtractions = sites.length - analytics.successfulExtractions;
      analytics.endTime = new Date().toISOString();
      analytics.duration = Date.now() - startTime;
      analytics.extractionRate = analytics.duration > 0 ? (analytics.successfulExtractions / (analytics.duration / 1000 / 60)).toFixed(2) : 0;
      
      console.log(`✅ Extracted ${sites.length} sites from Awwwards`);
      console.log(`   📊 Success rate: ${((analytics.successfulExtractions / sites.length) * 100).toFixed(1)}%`);
      console.log(`   ⏱️  Duration: ${(analytics.duration / 1000).toFixed(1)}s`);
      console.log(`   📈 Rate: ${analytics.extractionRate} designs/min`);
      
      await browser.close();
      console.log('   ✅ Browser closed');
      
      // Store analytics
      if (!options._skipAnalytics) {
        this._sourceAnalytics = this._sourceAnalytics || [];
        this._sourceAnalytics.push(analytics);
      }
      
      return sites;
      
    } catch (error) {
      console.error(`❌ Error crawling Awwwards:`, error.message);
      
      // Update analytics with error
      analytics.endTime = new Date().toISOString();
      analytics.duration = Date.now() - startTime;
      analytics.errors.push({ type: 'fatal', message: error.message, stack: error.stack });
      analytics.failed = true;
      
      // Store failed analytics
      if (!options._skipAnalytics) {
        this._sourceAnalytics = this._sourceAnalytics || [];
        this._sourceAnalytics.push(analytics);
      }
      
      if (browser) {
        await browser.close();
        console.log('   ✅ Browser closed');
      }
      
      // Retry once if failed
      if (!options._retried) {
        console.log(`   🔄 Retrying...`);
        await this.rateLimitDelay();
        return await this.crawlAwwwards({ ...options, _retried: true });
      }
      
      return [];
    }
  },
  
  /**
   * Crawl SiteInspire for curated design inspiration
   */
  async crawlSiteInspire(options = {}) {
    const limit = options.limit || 50; // Phase 2A: Increased from 30 to 50 (curated designs)
    const url = 'https://www.siteinspire.com/';
    const startTime = Date.now();
    
    // Initialize analytics tracking
    const analytics = {
      source: 'siteinspire',
      startTime: new Date().toISOString(),
      targetLimit: limit,
      scrollAttempts: 0,
      pagesLoaded: 0,
      extractionAttempts: 0,
      successfulExtractions: 0,
      failedExtractions: 0,
      errors: []
    };
    
    console.log(`✨ Crawling SiteInspire: ${url}`);
    console.log(`   Extracting ${limit} curated designs...`);
    console.log(`   ⏱️  Rate limiting enabled (2s between requests)`);
    console.log(`   📜 Infinite scroll enabled for large limits`);
    
    const { chromium } = await import('playwright');
    let browser;
    
    try {
      console.log('   ✅ Browser initialized');
      browser = await chromium.launch({ headless: true });
      const page = await browser.newPage();
      analytics.pagesLoaded = 1;
      
      // Navigate to SiteInspire
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      
      // Wait for initial content to load
      await page.waitForTimeout(5000);
      
      // Scroll to load more sites if needed
      if (limit > 20) {
        console.log(`   📜 Scrolling to load more sites (target: ${limit})...`);
        
        let scrollAttempts = 0;
        const maxScrollAttempts = Math.ceil(limit / 10);
        
        while (scrollAttempts < maxScrollAttempts) {
          analytics.scrollAttempts++;
          
          const currentCount = await page.evaluate(() => {
            return document.querySelectorAll('.site, [class*="item"], article').length;
          });
          
          console.log(`      Current sites loaded: ${currentCount}/${limit}`);
          
          if (currentCount >= limit) {
            console.log(`   ✅ Loaded ${currentCount} sites (target reached)`);
            break;
          }
          
          await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
          await page.waitForTimeout(3000);
          
          scrollAttempts++;
          await this.rateLimitDelay();
        }
        
        console.log(`   ✅ Scrolling complete after ${scrollAttempts} attempts`);
      }
      
      await this.rateLimitDelay();
      
      // Extract site data (Phase 2C: Fixed - find images then get parent links)
      const sites = await page.evaluate((lim) => {
        // SiteInspire: Find all website thumbnail images
        const allImages = document.querySelectorAll('img');
        const websiteImages = Array.from(allImages).filter(img => 
          img.src && 
          !img.src.includes('logo') && 
          !img.src.includes('icon') &&
          img.alt &&
          img.alt.length > 0
        );
        
        const results = [];
        
        for (let i = 0; i < Math.min(websiteImages.length, lim); i++) {
          const img = websiteImages[i];
          
          // Find parent link
          const link = img.closest('a');
          if (!link || !link.href) continue;
          
          // Skip category links
          if (link.href.includes('/category/') || link.href.includes('/websites/')) continue;
          
          results.push({
            imageUrl: img.src,
            title: img.alt.trim().substring(0, 100),
            url: link.href,
            source: 'siteinspire'
          });
        }
        
        return results;
      }, limit);
      
      // Update analytics
      analytics.extractionAttempts = sites.length;
      analytics.successfulExtractions = sites.filter(s => s.imageUrl && s.url).length;
      analytics.failedExtractions = sites.length - analytics.successfulExtractions;
      analytics.endTime = new Date().toISOString();
      analytics.duration = Date.now() - startTime;
      analytics.extractionRate = analytics.duration > 0 ? (analytics.successfulExtractions / (analytics.duration / 1000 / 60)).toFixed(2) : 0;
      
      console.log(`✅ Extracted ${sites.length} sites from SiteInspire`);
      console.log(`   📊 Success rate: ${((analytics.successfulExtractions / sites.length) * 100).toFixed(1)}%`);
      console.log(`   ⏱️  Duration: ${(analytics.duration / 1000).toFixed(1)}s`);
      console.log(`   📈 Rate: ${analytics.extractionRate} designs/min`);
      
      await browser.close();
      console.log('   ✅ Browser closed');
      
      // Store analytics
      if (!options._skipAnalytics) {
        this._sourceAnalytics = this._sourceAnalytics || [];
        this._sourceAnalytics.push(analytics);
      }
      
      return sites;
      
    } catch (error) {
      console.error(`❌ Error crawling SiteInspire:`, error.message);
      
      // Update analytics with error
      analytics.endTime = new Date().toISOString();
      analytics.duration = Date.now() - startTime;
      analytics.errors.push({ type: 'fatal', message: error.message, stack: error.stack });
      analytics.failed = true;
      
      // Store failed analytics
      if (!options._skipAnalytics) {
        this._sourceAnalytics = this._sourceAnalytics || [];
        this._sourceAnalytics.push(analytics);
      }
      
      if (browser) {
        await browser.close();
        console.log('   ✅ Browser closed');
      }
      
      // Retry once if failed
      if (!options._retried) {
        console.log(`   🔄 Retrying...`);
        await this.rateLimitDelay();
        return await this.crawlSiteInspire({ ...options, _retried: true });
      }
      
      return [];
    }
  },
  
  /**
   * Crawl Behance for high-quality design portfolios (Phase 2B)
   */
  async crawlBehance(options = {}) {
    const limit = options.limit || 40; // Phase 2B: New source for hybrid approach
    const url = 'https://www.behance.net/galleries/ui-ux';
    const startTime = Date.now();
    
    // Initialize analytics tracking
    const analytics = {
      source: 'behance',
      startTime: new Date().toISOString(),
      targetLimit: limit,
      scrollAttempts: 0,
      pagesLoaded: 0,
      extractionAttempts: 0,
      successfulExtractions: 0,
      failedExtractions: 0,
      errors: []
    };
    
    console.log(`🎨 Crawling Behance: ${url}`);
    console.log(`   Extracting ${limit} portfolio designs...`);
    console.log(`   ⏱️  Rate limiting enabled (2s between requests)`);
    console.log(`   📜 Infinite scroll enabled for large limits`);
    
    const { chromium } = await import('playwright');
    let browser;
    
    try {
      console.log('   ✅ Browser initialized');
      browser = await chromium.launch({ headless: true });
      const page = await browser.newPage();
      analytics.pagesLoaded = 1;
      
      // Navigate to Behance
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      
      // Wait for initial content to load (React-based site)
      await page.waitForTimeout(5000);
      
      // Scroll to load more projects if needed
      if (limit > 20) {
        console.log(`   📜 Scrolling to load more projects (target: ${limit})...`);
        
        let scrollAttempts = 0;
        const maxScrollAttempts = Math.ceil(limit / 12); // ~12 projects per scroll
        
        while (scrollAttempts < maxScrollAttempts) {
          analytics.scrollAttempts++;
          
          const currentCount = await page.evaluate(() => {
            // Phase 2C: Updated to working selectors found via verification
            const selectors = [
              '[class*="Cover"]',              // Best: 654 elements (verified working)
              '.js-project-cover',             // Works: 24 elements
              'a[href*="/gallery/"]',          // Works: 48 elements
              '[class*="Project"]',            // Works: 414 elements
              '[class*="Grid"] > div',         // Works: 24 elements
              // Legacy fallbacks (likely not working but kept for safety):
              '.project-cover',
              '[class*="ProjectCard"]'
            ];
            
            for (const selector of selectors) {
              const elements = document.querySelectorAll(selector);
              if (elements.length > 0) return elements.length;
            }
            return 0;
          });
          
          console.log(`      Current projects loaded: ${currentCount}/${limit}`);
          
          if (currentCount >= limit) {
            console.log(`   ✅ Loaded ${currentCount} projects (target reached)`);
            break;
          }
          
          await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
          await page.waitForTimeout(3000);
          
          scrollAttempts++;
          await this.rateLimitDelay();
        }
        
        console.log(`   ✅ Scrolling complete after ${scrollAttempts} attempts`);
      }
      
      await this.rateLimitDelay();
      
      // Extract project data (Phase 2C: Updated to working selectors)
      const projects = await page.evaluate((lim) => {
        const results = [];
        const seen = new Set(); // Prevent duplicates
        
        // Phase 2C: Use verified working selectors
        const selectors = [
          '.js-project-cover',             // Primary: Clean project covers
          'a[href*="/gallery/"]',          // Secondary: Gallery links
          '[class*="ProjectCoverNeue"]'    // Tertiary: New project cover component
        ];
        
        let projectElements = [];
        for (const selector of selectors) {
          const elements = document.querySelectorAll(selector);
          if (elements.length > 0) {
            projectElements = Array.from(elements);
            break;
          }
        }
        
        for (let i = 0; i < projectElements.length && results.length < lim; i++) {
          const el = projectElements[i];
          
          // Find link (element might be link itself or contain one)
          const link = el.tagName === 'A' ? el : el.closest('a') || el.querySelector('a');
          if (!link || !link.href) continue;
          
          // Skip duplicates
          if (seen.has(link.href)) continue;
          seen.add(link.href);
          
          // Find image
          const img = el.querySelector('img') || (el.tagName === 'IMG' ? el : null);
          if (!img || !img.src) continue;
          
          // Skip owner avatars and UI icons
          if (img.src.includes('avatar') || 
              img.src.includes('/img/') || 
              img.alt?.toLowerCase().includes('avatar') ||
              img.alt?.toLowerCase().includes('ui/ux')) {
            continue;
          }
          
          // Get title from image alt or nearby text
          const titleEl = el.querySelector('h3, h4, [class*="Title"]');
          const title = img.alt || titleEl?.textContent?.trim() || 'Untitled Project';
          
          results.push({
            imageUrl: img.src,
            title: title.trim().substring(0, 100),
            url: link.href,
            source: 'behance'
          });
        }
        
        return results;
      }, limit);
      
      // Update analytics
      analytics.extractionAttempts = projects.length;
      analytics.successfulExtractions = projects.filter(p => p.imageUrl && p.url).length;
      analytics.failedExtractions = projects.length - analytics.successfulExtractions;
      analytics.endTime = new Date().toISOString();
      analytics.duration = Date.now() - startTime;
      analytics.extractionRate = analytics.duration > 0 ? (analytics.successfulExtractions / (analytics.duration / 1000 / 60)).toFixed(2) : 0;
      
      console.log(`✅ Extracted ${projects.length} projects from Behance`);
      console.log(`   📊 Success rate: ${((analytics.successfulExtractions / projects.length) * 100).toFixed(1)}%`);
      console.log(`   ⏱️  Duration: ${(analytics.duration / 1000).toFixed(1)}s`);
      console.log(`   📈 Rate: ${analytics.extractionRate} designs/min`);
      
      await browser.close();
      console.log('   ✅ Browser closed');
      
      // Store analytics
      if (!options._skipAnalytics) {
        this._sourceAnalytics = this._sourceAnalytics || [];
        this._sourceAnalytics.push(analytics);
      }
      
      return projects;
      
    } catch (error) {
      console.error(`❌ Error crawling Behance:`, error.message);
      
      // Update analytics with error
      analytics.endTime = new Date().toISOString();
      analytics.duration = Date.now() - startTime;
      analytics.errors.push({ type: 'fatal', message: error.message, stack: error.stack });
      analytics.failed = true;
      
      // Store failed analytics
      if (!options._skipAnalytics) {
        this._sourceAnalytics = this._sourceAnalytics || [];
        this._sourceAnalytics.push(analytics);
      }
      
      if (browser) {
        await browser.close();
        console.log('   ✅ Browser closed');
      }
      
      // Retry once if failed
      if (!options._retried) {
        console.log(`   🔄 Retrying...`);
        await this.rateLimitDelay();
        return await this.crawlBehance({ ...options, _retried: true });
      }
      
      return [];
    }
  },
  
  /**
   * Crawl all enabled data sources
   */
  async crawlAllSources(options = {}) {
    console.log('\n🌐 Crawling all enabled sources...');
    
    // Initialize source analytics storage
    this._sourceAnalytics = [];
    const allShots = [];
    const crawlStartTime = Date.now();
    
    // Dribbble
    if (this.config.dataSources.dribbble.enabled) {
      const dribbbleShots = await this.crawlDribbble(options);
      allShots.push(...dribbbleShots.map(s => ({ ...s, source: 'dribbble' })));
    }
    
    // Awwwards - NOW ENABLED with Playwright
    if (this.config.dataSources.awwwards.enabled) {
      const awwwardsShots = await this.crawlAwwwards(options);
      allShots.push(...awwwardsShots.map(s => ({ ...s, source: 'awwwards' })));
    }
    
    // SiteInspire - NOW ENABLED with Playwright
    if (this.config.dataSources.siteinspire?.enabled) {
      const siteInspireShots = await this.crawlSiteInspire(options);
      allShots.push(...siteInspireShots.map(s => ({ ...s, source: 'siteinspire' })));
    }
    
    // Behance - Phase 2B: NEW SOURCE for hybrid approach!
    if (this.config.dataSources.behance?.enabled) {
      const behanceShots = await this.crawlBehance(options);
      allShots.push(...behanceShots.map(s => ({ ...s, source: 'behance' })));
    }
    
    const totalDuration = Date.now() - crawlStartTime;
    
    console.log(`\n✅ Total designs collected: ${allShots.length}`);
    console.log(`   Dribbble: ${allShots.filter(s => s.source === 'dribbble').length}`);
    console.log(`   Awwwards: ${allShots.filter(s => s.source === 'awwwards').length}`);
    console.log(`   SiteInspire: ${allShots.filter(s => s.source === 'siteinspire').length}`);
    console.log(`   Behance: ${allShots.filter(s => s.source === 'behance').length}`);
    console.log(`   ⏱️  Total time: ${(totalDuration / 1000).toFixed(1)}s`);
    
    // Generate source analytics report
    if (!options._skipAnalytics) {
      await this.generateSourceAnalyticsReport({
        totalDuration,
        totalDesigns: allShots.length,
        sourceBreakdown: {
          dribbble: allShots.filter(s => s.source === 'dribbble').length,
          awwwards: allShots.filter(s => s.source === 'awwwards').length,
          siteinspire: allShots.filter(s => s.source === 'siteinspire').length,
          behance: allShots.filter(s => s.source === 'behance').length
        }
      });
    }
    
    return allShots;
  },
  
  /**
   * Extract dominant colors from an image URL
   */
  async extractColorsFromImage(imageUrl, options = {}) {
    const colorCount = options.colorCount || 5;
    
    try {
      // Skip invalid URLs
      if (imageUrl.startsWith('data:')) {
        return [];
      }
      
      // Import node-vibrant dynamically (use /node for Node.js environment, named export)
      const { Vibrant } = await import('node-vibrant/node');
      
      // Handle WebP and other formats by converting to buffer
      let palette;
      
      if (imageUrl.includes('format=webp') || imageUrl.endsWith('.webp') || imageUrl.includes('.png')) {
        try {
          const sharp = (await import('sharp')).default;
          const fetch = (await import('node-fetch')).default;
          
          // Fetch image
          const response = await fetch(imageUrl);
          const arrayBuffer = await response.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          
          // Convert to PNG if WebP
          let processedBuffer = buffer;
          if (imageUrl.includes('format=webp') || imageUrl.endsWith('.webp')) {
            processedBuffer = await sharp(buffer).png().toBuffer();
          }
          
          // Extract palette from buffer
          palette = await Vibrant.from(processedBuffer).getPalette();
          
        } catch (conversionError) {
          console.log(`     ⚠️  Image processing failed: ${conversionError.message}`);
          return [];
        }
      } else {
        // Try direct URL extraction for other formats
        palette = await Vibrant.from(imageUrl).getPalette();
      }
      
      // Convert to our format
      const colors = [];
      const paletteKeys = ['Vibrant', 'DarkVibrant', 'LightVibrant', 'Muted', 'DarkMuted', 'LightMuted'];
      
      for (const key of paletteKeys) {
        const swatch = palette[key];
        if (swatch && colors.length < colorCount) {
          colors.push({
            hex: swatch.hex,
            rgb: swatch.rgb,
            population: swatch.population,
            context: key.toLowerCase()
          });
        }
      }
      
      return colors;
      
    } catch (error) {
      console.error(`   ⚠️  Failed to extract colors from ${imageUrl}:`, error.message);
      return [];
    }
  },
  
  /**
   * Extract colors from multiple shots
   */
  async extractColorsFromShots(shots, options = {}) {
    console.log(`\n🎨 Extracting colors from ${shots.length} designs...`);
    const results = [];
    
    for (let i = 0; i < shots.length; i++) {
      const shot = shots[i];
      console.log(`   Processing ${i + 1}/${shots.length}: ${shot.title}`);
      
      // Rate limit between image requests
      if (i > 0) {
        await this.rateLimitDelay();
      }
      
      const colors = await this.extractColorsFromImage(shot.imageUrl, options);
      
      if (colors.length > 0) {
        results.push({
          ...shot,
          colors
        });
      }
    }
    
    console.log(`✅ Extracted colors from ${results.length}/${shots.length} designs`);
    return results;
  },
  
  /**
   * Extract colors directly from screenshot buffer
   * Fixes the issue where color extraction was trying to load non-existent og-image.png
   */
  async extractColorsFromScreenshot(screenshotBuffer, options = {}) {
    const colorCount = options.colorCount || 5;
    
    try {
      // Import node-vibrant dynamically
      const { Vibrant } = await import('node-vibrant/node');
      
      // Extract palette directly from buffer
      const palette = await Vibrant.from(screenshotBuffer).getPalette();
      
      // Convert to our format
      const colors = [];
      const paletteKeys = ['Vibrant', 'DarkVibrant', 'LightVibrant', 'Muted', 'DarkMuted', 'LightMuted'];
      
      for (const key of paletteKeys) {
        const swatch = palette[key];
        if (swatch && colors.length < colorCount) {
          colors.push({
            hex: swatch.hex,
            rgb: swatch.rgb,
            population: swatch.population,
            context: key.toLowerCase()
          });
        }
      }
      
      return colors;
      
    } catch (error) {
      console.error(`   ⚠️  Failed to extract colors from screenshot: ${error.message}`);
      return [];
    }
  },
  
  /**
   * Extract design metrics from multiple shots (Phase 2A: Color + Whitespace + Complexity + Image/Text)
   */
  async extractDesignMetricsFromShots(shots, options = {}) {
    const includeHierarchy = options.includeHierarchy !== false; // Default: true
    
    console.log(`\n📊 Extracting design metrics from ${shots.length} designs...`);
    console.log(`   Phase 2A: Colors ✅, Whitespace ✅, Complexity ✅, Image/Text ✅`);
    console.log(`   Phase 2B: Typography ✅, Layout ✅, CTA ✅`);
    console.log(`   Phase 2C: Visual Hierarchy ${includeHierarchy ? '✅' : '⏭️ (skipped)'}`);
    console.log(`   Total: ${includeHierarchy ? '8' : '7'} DIMENSIONS!`);
    
    const results = [];
    
    for (let i = 0; i < shots.length; i++) {
      const shot = shots[i];
      console.log(`\n   [${i + 1}/${shots.length}] ${shot.title}`);
      
      // Rate limit between image requests
      if (i > 0) {
        await this.rateLimitDelay();
      }
      
      try {
        // Fetch image as buffer
        const imageBuffer = await this.fetchImageAsBuffer(shot.imageUrl);
        
        if (!imageBuffer) {
          console.log(`   ⚠️  Failed to fetch image buffer`);
          continue;
        }
        
        // === PHASE 1: Colors ===
        const colors = await this.extractColorsFromImage(shot.imageUrl, options);
        
        // === PHASE 2A: Quick Wins (3 dimensions) ===
        const whitespace = await this.analyzeWhitespaceRatio(imageBuffer);
        const complexity = await this.analyzeComplexity(imageBuffer);
        const imageTextRatio = await this.analyzeImageTextRatio(imageBuffer);
        
        // === PHASE 2B: High Value (3 dimensions) ===
        const typography = await this.analyzeTypographyScale(imageBuffer);
        const layout = await this.analyzeLayoutPattern(imageBuffer);
        const ctaProminence = await this.analyzeCTAProminence(imageBuffer);
        
        // === PHASE 2C: Visual Hierarchy (requires live URL) ===
        let hierarchy = null;
        if (includeHierarchy && shot.url) {
          try {
            hierarchy = await this.analyzeVisualHierarchy(shot.url);
          } catch (error) {
            console.log(`   ⚠️  Hierarchy analysis skipped: ${error.message}`);
          }
        }
        
        results.push({
          ...shot,
          colors,
          whitespace,
          complexity,
          imageTextRatio,
          typography,
          layout,
          ctaProminence,
          ...(hierarchy && { hierarchy })
        });
        
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
      }
    }
    
    const dimensionCount = includeHierarchy ? 8 : 7;
    console.log(`\n✅ Extracted ${dimensionCount}-dimensional metrics from ${results.length}/${shots.length} designs`);
    return results;
  },
  
  /**
   * Fetch image as buffer for OpenCV/Tesseract processing
   * Converts WebP to PNG for compatibility
   */
  async fetchImageAsBuffer(imageUrl) {
    try {
      // Skip invalid URLs
      if (imageUrl.startsWith('data:')) {
        return null;
      }
      
      const fetch = (await import('node-fetch')).default;
      const sharp = (await import('sharp')).default;
      
      const response = await fetch(imageUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      let buffer = Buffer.from(arrayBuffer);
      
      // Convert WebP to PNG for better compatibility with Sharp and Tesseract
      if (imageUrl.includes('.webp') || imageUrl.includes('format=webp')) {
        try {
          buffer = await sharp(buffer).png().toBuffer();
        } catch (conversionError) {
          console.log(`     ⚠️  WebP conversion failed: ${conversionError.message}`);
          // Return original buffer, might still work
        }
      }
      
      return buffer;
      
    } catch (error) {
      console.log(`   ⚠️  Failed to fetch image: ${error.message}`);
      return null;
    }
  },
  
  /**
   * Calculate quality score for a pattern
   */
  calculatePatternQuality(cluster, shotsWithColors) {
    // Factors:
    // 1. Sample size (more samples = higher confidence)
    // 2. Source diversity (multiple sources = more validated)
    // 3. Color cohesion (tight clustering = clear pattern)
    
    const sampleScore = Math.min(cluster.shots.length / 10, 1); // Max at 10 samples
    
    // Source diversity
    const sources = new Set(cluster.shots.map(s => s.source));
    const diversityScore = sources.size / 3; // Max 3 sources
    
    // Weighted by source reputation
    let weightedScore = 0;
    cluster.shots.forEach(shot => {
      const sourceConfig = this.config.dataSources[shot.source];
      if (sourceConfig) {
        weightedScore += sourceConfig.weight || 1.0;
      } else {
        weightedScore += 1.0;
      }
    });
    weightedScore = weightedScore / cluster.shots.length;
    
    // Combined quality score (0-1)
    const quality = (sampleScore * 0.4 + diversityScore * 0.3 + (weightedScore / 1.5) * 0.3);
    
    return parseFloat(quality.toFixed(3));
  },
  
  /**
   * Cluster whitespace patterns from design data
   */
  async clusterWhitespacePatterns(designData) {
    console.log('\n⬜ Clustering whitespace patterns...');
    
    // Define whitespace ranges based on industry standards
    const ranges = [
      { min: 0.60, max: 0.75, name: 'Premium Spacious', pattern: 'Luxury/Premium' },
      { min: 0.45, max: 0.60, name: 'Professional Balanced', pattern: 'Professional SaaS' },
      { min: 0.30, max: 0.45, name: 'Content-Rich', pattern: 'E-commerce' },
      { min: 0, max: 0.30, name: 'Dense Layout', pattern: 'Budget/Dense' }
    ];
    
    const patterns = ranges.map(range => {
      const matching = designData.filter(d => 
        d.whitespace && 
        d.whitespace.ratio >= range.min && 
        d.whitespace.ratio < range.max
      );
      
      if (matching.length === 0) return null;
      
      const avgRatio = matching.reduce((sum, d) => sum + d.whitespace.ratio, 0) / matching.length;
      
      return {
        name: range.name,
        range: `${(range.min * 100).toFixed(0)}-${(range.max * 100).toFixed(0)}%`,
        averageRatio: parseFloat(avgRatio.toFixed(3)),
        prevalence: `${((matching.length / designData.length) * 100).toFixed(0)}%`,
        sampleSize: matching.length,
        examples: matching.slice(0, 3).map(d => d.title),
        pattern: range.pattern
      };
    }).filter(Boolean);
    
    console.log(`   ✅ Generated ${patterns.length} whitespace patterns`);
    return patterns;
  },
  
  /**
   * Cluster complexity patterns from design data
   */
  async clusterComplexityPatterns(designData) {
    console.log('\n🔬 Clustering complexity patterns...');
    
    const ranges = [
      { min: 0, max: 0.3, name: 'Clean Minimalist', pattern: 'Minimalist Design' },
      { min: 0.3, max: 0.6, name: 'Balanced Professional', pattern: 'Balanced SaaS' },
      { min: 0.6, max: 0.8, name: 'Rich Content', pattern: 'Rich Content' },
      { min: 0.8, max: 1.0, name: 'Maximum Density', pattern: 'Maximum Density' }
    ];
    
    const patterns = ranges.map(range => {
      const matching = designData.filter(d => 
        d.complexity && 
        d.complexity.score >= range.min && 
        d.complexity.score < range.max
      );
      
      if (matching.length === 0) return null;
      
      const avgScore = matching.reduce((sum, d) => sum + d.complexity.score, 0) / matching.length;
      const avgEdgeDensity = matching.reduce((sum, d) => sum + (d.complexity.metrics?.edgeDensity || 0), 0) / matching.length;
      const avgColorComplexity = matching.reduce((sum, d) => sum + (d.complexity.metrics?.colorComplexity || 0), 0) / matching.length;
      
      return {
        name: range.name,
        scoreRange: `${(range.min * 100).toFixed(0)}-${(range.max * 100).toFixed(0)}`,
        averageScore: parseFloat(avgScore.toFixed(3)),
        averageEdgeDensity: parseFloat(avgEdgeDensity.toFixed(3)),
        averageColorComplexity: Math.round(avgColorComplexity),
        prevalence: `${((matching.length / designData.length) * 100).toFixed(0)}%`,
        sampleSize: matching.length,
        examples: matching.slice(0, 3).map(d => d.title),
        pattern: range.pattern
      };
    }).filter(Boolean);
    
    console.log(`   ✅ Generated ${patterns.length} complexity patterns`);
    return patterns;
  },
  
  /**
   * Cluster image/text ratio patterns from design data
   */
  async clusterImageTextPatterns(designData) {
    console.log('\n🖼️ Clustering image/text ratio patterns...');
    
    const categories = [
      { 
        name: 'Visual-First', 
        test: (d) => d.imageTextRatio && d.imageTextRatio.imageRatio > 0.6,
        pattern: 'Portfolio/Visual-First'
      },
      { 
        name: 'Text-Heavy', 
        test: (d) => d.imageTextRatio && d.imageTextRatio.textRatio > 0.4,
        pattern: 'Blog/Editorial'
      },
      { 
        name: 'Balanced Mix', 
        test: (d) => d.imageTextRatio && d.imageTextRatio.category === 'balanced',
        pattern: 'Professional SaaS'
      }
    ];
    
    const patterns = categories.map(category => {
      const matching = designData.filter(category.test);
      
      if (matching.length === 0) return null;
      
      const avgImageRatio = matching.reduce((sum, d) => sum + (d.imageTextRatio?.imageRatio || 0), 0) / matching.length;
      const avgTextRatio = matching.reduce((sum, d) => sum + (d.imageTextRatio?.textRatio || 0), 0) / matching.length;
      
      return {
        name: category.name,
        averageImageRatio: parseFloat(avgImageRatio.toFixed(3)),
        averageTextRatio: parseFloat(avgTextRatio.toFixed(3)),
        prevalence: `${((matching.length / designData.length) * 100).toFixed(0)}%`,
        sampleSize: matching.length,
        examples: matching.slice(0, 3).map(d => d.title),
        pattern: category.pattern
      };
    }).filter(Boolean);
    
    console.log(`   ✅ Generated ${patterns.length} image/text patterns`);
    return patterns;
  },
  
  /**
   * Cluster typography scale patterns (Phase 2B)
   */
  async clusterTypographyPatterns(designData) {
    console.log('\n🔤 Clustering typography scale patterns...');
    
    const scaleGroups = {};
    
    designData.forEach(design => {
      if (!design.typography || !design.typography.scaleType) return;
      
      const scaleType = design.typography.scaleType;
      if (!scaleGroups[scaleType]) {
        scaleGroups[scaleType] = [];
      }
      scaleGroups[scaleType].push(design);
    });
    
    const patterns = Object.entries(scaleGroups).map(([scaleType, designs]) => {
      const avgConsistency = designs.reduce((sum, d) => sum + (d.typography?.consistency || 0), 0) / designs.length;
      const avgSizeCount = designs.reduce((sum, d) => sum + (d.typography?.uniqueSizeCount || 0), 0) / designs.length;
      
      return {
        scaleType,
        prevalence: `${((designs.length / designData.length) * 100).toFixed(0)}%`,
        sampleSize: designs.length,
        avgConsistency: parseFloat(avgConsistency.toFixed(3)),
        avgSizeCount: Math.round(avgSizeCount),
        examples: designs.slice(0, 3).map(d => d.title),
        industryPattern: designs[0].typography?.industryMatch?.pattern || 'Unknown'
      };
    });
    
    console.log(`   ✅ Generated ${patterns.length} typography patterns`);
    return patterns;
  },
  
  /**
   * Cluster layout patterns (Phase 2B)
   */
  async clusterLayoutPatterns(designData) {
    console.log('\n📐 Clustering layout patterns...');
    
    const layoutGroups = {};
    
    designData.forEach(design => {
      if (!design.layout || !design.layout.layoutType) return;
      
      const layoutType = design.layout.layoutType;
      if (!layoutGroups[layoutType]) {
        layoutGroups[layoutType] = [];
      }
      layoutGroups[layoutType].push(design);
    });
    
    const patterns = Object.entries(layoutGroups).map(([layoutType, designs]) => {
      const avgColumns = designs.reduce((sum, d) => sum + (d.layout?.columns || 1), 0) / designs.length;
      const hasHeroCount = designs.filter(d => d.layout?.hasHero).length;
      
      return {
        layoutType,
        prevalence: `${((designs.length / designData.length) * 100).toFixed(0)}%`,
        sampleSize: designs.length,
        avgColumns: parseFloat(avgColumns.toFixed(1)),
        heroPercentage: `${((hasHeroCount / designs.length) * 100).toFixed(0)}%`,
        examples: designs.slice(0, 3).map(d => d.title),
        industryPattern: designs[0].layout?.industryMatch?.pattern || 'Unknown'
      };
    });
    
    console.log(`   ✅ Generated ${patterns.length} layout patterns`);
    return patterns;
  },
  
  /**
   * Cluster CTA prominence patterns (Phase 2B)
   */
  async clusterCTAPatterns(designData) {
    console.log('\n🎯 Clustering CTA prominence patterns...');
    
    const patterns = {
      'High-Converting (1-2 CTAs, Strong Prominence)': [],
      'Focused (1 CTA)': [],
      'Multiple (3+ CTAs)': [],
      'Subtle/Hidden': []
    };
    
    designData.forEach(design => {
      const cta = design.ctaProminence;
      if (!cta) return;
      
      if (cta.ctaCount === 0 || cta.totalProminence < 2) {
        patterns['Subtle/Hidden'].push(design);
      } else if (cta.ctaCount <= 2 && cta.totalProminence >= 5) {
        patterns['High-Converting (1-2 CTAs, Strong Prominence)'].push(design);
      } else if (cta.ctaCount === 1) {
        patterns['Focused (1 CTA)'].push(design);
      } else {
        patterns['Multiple (3+ CTAs)'].push(design);
      }
    });
    
    const result = Object.entries(patterns)
      .filter(([_, designs]) => designs.length > 0)
      .map(([pattern, designs]) => {
        const avgProminence = designs.reduce((sum, d) => sum + (d.ctaProminence?.totalProminence || 0), 0) / designs.length;
        const avgCount = designs.reduce((sum, d) => sum + (d.ctaProminence?.ctaCount || 0), 0) / designs.length;
        
        return {
          pattern,
          prevalence: `${((designs.length / designData.length) * 100).toFixed(0)}%`,
          sampleSize: designs.length,
          avgProminence: parseFloat(avgProminence.toFixed(2)),
          avgCount: parseFloat(avgCount.toFixed(1)),
          examples: designs.slice(0, 3).map(d => d.title)
        };
      });
    
    console.log(`   ✅ Generated ${result.length} CTA patterns`);
    return result;
  },
  
  /**
   * Cluster Visual Hierarchy patterns (Phase 2C)
   */
  async clusterHierarchyPatterns(designData) {
    console.log('\n👁️ Clustering visual hierarchy patterns...');
    
    // Filter designs that have hierarchy data
    const designsWithHierarchy = designData.filter(d => d.hierarchy);
    
    if (designsWithHierarchy.length === 0) {
      console.log('   ⚠️  No hierarchy data available (requires live URLs)');
      console.log('   ℹ️  Hierarchy analysis skipped for pattern learning');
      return [];
    }
    
    console.log(`   📊 Analyzing ${designsWithHierarchy.length}/${designData.length} designs with hierarchy data`);
    
    // Enhanced pattern categories based on clarity + focal point type
    const patterns = {
      'Hero-Driven (H1-First, High Clarity)': [],
      'CTA-Focused (Button-First, High Clarity)': [],
      'Image-Driven (Visual-First, High Clarity)': [],
      'Content-Rich (Balanced, Moderate Clarity)': [],
      'Brand-First (Logo/Nav-First, Good Clarity)': [],
      'Weak Hierarchy (Low Clarity)': []
    };
    
    designsWithHierarchy.forEach(design => {
      const hierarchy = design.hierarchy;
      if (!hierarchy) return;
      
      const clarity = hierarchy.hierarchyClarity || 0;
      const primaryFocal = hierarchy.focalPoints?.[0]?.tagName?.toLowerCase() || 'unknown';
      const aboveFoldRatio = hierarchy.aboveFoldRatio || 0;
      
      // Classification based on clarity score + primary focal point
      // High clarity: > 20x (strong focal point dominance)
      // Moderate clarity: 10-20x (clear but not dominant)
      // Low clarity: < 10x (weak hierarchy)
      
      if (clarity < 10) {
        // Weak hierarchy (genuinely poor)
        patterns['Weak Hierarchy (Low Clarity)'].push(design);
        
      } else if (clarity >= 20 && primaryFocal === 'h1') {
        // Hero-driven: H1 is primary + high clarity
        patterns['Hero-Driven (H1-First, High Clarity)'].push(design);
        
      } else if (clarity >= 20 && primaryFocal === 'button') {
        // CTA-focused: Button is primary + high clarity
        patterns['CTA-Focused (Button-First, High Clarity)'].push(design);
        
      } else if (clarity >= 20 && (primaryFocal === 'img' || primaryFocal === 'figure' || primaryFocal.includes('image'))) {
        // Image-driven: Visual element is primary + high clarity
        patterns['Image-Driven (Visual-First, High Clarity)'].push(design);
        
      } else if (clarity >= 20 && (primaryFocal === 'nav' || primaryFocal === 'header' || primaryFocal.includes('logo'))) {
        // Brand-first: Logo/nav is primary + high clarity
        patterns['Brand-First (Logo/Nav-First, Good Clarity)'].push(design);
        
      } else if (clarity >= 10 && clarity < 20) {
        // Content-rich: Moderate clarity (multiple focal points)
        patterns['Content-Rich (Balanced, Moderate Clarity)'].push(design);
        
      } else {
        // High clarity but unclassified focal type → Image-driven (most common for design showcases)
        patterns['Image-Driven (Visual-First, High Clarity)'].push(design);
      }
    });
    
    const result = Object.entries(patterns)
      .filter(([_, designs]) => designs.length > 0)
      .map(([pattern, designs]) => {
        const avgClarity = designs.reduce((sum, d) => sum + (d.hierarchy?.hierarchyClarity || 0), 0) / designs.length;
        const avgAboveFold = designs.reduce((sum, d) => sum + (d.hierarchy?.aboveFoldRatio || 0), 0) / designs.length;
        const avgFocalPoints = designs.reduce((sum, d) => sum + (d.hierarchy?.focalPoints?.length || 0), 0) / designs.length;
        
        // Get top focal point types for this pattern
        const focalPointTypes = {};
        designs.forEach(d => {
          const focal = d.hierarchy?.focalPoints?.[0]?.tagName?.toLowerCase() || 'unknown';
          focalPointTypes[focal] = (focalPointTypes[focal] || 0) + 1;
        });
        const topFocalType = Object.entries(focalPointTypes)
          .sort((a, b) => b[1] - a[1])[0]?.[0] || 'unknown';
        
        return {
          pattern,
          prevalence: `${((designs.length / designsWithHierarchy.length) * 100).toFixed(0)}%`,
          sampleSize: designs.length,
          avgClarity: parseFloat(avgClarity.toFixed(2)),
          avgAboveFoldRatio: parseFloat(avgAboveFold.toFixed(3)),
          avgFocalPoints: parseFloat(avgFocalPoints.toFixed(1)),
          topFocalType,
          examples: designs.slice(0, 3).map(d => d.title)
        };
      })
      .sort((a, b) => b.sampleSize - a.sampleSize); // Sort by prevalence
    
    console.log(`   ✅ Generated ${result.length} visual hierarchy patterns`);
    result.forEach(p => {
      console.log(`      • ${p.pattern}: ${p.prevalence} (${p.sampleSize} designs, clarity: ${p.avgClarity}x)`);
    });
    
    return result;
  },
  
  /**
   * Cluster color schemes using k-means with source weighting
   */
  async clusterColorSchemes(shotsWithColors, options = {}) {
    const k = options.clusters || 10;
    
    console.log(`\n🔬 Clustering color schemes (k=${k})...`);
    if (this.config.patternLearning.multiSourceWeighting) {
      console.log(`   ⚖️  Multi-source weighting enabled`);
    }
    
    try {
      // Import ml-kmeans (it's a named export)
      const { kmeans } = await import('ml-kmeans');
      
      // Extract all primary colors (first color from each shot)
      const primaryColors = shotsWithColors
        .filter(s => s.colors && s.colors.length > 0)
        .map(s => s.colors[0].rgb);
      
      if (primaryColors.length === 0) {
        console.log('⚠️  No colors to cluster');
        return [];
      }
      
      // Adjust k if we have fewer samples than clusters
      const actualK = Math.min(k, primaryColors.length);
      
      if (actualK < k) {
        console.log(`   ⚠️  Adjusting clusters from ${k} to ${actualK} (limited by sample size)`);
      }
      
      // Need at least 2 points to cluster
      if (actualK < 2) {
        console.log('⚠️  Need at least 2 colors to cluster');
        return [];
      }
      
      // Run k-means clustering
      const result = kmeans(primaryColors, actualK, {
        initialization: 'kmeans++',
        maxIterations: 100
      });
      
      // Group shots by cluster
      const clusters = [];
      for (let i = 0; i < k; i++) {
        clusters[i] = {
          id: i,
          centroid: result.centroids[i],
          shots: []
        };
      }
      
      shotsWithColors.forEach((shot, idx) => {
        if (shot.colors.length > 0) {
          const clusterIdx = result.clusters[idx];
          if (clusters[clusterIdx]) {
            clusters[clusterIdx].shots.push(shot);
          }
        }
      });
      
      // Convert to patterns with quality scoring
      const patterns = clusters
        .filter(c => c.shots.length > 0)
        .map(cluster => {
          const centroidHex = this.rgbToHex(
            Math.round(cluster.centroid[0]),
            Math.round(cluster.centroid[1]),
            Math.round(cluster.centroid[2])
          );
          
          // Calculate quality score
          const qualityScore = this.calculatePatternQuality(cluster, shotsWithColors);
          
          // Calculate prevalence
          const prevalence = ((cluster.shots.length / shotsWithColors.length) * 100).toFixed(0);
          
          // Get sources
          const sources = [...new Set(cluster.shots.map(s => s.source))];
          
          // Get top examples (weighted by source + likes)
          const topShots = cluster.shots
            .sort((a, b) => {
              const aWeight = this.config.dataSources[a.source]?.weight || 1.0;
              const bWeight = this.config.dataSources[b.source]?.weight || 1.0;
              const aLikes = parseInt(a.likes || '0');
              const bLikes = parseInt(b.likes || '0');
              return (bLikes * bWeight) - (aLikes * aWeight);
            })
            .slice(0, 3);
          
          return {
            id: `pattern-${cluster.id}`,
            name: this.generatePatternName(centroidHex),
            primary: {
              hex: centroidHex,
              rgb: cluster.centroid.map(Math.round)
            },
            prevalence: `${prevalence}%`,
            examples: topShots.map(s => s.title),
            sources: sources,
            firstSeen: new Date().toISOString().split('T')[0],
            lastUpdated: new Date().toISOString().split('T')[0],
            sampleSize: cluster.shots.length,
            qualityScore: qualityScore,
            trending: false // Will be updated in pattern tracking
          };
        })
        .filter(p => p.qualityScore >= this.config.patternLearning.qualityThreshold)
        .sort((a, b) => b.qualityScore - a.qualityScore);
      
      console.log(`✅ Generated ${patterns.length} patterns (filtered by quality >= ${this.config.patternLearning.qualityThreshold})`);
      return patterns;
      
    } catch (error) {
      console.error(`❌ Error clustering colors:`, error.message);
      return [];
    }
  },
  
  /**
   * Generate a descriptive pattern name from a hex color
   */
  generatePatternName(hex) {
    const rgb = this.hexToRgb(hex);
    const [r, g, b] = rgb;
    
    // Simple heuristic for color naming
    if (r > 200 && g < 100 && b < 100) return 'Vibrant Red';
    if (r < 100 && g > 200 && b < 100) return 'Fresh Green';
    if (r < 100 && g < 100 && b > 200) return 'Trust Blue';
    if (r > 200 && g > 150 && b < 100) return 'Warm Orange';
    if (r > 150 && g < 100 && b > 150) return 'Bold Purple';
    if (r > 200 && g > 200 && b < 100) return 'Bright Yellow';
    if (r < 100 && g > 150 && b > 150) return 'Cool Teal';
    if (r > 100 && r < 150 && g > 100 && g < 150 && b > 100 && b < 150) return 'Neutral Gray';
    
    // Fallback: use hue-based naming
    const max = Math.max(r, g, b);
    if (max === r) return 'Red Spectrum';
    if (max === g) return 'Green Spectrum';
    return 'Blue Spectrum';
  },
  
  /**
   * Learn patterns from all sources (multi-source, multi-dimensional)
   */
  async learnPatternsFromAllSources(options = {}) {
    console.log('\n🎓 Learning patterns from all sources...');
    console.log('═'.repeat(60));
    
    // Step 1: Crawl all enabled sources
    const shots = await this.crawlAllSources(options);
    
    if (shots.length === 0) {
      console.log('❌ No designs extracted. Aborting.');
      return null;
    }
    
    // Step 2: Extract ALL design metrics (Phase 2A: 4 dimensions)
    console.log('\n📊 Extracting multi-dimensional design metrics...');
    const designData = await this.extractDesignMetricsFromShots(shots, options);
    
    if (designData.length === 0) {
      console.log('❌ No design data extracted. Aborting.');
      return null;
    }
    
    // Step 3: Cluster patterns for EACH dimension
    console.log('\n🔬 Clustering multi-dimensional patterns...');
    
    // 3a. Color patterns (existing)
    const colorPatterns = await this.clusterColorSchemes(designData, options);
    
    // 3b. Whitespace patterns (NEW!)
    const whitespacePatterns = await this.clusterWhitespacePatterns(designData);
    
    // 3c. Complexity patterns (NEW!)
    const complexityPatterns = await this.clusterComplexityPatterns(designData);
    
    // 3d. Image/Text patterns (NEW!)
    const imageTextPatterns = await this.clusterImageTextPatterns(designData);
    
    // Phase 2B: New clustering methods
    const typographyPatterns = await this.clusterTypographyPatterns(designData);
    const layoutPatterns = await this.clusterLayoutPatterns(designData);
    const ctaPatterns = await this.clusterCTAPatterns(designData); // Uses actual function name
    
    // Phase 2C: Visual Hierarchy (if data available)
    const hierarchyPatterns = await this.clusterHierarchyPatterns(designData);
    
    // Check if any patterns were generated (colors no longer required)
    const totalPatterns = whitespacePatterns.length + complexityPatterns.length + 
                          imageTextPatterns.length + typographyPatterns.length + 
                          layoutPatterns.length + ctaPatterns.length + hierarchyPatterns.length;
    
    if (totalPatterns === 0 && colorPatterns.length === 0) {
      console.log('❌ No patterns generated from any dimension. Aborting.');
      return null;
    }
    
    if (colorPatterns.length === 0) {
      console.log('⚠️  Warning: No color patterns generated (color extraction may have failed)');
      console.log('   ✅ Continuing with other dimensions...');
    }
    
    // Step 4: Create comprehensive multi-dimensional report
    const report = {
      meta: {
        date: new Date().toISOString(),
        sources: [...new Set(shots.map(s => s.source))],
        shotsAnalyzed: shots.length,
        designsExtracted: designData.length,
        dimensions: ['colors', 'whitespace', 'complexity', 'imageText', 'typography', 'layout', 'ctaProminence', 'hierarchy'],
        patternsGenerated: {
          colors: colorPatterns.length,
          whitespace: whitespacePatterns.length,
          complexity: complexityPatterns.length,
          imageText: imageTextPatterns.length,
          typography: typographyPatterns.length,
          layout: layoutPatterns.length,
          ctaProminence: ctaPatterns.length,
          hierarchy: hierarchyPatterns.length,
          total: colorPatterns.length + whitespacePatterns.length + 
                 complexityPatterns.length + imageTextPatterns.length +
                 typographyPatterns.length + layoutPatterns.length + ctaPatterns.length +
                 hierarchyPatterns.length
        },
        awaitingReview: true
      },
      
      // All pattern types (Phase 2A + Phase 2B + Phase 2C)
      patterns: {
        colors: colorPatterns,
        whitespace: whitespacePatterns,
        complexity: complexityPatterns,
        imageText: imageTextPatterns,
        typography: typographyPatterns,
        layout: layoutPatterns,
        ctaProminence: ctaPatterns,
        hierarchy: hierarchyPatterns
      },
      
      rawData: {
        shots: shots.slice(0, 10), // Include first 10 for reference
        topDesigns: designData.slice(0, 5),
        sourceBreakdown: {
          dribbble: shots.filter(s => s.source === 'dribbble').length,
          awwwards: shots.filter(s => s.source === 'awwwards').length,
          siteinspire: shots.filter(s => s.source === 'siteinspire').length
        }
      },
      
      qualityMetrics: {
        avgQualityScore: colorPatterns.length > 0 
          ? (colorPatterns.reduce((sum, p) => sum + p.qualityScore, 0) / colorPatterns.length).toFixed(3)
          : '0',
        highQualityPatterns: colorPatterns.filter(p => p.qualityScore >= 0.8).length,
        multiSourcePatterns: colorPatterns.filter(p => p.sources.length > 1).length,
        dimensionsCaptured: 7,
        totalPatterns: colorPatterns.length + whitespacePatterns.length + 
                       complexityPatterns.length + imageTextPatterns.length
      }
    };
    
    // Step 5: Save report
    const timestamp = new Date().toISOString().split('T')[0];
    const reportDir = `docs/visual-design-audits/${timestamp}`;
    const reportPath = `${reportDir}/pattern-learning.json`;
    
    // Create directory and write file using Node.js fs
    const fs = await import('fs');
    await fs.promises.mkdir(reportDir, { recursive: true });
    await fs.promises.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf8');
    
    console.log(`\n✅ Pattern learning complete!`);
    console.log(`📊 Designs analyzed: ${shots.length}`);
    console.log(`🎨 Metrics extracted: ${designData.length}`);
    console.log(`📦 Patterns generated (7 dimensions):`);
    console.log(`   • Colors: ${colorPatterns.length}`);
    console.log(`   • Whitespace: ${whitespacePatterns.length}`);
    console.log(`   • Complexity: ${complexityPatterns.length}`);
    console.log(`   • Image/Text: ${imageTextPatterns.length}`);
    console.log(`   • Typography: ${typographyPatterns.length} (Phase 2B)`);
    console.log(`   • Layout: ${layoutPatterns.length} (Phase 2B)`);
    console.log(`   • CTA Prominence: ${ctaPatterns.length} (Phase 2B)`);
    console.log(`   • Visual Hierarchy: ${hierarchyPatterns.length} (Phase 2C)`);
    console.log(`   • TOTAL: ${report.meta.patternsGenerated.total}`);
    console.log(`💾 Report saved: ${reportPath}`);
    
    return report;
  },
  
  /**
   * Learn patterns from Dribbble only (legacy method)
   */
  async learnPatternsFromDribbble(options = {}) {
    console.log('\n🎓 Learning patterns from Dribbble...');
    console.log('═'.repeat(60));
    
    // Step 1: Crawl Dribbble
    const shots = await this.crawlDribbble(options);
    
    if (shots.length === 0) {
      console.log('❌ No shots extracted. Aborting.');
      return null;
    }
    
    // Step 2: Extract colors
    const shotsWithColors = await this.extractColorsFromShots(shots, options);
    
    if (shotsWithColors.length === 0) {
      console.log('❌ No colors extracted. Aborting.');
      return null;
    }
    
    // Step 3: Cluster into patterns
    const patterns = await this.clusterColorSchemes(shotsWithColors, options);
    
    if (patterns.length === 0) {
      console.log('❌ No patterns generated. Aborting.');
      return null;
    }
    
    // Step 4: Create update report
    const report = {
      meta: {
        date: new Date().toISOString(),
        source: 'dribbble',
        shotsAnalyzed: shots.length,
        colorsExtracted: shotsWithColors.length,
        patternsGenerated: patterns.length
      },
      patterns,
      rawData: {
        shots: shots.slice(0, 10), // Include first 10 for reference
        topColors: shotsWithColors.slice(0, 5)
      }
    };
    
    // Step 5: Save report
    const timestamp = new Date().toISOString().split('T')[0];
    const reportPath = `docs/pattern-updates/${timestamp}-dribbble-patterns.json`;
    
    await run_terminal_cmd(`mkdir -p docs/pattern-updates`, false);
    await write(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`\n✅ Pattern learning complete!`);
    console.log(`📊 Shots analyzed: ${shots.length}`);
    console.log(`🎨 Colors extracted: ${shotsWithColors.length}`);
    console.log(`📦 Patterns generated: ${patterns.length}`);
    console.log(`💾 Report saved: ${reportPath}`);
    
    return report;
  },
  
  /**
   * Track A/B test results for pattern effectiveness
   */
  async trackPatternEffectiveness(patternId, metrics) {
    console.log(`\n📈 Tracking effectiveness for pattern: ${patternId}`);
    
    const effectivenessData = {
      patternId,
      metrics: {
        conversionRate: metrics.conversionRate || null,
        engagementRate: metrics.engagementRate || null,
        bounceRate: metrics.bounceRate || null,
        trustScore: metrics.trustScore || null,
        ...metrics
      },
      timestamp: new Date().toISOString(),
      testDuration: metrics.testDuration || '7d',
      sampleSize: metrics.sampleSize || 0
    };
    
    // Load existing effectiveness data
    const dataPath = `docs/pattern-updates/effectiveness-data.json`;
    let allData = [];
    
    try {
      const existingData = await readFile(dataPath);
      allData = JSON.parse(existingData);
    } catch (error) {
      // File doesn't exist yet
    }
    
    // Add new data point
    allData.push(effectivenessData);
    
    // Save updated data
    await write(dataPath, JSON.stringify(allData, null, 2));
    
    console.log(`✅ Effectiveness data saved`);
    console.log(`   Conversion rate: ${metrics.conversionRate || 'N/A'}`);
    console.log(`   Engagement rate: ${metrics.engagementRate || 'N/A'}`);
    
    return effectivenessData;
  },
  
  /**
   * Calculate pattern trending status
   */
  async calculateTrending(patternId) {
    const dataPath = `docs/pattern-updates/effectiveness-data.json`;
    
    try {
      const data = await readFile(dataPath);
      const allData = JSON.parse(data);
      
      // Get data for this pattern
      const patternData = allData.filter(d => d.patternId === patternId);
      
      if (patternData.length < 2) {
        return false; // Need at least 2 data points
      }
      
      // Sort by timestamp
      patternData.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      
      // Compare recent vs previous
      const recent = patternData[patternData.length - 1];
      const previous = patternData[patternData.length - 2];
      
      // Trending if conversion rate improved by 10%+
      const improvement = (recent.metrics.conversionRate - previous.metrics.conversionRate) / previous.metrics.conversionRate;
      
      return improvement >= 0.1;
      
    } catch (error) {
      return false;
    }
  },
  
  /**
   * Deprecate underperforming patterns
   */
  async deprecatePatterns(options = {}) {
    console.log('\n🗑️  Deprecating underperforming patterns...');
    
    const dataPath = `docs/pattern-updates/effectiveness-data.json`;
    const threshold = options.threshold || 0.05; // 5% conversion rate minimum
    
    try {
      const data = await readFile(dataPath);
      const allData = JSON.parse(data);
      
      // Group by pattern ID
      const patternPerformance = {};
      allData.forEach(d => {
        if (!patternPerformance[d.patternId]) {
          patternPerformance[d.patternId] = [];
        }
        patternPerformance[d.patternId].push(d);
      });
      
      // Find underperformers
      const toDeprecate = [];
      for (const [patternId, dataPoints] of Object.entries(patternPerformance)) {
        // Need at least 3 data points to deprecate
        if (dataPoints.length < 3) continue;
        
        // Calculate average conversion rate
        const avgConversion = dataPoints.reduce((sum, d) => sum + (d.metrics.conversionRate || 0), 0) / dataPoints.length;
        
        if (avgConversion < threshold) {
          toDeprecate.push({
            patternId,
            avgConversion,
            dataPoints: dataPoints.length
          });
        }
      }
      
      console.log(`❌ Found ${toDeprecate.length} underperforming patterns`);
      toDeprecate.forEach(p => {
        console.log(`   - ${p.patternId}: ${(p.avgConversion * 100).toFixed(2)}% avg conversion`);
      });
      
      // Save deprecation list
      const deprecationPath = `docs/pattern-updates/deprecated-patterns.json`;
      await write(deprecationPath, JSON.stringify({
        deprecatedAt: new Date().toISOString(),
        threshold: `${(threshold * 100).toFixed(0)}%`,
        patterns: toDeprecate
      }, null, 2));
      
      console.log(`💾 Deprecation list saved: ${deprecationPath}`);
      
      return toDeprecate;
      
    } catch (error) {
      console.error(`❌ Error deprecating patterns:`, error.message);
      return [];
    }
  },
  
  /**
   * Review and approve patterns for deployment
   */
  async reviewPatterns(reportPath, options = {}) {
    console.log('\n👁️  Pattern Review Workflow');
    console.log('═'.repeat(60));
    
    try {
      // Read the pending review report
      const reportContent = await readFile(reportPath);
      const report = JSON.parse(reportContent);
      
      if (!report.meta.awaitingReview) {
        console.log('⚠️  Report is not awaiting review');
        return null;
      }
      
      console.log(`📋 Reviewing ${report.patterns.length} patterns...`);
      console.log(`   Avg quality: ${report.qualityMetrics.avgQualityScore}`);
      console.log(`   High quality: ${report.qualityMetrics.highQualityPatterns}`);
      console.log(`   Multi-source: ${report.qualityMetrics.multiSourcePatterns}`);
      
      // Auto-approve high-quality patterns
      const approved = report.patterns.filter(p => {
        // Auto-approve criteria:
        // 1. Quality score >= 0.8
        // 2. From multiple sources
        // 3. Sample size >= 3
        return p.qualityScore >= 0.8 && p.sources.length > 1 && p.sampleSize >= 3;
      });
      
      const needsReview = report.patterns.filter(p => !approved.includes(p));
      
      console.log(`\n✅ Auto-approved: ${approved.length} patterns`);
      console.log(`⏳ Needs manual review: ${needsReview.length} patterns`);
      
      if (needsReview.length > 0) {
        console.log(`\n📝 Patterns requiring manual review:`);
        needsReview.forEach(p => {
          console.log(`   - ${p.name} (${p.primary.hex})`);
          console.log(`     Quality: ${p.qualityScore}, Sources: ${p.sources.join(', ')}, Samples: ${p.sampleSize}`);
        });
      }
      
      // Create approved report
      const approvedReport = {
        ...report,
        meta: {
          ...report.meta,
          awaitingReview: false,
          reviewedAt: new Date().toISOString(),
          approvedPatterns: approved.length,
          rejectedPatterns: needsReview.length
        },
        patterns: approved
      };
      
      // Save approved patterns
      const timestamp = new Date().toISOString().split('T')[0];
      const approvedPath = `docs/pattern-updates/${timestamp}-patterns-approved.json`;
      await write(approvedPath, JSON.stringify(approvedReport, null, 2));
      
      console.log(`\n💾 Approved patterns saved: ${approvedPath}`);
      
      return approvedReport;
      
    } catch (error) {
      console.error(`❌ Error reviewing patterns:`, error.message);
      return null;
    }
  },
  
  // ===== UTILITY FUNCTIONS =====
  
  hexToRgb(hex) {
    const clean = hex.replace('#', '');
    const expanded = clean.length === 3 
      ? clean.split('').map(c => c + c).join('')
      : clean;
    
    return [
      parseInt(expanded.slice(0, 2), 16),
      parseInt(expanded.slice(2, 4), 16),
      parseInt(expanded.slice(4, 6), 16)
    ];
  },
  
  rgbToHex(r, g, b) {
    return '#' + [r, g, b]
      .map(x => x.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase();
  },
  
  darkenColor(hex, percent) {
    const rgb = this.hexToRgb(hex);
    const darkened = rgb.map(c => Math.max(0, Math.round(c * (1 - percent / 100))));
    return this.rgbToHex(...darkened);
  },
  
  lightenColor(hex, percent) {
    const rgb = this.hexToRgb(hex);
    const lightened = rgb.map(c => Math.min(255, Math.round(c + (255 - c) * (percent / 100))));
    return this.rgbToHex(...lightened);
  }
};

// Mocks for testing (will be replaced with actual file I/O in production)
async function readFile(path) {
  if (typeof global.readFile === 'function') {
    return global.readFile(path);
  }
  throw new Error('readFile not available');
}

async function write(path, content) {
  if (typeof global.write === 'function') {
    return global.write(path, content);
  }
  throw new Error('write not available');
}

async function run_terminal_cmd(cmd, bg) {
  if (typeof global.run_terminal_cmd === 'function') {
    return global.run_terminal_cmd(cmd, bg);
  }
  // Mock for testing
  return { stdout: '', stderr: '' };
}

// Browser Integration (Phase 2.1 - Real Implementation)
let playwrightBrowser = null;
let playwrightPage = null;

async function initBrowser() {
  if (playwrightBrowser) return;
  
  try {
    const { chromium } = await import('playwright');
    playwrightBrowser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    // Create new page with user agent
    playwrightPage = await playwrightBrowser.newPage({
      userAgent: 'Mozilla/5.0 (compatible; PatternBot/1.0; +https://portfolio-redesign.com)'
    });
    
    console.log('   ✅ Browser initialized');
  } catch (error) {
    console.error('   ⚠️  Failed to initialize browser:', error.message);
    throw error;
  }
}

async function closeBrowser() {
  if (playwrightBrowser) {
    await playwrightBrowser.close();
    playwrightBrowser = null;
    playwrightPage = null;
    console.log('   ✅ Browser closed');
  }
}

async function mcp_cursor_browser_navigate(url) {
  if (typeof global.mcp_cursor_browser_navigate === 'function') {
    return global.mcp_cursor_browser_navigate({ url });
  }
  
  await initBrowser();
  
  try {
    await playwrightPage.goto(url, {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    return { success: true };
  } catch (error) {
    console.error(`   ❌ Navigation failed: ${error.message}`);
    throw error;
  }
}

async function mcp_cursor_browser_snapshot() {
  if (typeof global.mcp_cursor_browser_snapshot === 'function') {
    return global.mcp_cursor_browser_snapshot();
  }
  
  if (!playwrightPage) {
    throw new Error('Browser not initialized');
  }
  
  // Return page content as snapshot
  const content = await playwrightPage.content();
  return { snapshot: content };
}

async function mcp_cursor_browser_evaluate(options) {
  if (typeof global.mcp_cursor_browser_evaluate === 'function') {
    return global.mcp_cursor_browser_evaluate(options);
  }
  
  if (!playwrightPage) {
    throw new Error('Browser not initialized');
  }
  
  try {
    // Evaluate the function in the browser context
    const result = await playwrightPage.evaluate(options.function);
    return result;
  } catch (error) {
    console.error(`   ❌ Evaluation failed: ${error.message}`);
    throw error;
  }
}

async function mcp_cursor_browser_wait(options) {
  if (typeof global.mcp_cursor_browser_wait === 'function') {
    return global.mcp_cursor_browser_wait(options);
  }
  
  const waitTime = options.time || 1;
  await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
  return { success: true };
}

export default skill;

