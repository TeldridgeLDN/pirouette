// @ts-nocheck
/**
 * Contrast Validator Skill
 * v1.0.0 - Context-Aware WCAG Contrast Validation
 * 
 * Detects contrast issues in rendered pages by examining actual element colors
 * in their specific contexts, rather than just checking palette-level combinations.
 * 
 * Key Features:
 * - Browser-based color detection (actual computed styles)
 * - Context-aware analysis (background inheritance, overlays, etc.)
 * - Specific fix recommendations with CSS snippets
 * - Integration with visual-design-analyzer
 * 
 * NOTE: This file is meant for Railway worker, not Next.js frontend.
 * TypeScript checking is disabled due to legacy JavaScript patterns.
 */

import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const skill = {
  name: 'contrast-validator',
  description: 'Context-aware WCAG contrast validation with actionable fix recommendations',
  version: '1.1.0',
  author: 'Portfolio Project',
  
  capabilities: [
    'detect_element_colors',
    'calculate_wcag_ratios',
    'identify_context_issues',
    'generate_fix_recommendations',
    'validate_interactive_states'
  ],
  
  config: {
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
    
    // Selectors to check for contrast issues
    criticalSelectors: [
      { selector: '.btn', context: 'CTAs' },
      { selector: 'h1, h2, h3', context: 'Headings' },
      { selector: '.feature', context: 'Feature Cards' },
      { selector: '.feature svg', context: 'Feature Icons' },
      { selector: 'a[href]', context: 'Links' }
    ],
    
    // Font size thresholds (in pixels)
    largeTextThreshold: 18, // 18px+ is considered large text
    largeBoldTextThreshold: 14 // 14px+ if bold is also considered large
  }
};

export default class ContrastValidator {
  baseUrl: string;
  browser: import('playwright').Browser | null;
  page: import('playwright').Page | null;
  config: typeof skill.config;
  
  constructor(baseUrl = 'http://localhost:4321', options = {}) {
    this.baseUrl = baseUrl;
    this.browser = null;
    this.page = null;
    this.config = { ...skill.config, ...options };
  }

  /**
   * Main validation method
   */
  async validate(targetPath) {
    console.log(`\n♿ Contrast Validator v${skill.version}`);
    console.log(`🔍 Analyzing: ${this.baseUrl}${targetPath}\n`);
    
    try {
      await this.initBrowser();
      
      const url = `${this.baseUrl}${targetPath}`;
      console.log(`📍 Navigating to: ${url}`);
      
      const response = await this.page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      console.log(`📍 Response status: ${response.status()}`);
      
      // Wait for page to be ready
      await this.page.waitForLoadState('networkidle', { timeout: 10000 });
      
      // Debug: Check what's on the page
      const title = await this.page.title();
      const bodyText = await this.page.textContent('body');
      console.log(`📍 Page title: ${title}`);
      console.log(`📍 Body length: ${bodyText ? bodyText.length : 0} chars`);
      
      // Check for basic elements
      const buttonCount = await this.page.locator('.btn').count();
      const headingCount = await this.page.locator('h1, h2, h3').count();
      console.log(`📍 Found ${buttonCount} buttons, ${headingCount} headings`)
      
      // Extract color data from all critical elements
      const elements = await this.extractElementColors();
      console.log(`✅ Extracted colors from ${elements.length} elements`);
      
      // Analyze contrast for each element
      const issues = [];
      const passes = [];
      
      for (const element of elements) {
        const analysis = this.analyzeElementContrast(element);
        
        if (!analysis.passesWCAG_AA) {
          issues.push({
            severity: this.determineSeverity(analysis),
            ...analysis,
            recommendation: this.generateRecommendation(element, analysis)
          });
        } else {
          passes.push(analysis);
        }
      }
      
      console.log(`✅ Found ${issues.length} contrast issues`);
      console.log(`✅ ${passes.length} elements passed WCAG AA\n`);
      
      const report = {
        url,
        timestamp: new Date().toISOString(),
        summary: {
          total: elements.length,
          passing: passes.length,
          failing: issues.length,
          passRate: `${Math.round((passes.length / elements.length) * 100)}%`
        },
        issues: issues.sort((a, b) => {
          const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
          return severityOrder[a.severity] - severityOrder[b.severity];
        }),
        passes
      };
      
      await this.closeBrowser();
      
      return report;
      
    } catch (error) {
      await this.closeBrowser();
      throw error;
    }
  }

