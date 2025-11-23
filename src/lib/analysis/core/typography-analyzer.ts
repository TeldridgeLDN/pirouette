/**
 * Typography Analyzer Skill
 * v1.0.0 - Font Family, Size, Line-Height, and Visual Hierarchy Analysis
 * 
 * Analyzes typography patterns from landing pages and provides recommendations
 * based on readability standards and industry best practices.
 */

export const skill = {
  name: 'typography-analyzer',
  description: 'Analyzes font families, sizes, line-heights, spacing, and visual hierarchy with best practice recommendations',
  version: '1.0.0',
  author: 'Portfolio Project',
  
  // Activation triggers
  triggers: {
    keywords: [
      'typography',
      'font',
      'typeface',
      'font size',
      'line height',
      'visual hierarchy',
      'readability',
      'text spacing',
      'font stack'
    ],
    contexts: [
      'file:src/pages/**/*.astro',
      'file:src/styles/**/*.css',
      'conversation:typography-review',
      'conversation:accessibility',
      'skill:visual-design-analyzer' // Can be triggered by visual analyzer
    ],
    explicit: true
  },
  
  // Core capabilities
  capabilities: [
    'extract_font_families',
    'analyze_font_sizes',
    'measure_line_heights',
    'calculate_spacing_ratios',
    'evaluate_visual_hierarchy',
    'check_readability_scores',
    'compare_to_standards',
    'generate_typography_recommendations'
  ],
  
  // Dependencies
  dependencies: {
    skills: [],
    tools: [
      'read_file',
      'write',
      'list_dir'
    ]
  },
  
  // Configuration
  config: {
    // Optimal readability standards
    readabilityStandards: {
      bodyText: {
        minSize: 16,
        maxSize: 18,
        optimalSize: 16,
        minLineHeight: 1.5,
        maxLineHeight: 1.8,
        optimalLineHeight: 1.6,
        maxLineLength: 75 // characters
      },
      headings: {
        h1: {
          minSize: 32,
          maxSize: 64,
          minLineHeight: 1.1,
          maxLineHeight: 1.3,
          optimalRatio: 2.5 // vs body text
        },
        h2: {
          minSize: 24,
          maxSize: 48,
          optimalRatio: 2.0
        },
        h3: {
          minSize: 20,
          maxSize: 32,
          optimalRatio: 1.5
        }
      }
    },
    
    // Type scale standards
    typeScales: {
      'minor-second': 1.067,
      'major-second': 1.125,
      'minor-third': 1.2,
      'major-third': 1.25,
      'perfect-fourth': 1.333,
      'augmented-fourth': 1.414,
      'perfect-fifth': 1.5,
      'golden-ratio': 1.618
    },
    
    // Industry best practices
    bestPractices: {
      fontStacks: {
        'system-ui': {
          stack: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          performance: 'excellent',
          compatibility: 'high',
          loadTime: '0ms'
        },
        'geometric-sans': {
          fonts: ['Inter', 'DM Sans', 'Poppins'],
          fallback: 'sans-serif',
          loadTime: '~100ms'
        },
        'humanist-sans': {
          fonts: ['Open Sans', 'Lato', 'Nunito'],
          fallback: 'sans-serif',
          loadTime: '~100ms'
        },
        'serif': {
          fonts: ['Merriweather', 'PT Serif', 'Lora'],
          fallback: 'serif',
          loadTime: '~120ms',
          bestFor: 'Long-form content'
        }
      },
      
      hierarchy: {
        minContrast: 1.25, // Size difference between levels
        optimalContrast: 1.5,
        maxLevels: 6
      }
    }
  },
  
  /**
   * Main execution flow
   */
  async run(options = {}) {
    console.log(`📝 Typography Analyzer v${this.version}`);
    console.log('─'.repeat(60));
    
    // Step 1: Extract typography from pages
    console.log('\n🔍 Extracting typography patterns...');
    const typographyData = await this.extractTypography(options.pages || []);
    console.log(`✅ Analyzed ${typographyData.length} pages`);
    
    // Step 2: Analyze font families
    console.log('\n🔤 Analyzing font families...');
    const fontAnalysis = await this.analyzeFontFamilies(typographyData);
    console.log(`✅ Found ${fontAnalysis.uniqueFonts.length} unique fonts`);
    
    // Step 3: Analyze type scale
    console.log('\n📏 Analyzing type scale...');
    const scaleAnalysis = await this.analyzeTypeScale(typographyData);
    console.log(`✅ Detected scale: ${scaleAnalysis.detectedScale || 'custom'}`);
    
    // Step 4: Check readability
    console.log('\n📖 Checking readability...');
    const readabilityAnalysis = await this.checkReadability(typographyData);
    console.log(`✅ Readability score: ${readabilityAnalysis.score}/10`);
    
    // Step 5: Evaluate visual hierarchy
    console.log('\n🎯 Evaluating visual hierarchy...');
    const hierarchyAnalysis = await this.evaluateHierarchy(typographyData);
    console.log(`✅ Hierarchy score: ${hierarchyAnalysis.score}/10`);
    
    // Step 6: Generate recommendations
    console.log('\n💡 Generating recommendations...');
    const recommendations = await this.generateRecommendations({
      typographyData,
      fontAnalysis,
      scaleAnalysis,
      readabilityAnalysis,
      hierarchyAnalysis
    });
    console.log(`✅ Generated ${recommendations.length} recommendations`);
    
    // Step 7: Create manifest
    console.log('\n📦 Creating typography manifest...');
    const manifest = await this.createManifest({
      typographyData,
      fontAnalysis,
      scaleAnalysis,
      readabilityAnalysis,
      hierarchyAnalysis,
      recommendations
    });
    
    // Step 8: Save artifacts
    const outputPath = await this.saveArtifacts(manifest, options);
    
    console.log('\n✅ Analysis Complete!');
    console.log(`📁 Output: ${outputPath}`);
    console.log(`🔤 Fonts: ${fontAnalysis.uniqueFonts.length}`);
    console.log(`📊 Recommendations: ${recommendations.length}`);
    
    return manifest;
  },
  
  /**
   * Extract typography from pages
   */
  async extractTypography(pages) {
    const results = [];
    
    for (const pagePath of pages) {
      try {
        console.log(`   Analyzing ${pagePath}...`);
        
        const content = await readFile(pagePath);
        
        // Extract CSS/style information
        const typography = {
          path: pagePath,
          fonts: this.extractFonts(content),
          sizes: this.extractSizes(content),
          lineHeights: this.extractLineHeights(content),
          weights: this.extractWeights(content),
          elements: this.extractElements(content)
        };
        
        results.push(typography);
        
      } catch (error) {
        console.error(`   ❌ Error analyzing ${pagePath}:`, error.message);
      }
    }
    
    return results;
  },
  
  /**
   * Extract font families from content
   */
  extractFonts(content) {
    const fonts = new Set();
    
    // Extract from font-family declarations
    const fontFamilyPattern = /font-family:\s*([^;]+);/gi;
    let match;
    
    while ((match = fontFamilyPattern.exec(content)) !== null) {
      const fontStack = match[1].trim();
      fonts.add(fontStack);
    }
    
    // Extract from CSS variables
    const cssVarPattern = /--font-(\w+):\s*([^;]+);/gi;
    while ((match = cssVarPattern.exec(content)) !== null) {
      fonts.add(match[2].trim());
    }
    
    return Array.from(fonts);
  },
  
  /**
   * Extract font sizes
   */
  extractSizes(content) {
    const sizes = new Set();
    
    // Extract px sizes
    const pxPattern = /font-size:\s*(\d+)px/gi;
    let match;
    while ((match = pxPattern.exec(content)) !== null) {
      sizes.add({ value: parseInt(match[1]), unit: 'px' });
    }
    
    // Extract rem sizes
    const remPattern = /font-size:\s*([\d.]+)rem/gi;
    while ((match = remPattern.exec(content)) !== null) {
      sizes.add({ value: parseFloat(match[1]), unit: 'rem' });
    }
    
    // Extract clamp() sizes
    const clampPattern = /font-size:\s*clamp\(([\d.]+)rem,\s*[\dvw%]+,\s*([\d.]+)rem\)/gi;
    while ((match = clampPattern.exec(content)) !== null) {
      sizes.add({ 
        min: parseFloat(match[1]), 
        max: parseFloat(match[2]), 
        unit: 'rem',
        responsive: true 
      });
    }
    
    return Array.from(sizes);
  },
  
  /**
   * Extract line heights
   */
  extractLineHeights(content) {
    const lineHeights = new Set();
    
    const pattern = /line-height:\s*([\d.]+);/gi;
    let match;
    
    while ((match = pattern.exec(content)) !== null) {
      lineHeights.add(parseFloat(match[1]));
    }
    
    return Array.from(lineHeights);
  },
  
  /**
   * Extract font weights
   */
  extractWeights(content) {
    const weights = new Set();
    
    const pattern = /font-weight:\s*(\d+|normal|bold|lighter|bolder);/gi;
    let match;
    
    while ((match = pattern.exec(content)) !== null) {
      const weight = match[1];
      weights.add(isNaN(weight) ? weight : parseInt(weight));
    }
    
    return Array.from(weights);
  },
  
  /**
   * Extract element-specific styles
   */
  extractElements(content) {
    const elements = {};
    
    // Extract h1-h6 styles
    for (let i = 1; i <= 6; i++) {
      const pattern = new RegExp(`h${i}[^{]*{([^}]+)}`, 'gi');
      const match = pattern.exec(content);
      if (match) {
        elements[`h${i}`] = this.parseStyles(match[1]);
      }
    }
    
    // Extract body/p styles
    const bodyPattern = /(body|p)[^{]*{([^}]+)}/gi;
    const bodyMatch = bodyPattern.exec(content);
    if (bodyMatch) {
      elements.body = this.parseStyles(bodyMatch[2]);
    }
    
    return elements;
  },
  
  /**
   * Parse CSS styles into structured data
   */
  parseStyles(cssText) {
    const styles = {};
    
    const fontSizeMatch = cssText.match(/font-size:\s*([^;]+);/);
    if (fontSizeMatch) styles.fontSize = fontSizeMatch[1].trim();
    
    const lineHeightMatch = cssText.match(/line-height:\s*([^;]+);/);
    if (lineHeightMatch) styles.lineHeight = lineHeightMatch[1].trim();
    
    const fontWeightMatch = cssText.match(/font-weight:\s*([^;]+);/);
    if (fontWeightMatch) styles.fontWeight = fontWeightMatch[1].trim();
    
    const fontFamilyMatch = cssText.match(/font-family:\s*([^;]+);/);
    if (fontFamilyMatch) styles.fontFamily = fontFamilyMatch[1].trim();
    
    return styles;
  },
  
  /**
   * Analyze font families
   */
  async analyzeFontFamilies(typographyData) {
    const allFonts = new Set();
    const fontUsage = {};
    
    for (const page of typographyData) {
      page.fonts.forEach(font => {
        allFonts.add(font);
        fontUsage[font] = (fontUsage[font] || 0) + 1;
      });
    }
    
    const uniqueFonts = Array.from(allFonts);
    
    // Categorize fonts
    const categories = {
      system: [],
      webfonts: [],
      fallbacks: []
    };
    
    uniqueFonts.forEach(font => {
      if (font.includes('-apple-system') || font.includes('BlinkMacSystemFont')) {
        categories.system.push(font);
      } else if (font.includes('sans-serif') || font.includes('serif') || font.includes('monospace')) {
        categories.fallbacks.push(font);
      } else {
        categories.webfonts.push(font);
      }
    });
    
    return {
      uniqueFonts,
      fontUsage,
      categories,
      consistency: this.calculateFontConsistency(typographyData)
    };
  },
  
  /**
   * Calculate font consistency across pages
   */
  calculateFontConsistency(typographyData) {
    if (typographyData.length < 2) {
      return { score: 10, message: 'Single page - consistency N/A' };
    }
    
    const firstPageFonts = new Set(typographyData[0].fonts);
    let matchCount = 0;
    
    for (let i = 1; i < typographyData.length; i++) {
      const pageFonts = new Set(typographyData[i].fonts);
      const intersection = new Set([...firstPageFonts].filter(f => pageFonts.has(f)));
      matchCount += intersection.size / firstPageFonts.size;
    }
    
    const score = Math.round((matchCount / (typographyData.length - 1)) * 10);
    
    return {
      score,
      message: score >= 8 ? 'Excellent consistency' : score >= 5 ? 'Moderate consistency' : 'Low consistency'
    };
  },
  
  /**
   * Analyze type scale
   */
  async analyzeTypeScale(typographyData) {
    const allSizes = [];
    
    typographyData.forEach(page => {
      page.sizes.forEach(size => {
        if (size.responsive) {
          allSizes.push(size.min * 16, size.max * 16); // Convert rem to px
        } else {
          const px = size.unit === 'rem' ? size.value * 16 : size.value;
          allSizes.push(px);
        }
      });
    });
    
    // Sort and deduplicate
    const uniqueSizes = [...new Set(allSizes)].sort((a, b) => a - b);
    
    // Detect scale ratio
    let detectedScale = null;
    let bestMatch = { name: null, deviation: Infinity };
    
    for (const [name, ratio] of Object.entries(this.config.typeScales)) {
      let totalDeviation = 0;
      let comparisons = 0;
      
      for (let i = 1; i < uniqueSizes.length; i++) {
        const actualRatio = uniqueSizes[i] / uniqueSizes[i - 1];
        const deviation = Math.abs(actualRatio - ratio);
        totalDeviation += deviation;
        comparisons++;
      }
      
      const avgDeviation = totalDeviation / comparisons;
      
      if (avgDeviation < bestMatch.deviation && avgDeviation < 0.2) {
        bestMatch = { name, ratio, deviation: avgDeviation };
      }
    }
    
    detectedScale = bestMatch.name;
    
    return {
      detectedScale,
      scaleRatio: bestMatch.ratio,
      uniqueSizes,
      sizeCount: uniqueSizes.length,
      consistency: this.evaluateScaleConsistency(uniqueSizes, bestMatch.ratio)
    };
  },
  
  /**
   * Evaluate scale consistency
   */
  evaluateScaleConsistency(sizes, expectedRatio) {
    if (!expectedRatio || sizes.length < 2) {
      return { score: 5, message: 'Insufficient data' };
    }
    
    let deviations = 0;
    for (let i = 1; i < sizes.length; i++) {
      const actualRatio = sizes[i] / sizes[i - 1];
      const deviation = Math.abs(actualRatio - expectedRatio);
      if (deviation > 0.1) deviations++;
    }
    
    const score = Math.max(0, 10 - (deviations * 2));
    
    return {
      score,
      message: score >= 8 ? 'Excellent scale consistency' : score >= 5 ? 'Moderate consistency' : 'Inconsistent scale'
    };
  },
  
  /**
   * Check readability
   */
  async checkReadability(typographyData) {
    const issues = [];
    let totalScore = 0;
    let checks = 0;
    
    for (const page of typographyData) {
      // Check body text
      if (page.elements.body) {
        const bodySize = this.parseSizeValue(page.elements.body.fontSize);
        const bodyLineHeight = parseFloat(page.elements.body.lineHeight || 1.5);
        
        if (bodySize < this.config.readabilityStandards.bodyText.minSize) {
          issues.push({
            page: page.path,
            element: 'body',
            issue: 'Body text too small',
            current: `${bodySize}px`,
            recommended: `${this.config.readabilityStandards.bodyText.optimalSize}px`
          });
          totalScore += 3;
        } else if (bodySize > this.config.readabilityStandards.bodyText.maxSize) {
          issues.push({
            page: page.path,
            element: 'body',
            issue: 'Body text too large',
            current: `${bodySize}px`,
            recommended: `${this.config.readabilityStandards.bodyText.optimalSize}px`
          });
          totalScore += 7;
        } else {
          totalScore += 10;
        }
        checks++;
        
        if (bodyLineHeight < this.config.readabilityStandards.bodyText.minLineHeight) {
          issues.push({
            page: page.path,
            element: 'body',
            issue: 'Line height too tight',
            current: bodyLineHeight.toFixed(2),
            recommended: this.config.readabilityStandards.bodyText.optimalLineHeight.toFixed(2)
          });
          totalScore += 4;
        } else if (bodyLineHeight > this.config.readabilityStandards.bodyText.maxLineHeight) {
          issues.push({
            page: page.path,
            element: 'body',
            issue: 'Line height too loose',
            current: bodyLineHeight.toFixed(2),
            recommended: this.config.readabilityStandards.bodyText.optimalLineHeight.toFixed(2)
          });
          totalScore += 7;
        } else {
          totalScore += 10;
        }
        checks++;
      }
    }
    
    const score = checks > 0 ? Math.round(totalScore / checks) : 5;
    
    return {
      score,
      issues,
      summary: issues.length === 0 ? 'All readability checks passed' : `${issues.length} issue(s) found`
    };
  },
  
  /**
   * Parse size value to pixels
   */
  parseSizeValue(sizeStr) {
    if (!sizeStr) return 16;
    
    if (sizeStr.includes('px')) {
      return parseInt(sizeStr);
    } else if (sizeStr.includes('rem')) {
      return parseFloat(sizeStr) * 16;
    } else if (sizeStr.includes('clamp')) {
      const match = sizeStr.match(/clamp\(([\d.]+)rem/);
      return match ? parseFloat(match[1]) * 16 : 16;
    }
    
    return 16;
  },
  
  /**
   * Evaluate visual hierarchy
   */
  async evaluateHierarchy(typographyData) {
    const issues = [];
    let totalScore = 0;
    let checks = 0;
    
    for (const page of typographyData) {
      const { elements } = page;
      
      // Check heading contrast
      for (let i = 1; i <= 5; i++) {
        const current = elements[`h${i}`];
        const next = elements[`h${i + 1}`];
        
        if (current && next) {
          const currentSize = this.parseSizeValue(current.fontSize);
          const nextSize = this.parseSizeValue(next.fontSize);
          const ratio = currentSize / nextSize;
          
          if (ratio < this.config.bestPractices.hierarchy.minContrast) {
            issues.push({
              page: page.path,
              issue: `Insufficient size contrast between h${i} and h${i + 1}`,
              current: `${ratio.toFixed(2)}`,
              recommended: `${this.config.bestPractices.hierarchy.optimalContrast}`
            });
            totalScore += 5;
          } else if (ratio >= this.config.bestPractices.hierarchy.optimalContrast) {
            totalScore += 10;
          } else {
            totalScore += 7;
          }
          checks++;
        }
      }
    }
    
    const score = checks > 0 ? Math.round(totalScore / checks) : 7;
    
    return {
      score,
      issues,
      summary: issues.length === 0 ? 'Clear visual hierarchy' : `${issues.length} hierarchy issue(s) found`
    };
  },
  
  /**
   * Generate recommendations
   */
  async generateRecommendations(analysis) {
    const recommendations = [];
    
    // Font consistency recommendations
    if (analysis.fontAnalysis.consistency.score < 8) {
      recommendations.push({
        id: 'typo-1',
        type: 'consistency',
        priority: 7.5,
        title: 'Improve Font Consistency Across Pages',
        current: `Consistency score: ${analysis.fontAnalysis.consistency.score}/10`,
        recommended: 'Use consistent font stacks across all pages',
        impact: 'Better brand recognition, faster page loads',
        effort: { hours: 1.0, complexity: 'low' }
      });
    }
    
    // Readability recommendations
    analysis.readabilityAnalysis.issues.forEach((issue, idx) => {
      recommendations.push({
        id: `typo-read-${idx + 1}`,
        type: 'readability',
        priority: 8.0,
        title: issue.issue,
        current: issue.current,
        recommended: issue.recommended,
        page: issue.page,
        element: issue.element,
        impact: 'Improved readability, better UX',
        effort: { hours: 0.5, complexity: 'low' }
      });
    });
    
    // Hierarchy recommendations
    analysis.hierarchyAnalysis.issues.forEach((issue, idx) => {
      recommendations.push({
        id: `typo-hier-${idx + 1}`,
        type: 'hierarchy',
        priority: 6.5,
        title: issue.issue,
        current: issue.current,
        recommended: issue.recommended,
        page: issue.page,
        impact: 'Clearer content structure, better scannability',
        effort: { hours: 0.75, complexity: 'medium' }
      });
    });
    
    // Type scale recommendation
    if (!analysis.scaleAnalysis.detectedScale) {
      recommendations.push({
        id: 'typo-scale-1',
        type: 'scale',
        priority: 6.0,
        title: 'Implement Modular Type Scale',
        current: 'Custom/inconsistent sizing',
        recommended: 'Use a modular scale (e.g., Major Third 1.25 or Perfect Fourth 1.333)',
        impact: 'More harmonious typography, easier maintenance',
        effort: { hours: 2.0, complexity: 'medium' }
      });
    }
    
    // Web font optimization
    if (analysis.fontAnalysis.categories.webfonts.length > 2) {
      recommendations.push({
        id: 'typo-perf-1',
        type: 'performance',
        priority: 7.0,
        title: 'Reduce Number of Web Fonts',
        current: `${analysis.fontAnalysis.categories.webfonts.length} web fonts`,
        recommended: 'Limit to 2 font families (one for headings, one for body)',
        impact: 'Faster page loads, better performance',
        effort: { hours: 1.5, complexity: 'medium' }
      });
    }
    
    return recommendations.sort((a, b) => b.priority - a.priority);
  },
  
  /**
   * Create manifest
   */
  async createManifest(data) {
    return {
      meta: {
        generatedBy: 'typography-analyzer',
        version: this.version,
        analysisDate: new Date().toISOString(),
        pagesAnalyzed: data.typographyData.length
      },
      
      fontAnalysis: data.fontAnalysis,
      scaleAnalysis: data.scaleAnalysis,
      readabilityAnalysis: data.readabilityAnalysis,
      hierarchyAnalysis: data.hierarchyAnalysis,
      recommendations: data.recommendations,
      
      // TaskMaster export
      taskMasterExport: {
        tasks: data.recommendations.map((rec, idx) => ({
          id: `typo-task-${idx + 1}`,
          title: rec.title,
          description: `${rec.current} → ${rec.recommended}`,
          priority: rec.priority > 7.5 ? 'high' : 'medium',
          status: 'pending',
          estimatedHours: rec.effort.hours,
          tags: ['typography', rec.type]
        })),
        estimatedTotalHours: data.recommendations.reduce((sum, r) => sum + r.effort.hours, 0)
      }
    };
  },
  
  /**
   * Save artifacts
   */
  async saveArtifacts(manifest, options) {
    const timestamp = new Date().toISOString().split('T')[0];
    const basePath = options.outputPath || `docs/typography-audits/${timestamp}`;
    
    await run_terminal_cmd(`mkdir -p ${basePath}`, false);
    
    // Save manifest
    const manifestPath = `${basePath}/typography-manifest.json`;
    await write(manifestPath, JSON.stringify(manifest, null, 2));
    
    // Save report
    const reportPath = `${basePath}/typography-report.md`;
    await write(reportPath, this.generateReport(manifest));
    
    console.log(`✅ Saved manifest: ${manifestPath}`);
    console.log(`✅ Saved report: ${reportPath}`);
    
    return basePath;
  },
  
  /**
   * Generate human-readable report
   */
  generateReport(manifest) {
    let report = `# Typography Analysis Report\n\n`;
    report += `**Generated:** ${new Date(manifest.meta.analysisDate).toLocaleDateString()}\n`;
    report += `**Pages Analyzed:** ${manifest.meta.pagesAnalyzed}\n\n`;
    
    // Font analysis
    report += `## Font Families\n\n`;
    report += `**Unique Fonts:** ${manifest.fontAnalysis.uniqueFonts.length}\n`;
    report += `**Consistency Score:** ${manifest.fontAnalysis.consistency.score}/10\n\n`;
    
    if (manifest.fontAnalysis.categories.webfonts.length > 0) {
      report += `### Web Fonts\n`;
      manifest.fontAnalysis.categories.webfonts.forEach(font => {
        report += `- ${font}\n`;
      });
      report += `\n`;
    }
    
    // Type scale
    report += `## Type Scale\n\n`;
    report += `**Detected Scale:** ${manifest.scaleAnalysis.detectedScale || 'Custom'}\n`;
    if (manifest.scaleAnalysis.scaleRatio) {
      report += `**Ratio:** ${manifest.scaleAnalysis.scaleRatio}\n`;
    }
    report += `**Unique Sizes:** ${manifest.scaleAnalysis.sizeCount}\n\n`;
    
    // Readability
    report += `## Readability\n\n`;
    report += `**Score:** ${manifest.readabilityAnalysis.score}/10\n`;
    report += `**Issues:** ${manifest.readabilityAnalysis.issues.length}\n\n`;
    
    if (manifest.readabilityAnalysis.issues.length > 0) {
      report += `### Issues Found\n\n`;
      manifest.readabilityAnalysis.issues.forEach((issue, idx) => {
        report += `${idx + 1}. **${issue.element}** - ${issue.issue}\n`;
        report += `   - Current: ${issue.current}\n`;
        report += `   - Recommended: ${issue.recommended}\n\n`;
      });
    }
    
    // Visual hierarchy
    report += `## Visual Hierarchy\n\n`;
    report += `**Score:** ${manifest.hierarchyAnalysis.score}/10\n`;
    report += `**Status:** ${manifest.hierarchyAnalysis.summary}\n\n`;
    
    // Recommendations
    report += `## Recommendations\n\n`;
    manifest.recommendations.forEach((rec, idx) => {
      report += `### ${idx + 1}. ${rec.title}\n\n`;
      report += `**Priority:** ${rec.priority}/10\n`;
      report += `**Type:** ${rec.type}\n`;
      report += `**Effort:** ${rec.effort.hours}h\n`;
      report += `**Impact:** ${rec.impact}\n\n`;
      report += `**Current:** ${rec.current}\n`;
      report += `**Recommended:** ${rec.recommended}\n\n`;
    });
    
    return report;
  }
};

// Mocks for testing
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
  return { stdout: '', stderr: '' };
}

export default skill;