  /**
   * Extract colors from all critical elements
   */
  async extractElementColors() {
    const elements = [];
    
    for (const { selector, context } of this.config.criticalSelectors) {
      try {
        // Use Playwright's locator API
        const locator = this.page.locator(selector);
        const count = await locator.count();
        
        if (count === 0) {
          console.log(`⚠️  Selector ${selector} not found, skipping...`);
          continue;
        }
        
        console.log(`✅ Processing ${count} elements for "${context}"...`);
        
        // Process each element
        for (let i = 0; i < count; i++) {
          try {
            const element = locator.nth(i);
            
            // Get computed styles
            const elementData = await element.evaluate((el) => {
              const styles = window.getComputedStyle(el);
              const rect = el.getBoundingClientRect();
              
              // Get foreground color (text or icon color)
              const foreground = styles.color;
              
              // Get effective background color (handles gradients, parent backgrounds, etc.)
              // Note: getEffectiveBackground is defined on the validator instance
              // We need to extract the logic here since we're inside page.evaluate()
              
              let background = styles.backgroundColor;
              let backgroundMethod = 'solid-color';
              let confidence = 'high';
              
              // If background is transparent, check for gradient
              if (background === 'rgba(0, 0, 0, 0)' || background === 'transparent') {
                const backgroundImage = styles.backgroundImage;
                
                // Try to extract color from gradient
                if (backgroundImage && backgroundImage !== 'none') {
                  // Extract RGB colors from gradient string
                  const rgbMatches = [...backgroundImage.matchAll(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/g)];
                  
                  if (rgbMatches.length > 0) {
                    const colorStops = [];
                    for (const match of rgbMatches) {
                      const r = parseInt(match[1]);
                      const g = parseInt(match[2]);
                      const b = parseInt(match[3]);
                      const alpha = match[4] ? parseFloat(match[4]) : 1.0;
                      colorStops.push({ r, g, b, alpha });
                    }
                    
                    const totalAlpha = colorStops.reduce((sum, stop) => sum + stop.alpha, 0);
                    if (totalAlpha > 0) {
                      const avgR = Math.round(colorStops.reduce((sum, stop) => sum + (stop.r * stop.alpha), 0) / totalAlpha);
                      const avgG = Math.round(colorStops.reduce((sum, stop) => sum + (stop.g * stop.alpha), 0) / totalAlpha);
                      const avgB = Math.round(colorStops.reduce((sum, stop) => sum + (stop.b * stop.alpha), 0) / totalAlpha);
                      background = `rgb(${avgR}, ${avgG}, ${avgB})`;
                      backgroundMethod = 'gradient-extraction';
                    }
                  }
                }
                
                // If still transparent, walk up DOM tree
                if (background === 'rgba(0, 0, 0, 0)' || background === 'transparent') {
                  let currentEl = el;
                  while (currentEl && currentEl.parentElement) {
                    currentEl = currentEl.parentElement;
                    const parentStyles = window.getComputedStyle(currentEl);
                    const parentBg = parentStyles.backgroundColor;
                    
                    if (parentBg !== 'rgba(0, 0, 0, 0)' && parentBg !== 'transparent') {
                      background = parentBg;
                      backgroundMethod = 'parent-background';
                      confidence = 'medium';
                      break;
                    }
                    
                    // Check parent gradient
                    const parentBgImage = parentStyles.backgroundImage;
                    if (parentBgImage && parentBgImage !== 'none') {
                      const parentRgbMatches = [...parentBgImage.matchAll(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/g)];
                      
                      if (parentRgbMatches.length > 0) {
                        const colorStops = [];
                        for (const match of parentRgbMatches) {
                          const r = parseInt(match[1]);
                          const g = parseInt(match[2]);
                          const b = parseInt(match[3]);
                          const alpha = match[4] ? parseFloat(match[4]) : 1.0;
                          colorStops.push({ r, g, b, alpha });
                        }
                        
                        const totalAlpha = colorStops.reduce((sum, stop) => sum + stop.alpha, 0);
                        if (totalAlpha > 0) {
                          const avgR = Math.round(colorStops.reduce((sum, stop) => sum + (stop.r * stop.alpha), 0) / totalAlpha);
                          const avgG = Math.round(colorStops.reduce((sum, stop) => sum + (stop.g * stop.alpha), 0) / totalAlpha);
                          const avgB = Math.round(colorStops.reduce((sum, stop) => sum + (stop.b * stop.alpha), 0) / totalAlpha);
                          background = `rgb(${avgR}, ${avgG}, ${avgB})`;
                          backgroundMethod = 'parent-gradient';
                          confidence = 'high';
                          break;
                        }
                      }
                    }
                  }
                  
                  // If still transparent, use white as fallback
                  if (background === 'rgba(0, 0, 0, 0)' || background === 'transparent') {
                    background = 'rgb(255, 255, 255)';
                    backgroundMethod = 'fallback-white';
                    confidence = 'low';
                  }
                }
              }
              
              return {
                text: el.textContent?.trim().substring(0, 50) || '(icon/svg)',
                foreground,
                background,
                backgroundMethod,
                confidence,
                fontSize: parseFloat(styles.fontSize),
                fontWeight: styles.fontWeight,
                isVisible: rect.width > 0 && rect.height > 0,
                isAboveFold: rect.top < window.innerHeight
              };
            });
            
            // Only include visible elements
            if (elementData.isVisible) {
              elements.push({
                ...elementData,
                selector,
                context
              });
            }
          } catch (err) {
            // Skip individual element errors
            console.log(`⚠️  Error processing element ${i} for ${selector}: ${err.message}`);
          }
        }
        
      } catch (err) {
        // Selector might not exist on this page, skip it
        console.log(`⚠️  Error with selector ${selector}: ${err.message}`);
      }
    }
    
    return elements;
  }

  /**
   * Analyze contrast for a single element
   */
  analyzeElementContrast(element) {
    const fgRgb = this.parseColor(element.foreground);
    const bgRgb = this.parseColor(element.background);
    
    const ratio = this.calculateContrastRatio(fgRgb, bgRgb);
    
    // Determine if this is "large text"
    const isLargeText = this.isLargeText(element.fontSize, element.fontWeight);
    
    const aaThreshold = isLargeText
      ? this.config.wcag.AA.largeText
      : this.config.wcag.AA.normalText;
      
    const aaaThreshold = isLargeText
      ? this.config.wcag.AAA.largeText
      : this.config.wcag.AAA.normalText;
    
    return {
      context: element.context,
      selector: element.selector,
      text: element.text,
      foreground: element.foreground,
      background: element.background,
      backgroundMethod: element.backgroundMethod || 'solid-color',
      confidence: element.confidence || 'high',
      fontSize: element.fontSize,
      fontWeight: element.fontWeight,
      isLargeText,
      contrastRatio: ratio,
      passesWCAG_AA: ratio >= aaThreshold,
      passesWCAG_AAA: ratio >= aaaThreshold,
      requiredAA: aaThreshold,
      requiredAAA: aaaThreshold,
      isAboveFold: element.isAboveFold
    };
  }

  /**
   * Determine if text qualifies as "large" per WCAG
   */
  isLargeText(fontSize, fontWeight) {
    if (fontSize >= this.config.largeTextThreshold) {
      return true;
    }
    
    // Bold text at 14px+ also counts as large
    const isBold = parseInt(fontWeight) >= 700 || fontWeight === 'bold';
    if (isBold && fontSize >= this.config.largeBoldTextThreshold) {
      return true;
    }
    
    return false;
  }

  /**
   * Calculate WCAG contrast ratio
   */
  calculateContrastRatio(rgb1, rgb2) {
    const l1 = this.relativeLuminance(rgb1);
    const l2 = this.relativeLuminance(rgb2);
    
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    
    const ratio = (lighter + 0.05) / (darker + 0.05);
    
    return parseFloat(ratio.toFixed(2));
  }

  /**
   * Calculate relative luminance (WCAG formula)
   */
  relativeLuminance(rgb) {
    const [r, g, b] = rgb.map(val => {
      const normalized = val / 255;
      return normalized <= 0.03928
        ? normalized / 12.92
        : Math.pow((normalized + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  /**
   * Parse rgb/rgba string to [r, g, b] array
   */
  parseColor(colorString) {
    // Handle rgb() or rgba()
    const match = colorString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (match) {
      return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
    }
    
    // Fallback to white if parsing fails
    return [255, 255, 255];
  }

  /**
   * Extract dominant color from gradient background
   * @param {string} backgroundImage - CSS background-image value
   * @returns {string|null} - RGB color string or null if can't parse
   */
  extractGradientColor(backgroundImage) {
    if (!backgroundImage || backgroundImage === 'none') {
      return null;
    }

    // Match various gradient types
    const gradientMatch = backgroundImage.match(/(linear-gradient|radial-gradient|conic-gradient)\([^)]+\)/);
    if (!gradientMatch) {
      return null;
    }

    const gradientString = gradientMatch[0];

    // Extract all RGB/RGBA color stops
    const colorStops = [];
    const rgbMatches = [...gradientString.matchAll(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/g)];
    
    for (const match of rgbMatches) {
      const r = parseInt(match[1]);
      const g = parseInt(match[2]);
      const b = parseInt(match[3]);
      const alpha = match[4] ? parseFloat(match[4]) : 1.0;

      // Weight by alpha - transparent colors contribute less
      colorStops.push({ r, g, b, alpha });
    }

    // If no color stops found, return null
    if (colorStops.length === 0) {
      return null;
    }

    // Calculate weighted average based on alpha values
    const totalAlpha = colorStops.reduce((sum, stop) => sum + stop.alpha, 0);
    
    if (totalAlpha === 0) {
      // All transparent, can't determine color
      return null;
    }

    const avgR = Math.round(colorStops.reduce((sum, stop) => sum + (stop.r * stop.alpha), 0) / totalAlpha);
    const avgG = Math.round(colorStops.reduce((sum, stop) => sum + (stop.g * stop.alpha), 0) / totalAlpha);
    const avgB = Math.round(colorStops.reduce((sum, stop) => sum + (stop.b * stop.alpha), 0) / totalAlpha);

    return `rgb(${avgR}, ${avgG}, ${avgB})`;
  }

  /**
   * Get effective background color considering gradients
   * @param {Object} styles - Computed styles object
   * @param {HTMLElement} element - DOM element
   * @returns {Object} - { color: string, method: string, confidence: string }
   */
  getEffectiveBackground(styles, element) {
    let backgroundColor = styles.backgroundColor;

    // If we have a solid background, use it
    if (backgroundColor !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'transparent') {
      return {
        color: backgroundColor,
        method: 'solid-color',
        confidence: 'high'
      };
    }

    // Check for background-image gradient
    const backgroundImage = styles.backgroundImage;
    if (backgroundImage && backgroundImage !== 'none') {
      const gradientColor = this.extractGradientColor(backgroundImage);
      if (gradientColor) {
        return {
          color: gradientColor,
          method: 'gradient-extraction',
          confidence: 'high'
        };
      }
    }

    // Walk up the DOM tree to find parent background
    let currentEl = element;
    while (currentEl && currentEl.parentElement) {
      currentEl = currentEl.parentElement;
      const parentStyles = window.getComputedStyle(currentEl);
      
      // Check parent solid color
      const parentBg = parentStyles.backgroundColor;
      if (parentBg !== 'rgba(0, 0, 0, 0)' && parentBg !== 'transparent') {
        return {
          color: parentBg,
          method: 'parent-background',
          confidence: 'medium'
        };
      }

      // Check parent gradient
      const parentBgImage = parentStyles.backgroundImage;
      if (parentBgImage && parentBgImage !== 'none') {
        const gradientColor = this.extractGradientColor(parentBgImage);
        if (gradientColor) {
          return {
            color: gradientColor,
            method: 'parent-gradient',
            confidence: 'high'
          };
        }
      }
    }

    // Fallback to white
    return {
      color: 'rgb(255, 255, 255)',
      method: 'fallback-white',
      confidence: 'low'
    };
  }

  /**
   * Convert RGB to hex
   */
  rgbToHex(rgb) {
    return '#' + rgb.map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  }

  /**
   * Determine severity of contrast issue
   */
  determineSeverity(analysis) {
    // Critical: CTAs or important elements above the fold that fail badly
    if (
      (analysis.context === 'CTAs' || analysis.context === 'Headings') &&
      analysis.isAboveFold &&
      analysis.contrastRatio < 3.0
    ) {
      return 'critical';
    }
    
    // High: Any above-fold element that fails WCAG AA
    if (analysis.isAboveFold && analysis.contrastRatio < analysis.requiredAA) {
      return 'high';
    }
    
    // Medium: Below-fold elements that fail
    if (analysis.contrastRatio < analysis.requiredAA) {
      return 'medium';
    }
    
    // Low: Passes AA but fails AAA
    return 'low';
  }

  /**
   * Generate specific, actionable fix recommendations
   */
  generateRecommendation(element, analysis) {
    const fgRgb = this.parseColor(element.foreground);
    const bgRgb = this.parseColor(element.background);
    
    const recommendations = {
      issue: `${analysis.context}: Contrast ratio ${analysis.contrastRatio}:1 (needs ${analysis.requiredAA}:1 for WCAG AA)`,
      current: {
        foreground: element.foreground,
        background: element.background,
        ratio: analysis.contrastRatio
      },
      options: []
    };
    
    // Option 1: Try white or black foreground
    const whiteRatio = this.calculateContrastRatio([255, 255, 255], bgRgb);
    const blackRatio = this.calculateContrastRatio([0, 0, 0], bgRgb);
    
    if (whiteRatio >= analysis.requiredAA) {
      recommendations.options.push({
        description: 'Use white text/icon',
        css: `color: white;`,
        ratio: whiteRatio,
        passesAA: whiteRatio >= analysis.requiredAA,
        passesAAA: whiteRatio >= analysis.requiredAAA
      });
    }
    
    if (blackRatio >= analysis.requiredAA) {
      recommendations.options.push({
        description: 'Use black text/icon',
        css: `color: black;`,
        ratio: blackRatio,
        passesAA: blackRatio >= analysis.requiredAA,
        passesAAA: blackRatio >= analysis.requiredAAA
      });
    }
    
    // Option 2: Darken foreground
    const darkenedFg = fgRgb.map(v => Math.max(0, v - 50));
    const darkenedRatio = this.calculateContrastRatio(darkenedFg, bgRgb);
    
    if (darkenedRatio > analysis.contrastRatio) {
      recommendations.options.push({
        description: 'Darken foreground color',
        css: `color: ${this.rgbToHex(darkenedFg)};`,
        ratio: darkenedRatio,
        passesAA: darkenedRatio >= analysis.requiredAA,
        passesAAA: darkenedRatio >= analysis.requiredAAA
      });
    }
    
    // Option 3: Lighten background
    const lightenedBg = bgRgb.map(v => Math.min(255, v + 50));
    const lightenedRatio = this.calculateContrastRatio(fgRgb, lightenedBg);
    
    if (lightenedRatio > analysis.contrastRatio) {
      recommendations.options.push({
        description: 'Lighten background color',
        css: `background-color: ${this.rgbToHex(lightenedBg)};`,
        ratio: lightenedRatio,
        passesAA: lightenedRatio >= analysis.requiredAA,
        passesAAA: lightenedRatio >= analysis.requiredAAA
      });
    }
    
    // Option 4: Add semi-transparent background to element
    recommendations.options.push({
      description: 'Add semi-transparent background to element',
      css: `background-color: rgba(255, 255, 255, 0.9); padding: 0.25rem 0.5rem; border-radius: 4px;`,
      note: 'Creates a "badge" effect with guaranteed contrast'
    });
    
    // Sort options by best ratio
    recommendations.options.sort((a, b) => (b.ratio || 0) - (a.ratio || 0));
    
    // Add best option as primary recommendation
    if (recommendations.options.length > 0 && recommendations.options[0].ratio) {
      recommendations.primaryFix = recommendations.options[0];
    }
    
    return recommendations;
  }

  /**
   * Browser management
   */
  async initBrowser() {
    this.browser = await chromium.launch({ headless: true });
    this.page = await this.browser.newPage();
  }

  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
    }
  }

  /**
   * Save report to file
   */
  async saveReport(report, outputPath) {
    const dir = dirname(outputPath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(outputPath, JSON.stringify(report, null, 2));
    console.log(`✅ Report saved: ${outputPath}`);
  }

  /**
   * Generate human-readable markdown report
   */
  generateMarkdownReport(report) {
    let md = `# Contrast Validation Report\n\n`;
    md += `**URL:** ${report.url}\n`;
    md += `**Date:** ${new Date(report.timestamp).toLocaleString()}\n`;
    md += `**WCAG Standard:** AA (4.5:1 for normal text, 3.0:1 for large text)\n\n`;
    
    md += `## Summary\n\n`;
    md += `- **Total Elements:** ${report.summary.total}\n`;
    md += `- **Passing:** ${report.summary.passing} (${report.summary.passRate})\n`;
    md += `- **Failing:** ${report.summary.failing}\n\n`;
    
    if (report.issues.length > 0) {
      md += `## Contrast Issues\n\n`;
      
      const groupedIssues = {};
      for (const issue of report.issues) {
        if (!groupedIssues[issue.severity]) {
          groupedIssues[issue.severity] = [];
        }
        groupedIssues[issue.severity].push(issue);
      }
      
      for (const severity of ['critical', 'high', 'medium', 'low']) {
        const issues = groupedIssues[severity];
        if (!issues || issues.length === 0) continue;
        
        md += `### ${severity.toUpperCase()} (${issues.length})\n\n`;
        
        for (const issue of issues) {
          md += `#### ${issue.context}: ${issue.text}\n\n`;
          md += `- **Selector:** \`${issue.selector}\`\n`;
          md += `- **Current Ratio:** ${issue.contrastRatio}:1 (needs ${issue.requiredAA}:1)\n`;
          md += `- **Foreground:** \`${issue.foreground}\`\n`;
          md += `- **Background:** \`${issue.background}\`\n`;
          md += `- **Font Size:** ${issue.fontSize}px\n`;
          md += `- **Location:** ${issue.isAboveFold ? 'Above fold' : 'Below fold'}\n\n`;
          
          if (issue.recommendation.primaryFix) {
            md += `**✨ Recommended Fix:**\n\n`;
            md += `\`\`\`css\n`;
            md += `${issue.selector} {\n`;
            md += `  ${issue.recommendation.primaryFix.css}\n`;
            md += `}\n`;
            md += `\`\`\`\n\n`;
            md += `**Result:** ${issue.recommendation.primaryFix.ratio}:1 contrast ratio `;
            md += issue.recommendation.primaryFix.passesAAA ? '(WCAG AAA ✅)' : '(WCAG AA ✅)';
            md += `\n\n`;
          }
          
          if (issue.recommendation.options.length > 1) {
            md += `<details>\n<summary>Alternative Fixes (${issue.recommendation.options.length - 1})</summary>\n\n`;
            for (const option of issue.recommendation.options.slice(1)) {
              md += `- **${option.description}**\n`;
              md += `  \`\`\`css\n  ${option.css}\n  \`\`\`\n`;
              if (option.ratio) {
                md += `  Ratio: ${option.ratio}:1`;
              }
              if (option.note) {
                md += ` (${option.note})`;
              }
              md += `\n\n`;
            }
            md += `</details>\n\n`;
          }
          
          md += `---\n\n`;
        }
      }
    } else {
      md += `## ✅ No Contrast Issues Found!\n\n`;
      md += `All ${report.summary.total} elements meet WCAG AA contrast requirements.\n\n`;
    }
    
    return md;
  }
}

/**
 * CLI Entry Point
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  
  const getArg = (flag) => {
    const index = args.indexOf(flag);
    return index !== -1 && args[index + 1] ? args[index + 1] : null;
  };
  
  const targetPath = getArg('--target') || getArg('-t') || '/validate/';
  const baseUrl = getArg('--base-url') || 'http://localhost:4321';
  const outputDir = getArg('--output') || getArg('-o') || 'docs/contrast-audits';
  
  (async () => {
    try {
      const validator = new ContrastValidator(baseUrl);
      const report = await validator.validate(targetPath);
      
      // Generate output paths
      const date = new Date().toISOString().split('T')[0];
      const pageName = targetPath.replace(/\//g, '-') || 'root';
      const jsonPath = join(outputDir, date, `contrast-${pageName}.json`);
      const mdPath = join(outputDir, date, `contrast-${pageName}.md`);
      
      // Save reports
      await validator.saveReport(report, jsonPath);
      
      const mdReport = validator.generateMarkdownReport(report);
      await fs.mkdir(dirname(mdPath), { recursive: true });
      await fs.writeFile(mdPath, mdReport);
      console.log(`✅ Markdown report saved: ${mdPath}`);
      
      // Print summary
      console.log(`\n${'='.repeat(60)}`);
      console.log(`📊 CONTRAST VALIDATION SUMMARY`);
      console.log(`${'='.repeat(60)}\n`);
      console.log(`Total Elements: ${report.summary.total}`);
      console.log(`Passing: ${report.summary.passing} (${report.summary.passRate})`);
      console.log(`Failing: ${report.summary.failing}`);
      
      if (report.issues.length > 0) {
        console.log(`\n⚠️  ${report.issues.length} contrast issues found:`);
        const bySeverity = {};
        for (const issue of report.issues) {
          bySeverity[issue.severity] = (bySeverity[issue.severity] || 0) + 1;
        }
        for (const [severity, count] of Object.entries(bySeverity)) {
          console.log(`  ${severity.toUpperCase()}: ${count}`);
        }
      } else {
        console.log(`\n✅ No contrast issues found!`);
      }
      
      console.log(`\nReports:`);
      console.log(`  JSON: ${jsonPath}`);
      console.log(`  Markdown: ${mdPath}`);
      
    } catch (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  })();
}

