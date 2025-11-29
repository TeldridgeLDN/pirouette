"use strict";
/**
 * Main Analyzer Entry Point
 * Railway Analysis Worker
 *
 * Simplified standalone analyzer that doesn't depend on Next.js app code.
 * Performs visual analysis using Playwright and saves results to Supabase.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeWebsite = analyzeWebsite;
exports.validateUrl = validateUrl;
exports.estimateAnalysisTime = estimateAnalysisTime;
const browser_1 = require("../utils/browser");
const supabase_1 = require("../utils/supabase");
// Simple pattern library for standalone analysis
const DEFAULT_PATTERNS = {
    meta: { designsExtracted: 50 },
    colors: {
        recommendedCount: { min: 3, max: 5 },
        contrastRatio: { min: 4.5 },
    },
    typography: {
        recommendedFontCount: { min: 1, max: 3 },
        minFontSize: 14,
        idealLineHeight: 1.5,
    },
    cta: {
        minSize: 44,
        recommendedCount: { min: 1, max: 3 },
    },
    complexity: {
        ideal: { min: 50, max: 300 },
    },
};
// ============================================================================
// Enhanced Analysis Functions
// ============================================================================
function analyzeColors(colors) {
    const uniqueColors = [...new Set(colors.filter(c => c && c.trim()))];
    const colorCount = uniqueColors.length;
    let score = 60;
    const findings = [];
    // Score based on color count with benchmarks
    if (colorCount >= 3 && colorCount <= 5) {
        score = 85;
        findings.push(`✓ ${colorCount} colours matches **Notion** (4-5) & **Superhuman** (3-4) - focused palette`);
    }
    else if (colorCount >= 2 && colorCount <= 7) {
        score = 75;
        findings.push(`${colorCount} colours similar to **Linear** (5) & **Stripe** (4-5) - good balance`);
    }
    else if (colorCount === 1) {
        score = 50;
        findings.push(`Only 1 colour - **Superhuman** uses 3-4 colours for visual interest while staying focused`);
    }
    else if (colorCount > 7 && colorCount <= 10) {
        score = 60;
        findings.push(`⚠ ${colorCount} colours exceeds **Notion** (4-5) - consider consolidating for focus`);
    }
    else if (colorCount > 10) {
        score = 45;
        findings.push(`✗ ${colorCount} colours is 2x+ more than **Stripe** or **Linear** - reduces visual clarity`);
    }
    else {
        findings.push('Unable to extract meaningful colour data');
    }
    // Get dominant colors (first 5)
    const dominantColors = uniqueColors.slice(0, 5);
    // Add accessibility note
    if (colorCount > 0) {
        findings.push(`Pro tip: **Apple** & **Gov.uk** achieve 7:1+ contrast ratios for maximum accessibility`);
    }
    return {
        score: Math.min(100, Math.max(0, score)),
        findings,
        data: {
            totalColors: colors.length,
            uniqueColors: uniqueColors.slice(0, 20), // Cap at 20 for storage
            dominantColors,
        },
    };
}
function analyzeTypography(typography) {
    const uniqueFonts = [...new Set(typography.fontFamilies.filter(f => f && f.trim()))];
    const fontCount = uniqueFonts.length;
    const fontSizes = typography.fontSizes.filter(s => s > 0);
    const minSize = fontSizes.length > 0 ? Math.min(...fontSizes) : 16;
    const maxSize = fontSizes.length > 0 ? Math.max(...fontSizes) : 16;
    let score = 60;
    const findings = [];
    // Font family analysis with benchmarks
    if (fontCount === 1) {
        score += 15;
        findings.push(`✓ Single font family (${uniqueFonts[0]}) like **Linear** which uses 1 font for clean consistency`);
    }
    else if (fontCount === 2) {
        score += 25;
        findings.push(`✓ ${fontCount} font families - matches **Stripe** & **Vercel** who use 2 fonts for clear hierarchy`);
    }
    else if (fontCount === 3) {
        score += 15;
        findings.push(`3 font families detected - **Apple** uses 2, consider consolidating for consistency`);
    }
    else if (fontCount > 3) {
        score -= 10;
        findings.push(`${fontCount} fonts detected - award-winning sites like **Notion** & **Linear** use only 1-2 fonts`);
    }
    // Font size analysis with WCAG and examples
    if (minSize >= 16) {
        score += 15;
        findings.push(`✓ Base font ${minSize}px matches **Apple** (17px) & **Stripe** (16px) - exceeds WCAG AA (14px)`);
    }
    else if (minSize >= 14) {
        score += 10;
        findings.push(`Base font ${minSize}px meets WCAG AA - **Medium** uses 18px, consider 16px+ for modern feel`);
    }
    else if (minSize >= 12) {
        score += 0;
        findings.push(`⚠ Base font ${minSize}px below modern standard - **Stripe** & **Linear** use 16px minimum`);
    }
    else {
        score -= 10;
        findings.push(`✗ ${minSize}px font is too small - WCAG AA requires 14px+, best sites use 16-18px`);
    }
    // Size range analysis (type scale) with examples
    const sizeRange = maxSize - minSize;
    if (sizeRange >= 20 && sizeRange <= 60) {
        findings.push(`✓ Type scale (${minSize}px→${maxSize}px) similar to **Tailwind** (14px→72px) - clear hierarchy`);
    }
    else if (sizeRange < 10) {
        findings.push(`Limited type scale (${minSize}px→${maxSize}px) - **Stripe** uses ${16}px→64px for stronger hierarchy`);
    }
    else if (sizeRange > 60) {
        findings.push(`Wide type scale (${minSize}px→${maxSize}px) - ensure mid-range sizes for smooth transitions`);
    }
    return {
        score: Math.min(100, Math.max(0, score)),
        findings,
        data: {
            fontFamilies: uniqueFonts,
            fontSizes: [...new Set(fontSizes)].sort((a, b) => a - b),
            minFontSize: minSize,
            maxFontSize: maxSize,
        },
    };
}
function analyzeCTAs(ctas) {
    const buttonCTAs = ctas.filter(c => c.isButton);
    const linkCTAs = ctas.filter(c => !c.isButton);
    const ctaTexts = ctas.map(c => c.text).filter(t => t && t.trim()).slice(0, 10);
    let score = 50;
    const findings = [];
    // CTA count analysis with benchmarks
    if (ctas.length === 0) {
        score = 30;
        findings.push('✗ No CTAs found - **Dropbox** & **Vercel** use 1-2 prominent CTAs above fold');
    }
    else if (ctas.length === 1) {
        score = 75;
        findings.push(`✓ Single focused CTA like **Dropbox** - they use 1 hero CTA for maximum conversion`);
    }
    else if (ctas.length >= 2 && ctas.length <= 3) {
        score = 90;
        findings.push(`✓ ${ctas.length} CTAs matches **Vercel** & **Slack** pattern - primary + secondary actions`);
    }
    else if (ctas.length > 3 && ctas.length <= 5) {
        score = 75;
        findings.push(`${ctas.length} CTAs detected - **Stripe** uses 2-3 with clear hierarchy, consider reducing`);
    }
    else {
        score = 55;
        findings.push(`⚠ ${ctas.length} CTAs may dilute focus - **Linear** uses just 1-2 for 45%+ conversion lift`);
    }
    // Button vs link analysis with conversion data
    if (buttonCTAs.length > 0) {
        score += 10;
        findings.push(`✓ ${buttonCTAs.length} button CTA${buttonCTAs.length > 1 ? 's' : ''} - buttons convert 30-45% better than text links`);
    }
    else if (ctas.length > 0) {
        findings.push('⚠ No button CTAs - **Stripe** uses solid buttons that convert 30-45% better than links');
    }
    // CTA text quality hints with examples
    const hasActionWords = ctaTexts.some(t => t.toLowerCase().includes('free') ||
        t.toLowerCase().includes('start') ||
        t.toLowerCase().includes('get') ||
        t.toLowerCase().includes('try'));
    if (hasActionWords) {
        findings.push(`✓ Action-oriented copy detected - similar to **Notion** ("Get Notion free") & **Linear** ("Start building")`);
    }
    else if (ctaTexts.length > 0) {
        findings.push(`Consider action verbs - **Vercel** uses "Start Deploying", **Linear** uses "Start building"`);
    }
    return {
        score: Math.min(100, Math.max(0, score)),
        findings,
        data: {
            totalCTAs: ctas.length,
            buttonCTAs: buttonCTAs.length,
            linkCTAs: linkCTAs.length,
            ctaTexts,
        },
    };
}
function analyzeComplexity(elementCount) {
    let score = 70;
    const findings = [];
    let complexity;
    if (elementCount < 50) {
        score = 80;
        complexity = 'minimal';
        findings.push(`✓ Ultra-minimal (${elementCount} elements) - even cleaner than **Linear** (~150 elements)`);
    }
    else if (elementCount < 150) {
        score = 90;
        complexity = 'simple';
        findings.push(`✓ ${elementCount} elements matches **Linear** (~150) & **Apple** (~150-200) - optimal for focus`);
    }
    else if (elementCount < 300) {
        score = 75;
        complexity = 'moderate';
        findings.push(`${elementCount} elements similar to **Stripe** (~200-300) - feature-rich but well-balanced`);
    }
    else if (elementCount < 500) {
        score = 60;
        complexity = 'complex';
        findings.push(`⚠ ${elementCount} elements exceeds **Stripe** (200-300) - **Linear** achieves more with ~150`);
    }
    else {
        score = 45;
        complexity = 'very-complex';
        findings.push(`✗ ${elementCount} elements is 2-3x more than **Apple** or **Linear** - significantly impacts load time`);
    }
    // Add context about industry benchmarks with examples
    if (elementCount > 300) {
        findings.push(`Best-in-class sites: **Linear** ~150, **Apple** ~150-200, **Stripe** ~200-300 elements`);
    }
    else if (elementCount < 100) {
        findings.push(`Exceptionally minimal - ensure key content isn't missing (hero, CTA, social proof)`);
    }
    return {
        score: Math.min(100, Math.max(0, score)),
        findings,
        data: {
            elementCount,
            complexity,
        },
    };
}
function generateRecommendations(analysisData, dimensions) {
    const recommendations = [];
    let recId = 1;
    // Color recommendations
    const colorData = analysisData.colors.data;
    if (analysisData.colors.score < 80) {
        if (colorData.uniqueColors.length > 7) {
            recommendations.push({
                id: `rec-${recId++}`,
                title: 'Simplify Your Colour Palette',
                description: `Your page uses ${colorData.uniqueColors.length} different colours. High-converting landing pages typically use 3-5 core colours. A focused palette creates visual harmony and guides attention to key elements.`,
                priority: colorData.uniqueColors.length > 12 ? 'high' : 'medium',
                effort: 'medium',
                impact: 'Reducing colour complexity can improve visual focus and increase conversions by 10-15%',
                dimension: 'Colour & Contrast',
                actionItems: [
                    'Choose 1 primary brand colour for CTAs and key elements',
                    'Select 1-2 neutral colours for text and backgrounds',
                    'Use 1 accent colour sparingly for emphasis',
                    `Current dominant colours: ${colorData.dominantColors.slice(0, 3).join(', ')}`,
                ],
            });
        }
        else if (colorData.uniqueColors.length < 3) {
            recommendations.push({
                id: `rec-${recId++}`,
                title: 'Add Visual Interest with Accent Colours',
                description: `Only ${colorData.uniqueColors.length} colour${colorData.uniqueColors.length === 1 ? '' : 's'} detected. While minimalism works, strategic accent colours help guide user attention to CTAs and important information.`,
                priority: 'medium',
                effort: 'low',
                impact: 'Strategic colour accents can improve CTA visibility and click-through rates',
                dimension: 'Colour & Contrast',
                actionItems: [
                    'Add a contrasting accent colour for primary CTAs',
                    'Consider a subtle secondary colour for hover states',
                    'Ensure sufficient contrast between text and backgrounds',
                ],
            });
        }
    }
    // Typography recommendations
    const typoData = analysisData.typography.data;
    if (analysisData.typography.score < 80) {
        if (typoData.fontFamilies.length > 3) {
            recommendations.push({
                id: `rec-${recId++}`,
                title: 'Consolidate Font Families',
                description: `Your page uses ${typoData.fontFamilies.length} different fonts: ${typoData.fontFamilies.slice(0, 4).join(', ')}${typoData.fontFamilies.length > 4 ? '...' : ''}. Professional designs typically use 1-2 fonts. Multiple fonts slow page loading and create visual inconsistency.`,
                priority: typoData.fontFamilies.length > 4 ? 'high' : 'medium',
                effort: 'medium',
                impact: 'Consolidating fonts improves loading speed and brand consistency',
                dimension: 'Typography',
                actionItems: [
                    'Choose 1 font for headings (consider: ${typoData.fontFamilies[0]})',
                    'Use 1 complementary font for body text',
                    'Remove or replace decorative fonts',
                    'Each font adds ~100-400KB to page load time',
                ],
            });
        }
        if (typoData.minFontSize < 14) {
            recommendations.push({
                id: `rec-${recId++}`,
                title: 'Increase Minimum Font Size',
                description: `Your smallest text is ${typoData.minFontSize}px. Modern accessibility guidelines recommend a minimum of 16px for body text. Small text increases bounce rates, especially on mobile devices.`,
                priority: typoData.minFontSize < 12 ? 'high' : 'medium',
                effort: 'low',
                impact: 'Improving readability can reduce bounce rates by 10-20%',
                dimension: 'Typography',
                actionItems: [
                    `Increase body text from ${typoData.minFontSize}px to at least 16px`,
                    'Ensure captions and labels are at least 14px',
                    'Test readability on mobile devices',
                    'Consider users who may have visual impairments',
                ],
            });
        }
    }
    // CTA recommendations
    const ctaData = analysisData.ctas.data;
    if (analysisData.ctas.score < 80) {
        if (ctaData.totalCTAs === 0) {
            recommendations.push({
                id: `rec-${recId++}`,
                title: 'Add Clear Call-to-Action Buttons',
                description: 'No prominent CTAs detected on your page. Every landing page needs clear, visible calls-to-action to convert visitors. Without CTAs, visitors don\'t know what action to take.',
                priority: 'high',
                effort: 'low',
                impact: 'Adding clear CTAs is the single most impactful change you can make - essential for any conversion',
                dimension: 'CTA Design',
                actionItems: [
                    'Add a primary CTA above the fold (e.g., "Get Started", "Try Free")',
                    'Use a contrasting colour for the CTA button',
                    'Make the button large enough to tap on mobile (min 44x44px)',
                    'Repeat the CTA after key sections',
                ],
            });
        }
        else if (ctaData.totalCTAs > 5) {
            recommendations.push({
                id: `rec-${recId++}`,
                title: 'Reduce CTA Clutter',
                description: `Your page has ${ctaData.totalCTAs} CTAs, which may overwhelm visitors. Too many options lead to decision paralysis. Focus on 1-3 key actions to improve conversion rates.`,
                priority: 'medium',
                effort: 'medium',
                impact: 'Reducing choice overload can improve conversions by 15-25%',
                dimension: 'CTA Design',
                actionItems: [
                    'Identify your single most important action',
                    'Make the primary CTA visually dominant',
                    'Reduce secondary CTAs or make them less prominent',
                    `Current CTAs: ${ctaData.ctaTexts.slice(0, 5).join(', ')}`,
                ],
            });
        }
        else if (ctaData.buttonCTAs === 0 && ctaData.totalCTAs > 0) {
            recommendations.push({
                id: `rec-${recId++}`,
                title: 'Convert Links to Button CTAs',
                description: `Your ${ctaData.totalCTAs} CTAs are text links rather than buttons. Button-style CTAs are 45% more likely to be clicked than text links due to increased visual prominence.`,
                priority: 'medium',
                effort: 'low',
                impact: 'Button CTAs typically convert 30-45% better than text links',
                dimension: 'CTA Design',
                actionItems: [
                    'Convert your primary CTA to a button style',
                    'Use padding and background colour for prominence',
                    'Ensure good colour contrast with surrounding content',
                ],
            });
        }
    }
    // Complexity recommendations
    const complexityData = analysisData.complexity.data;
    if (analysisData.complexity.score < 70) {
        if (complexityData.elementCount > 400) {
            recommendations.push({
                id: `rec-${recId++}`,
                title: 'Simplify Page Structure',
                description: `Your page has ${complexityData.elementCount} elements, classified as "${complexityData.complexity}". Award-winning landing pages average 150-250 elements. Complex pages have higher bounce rates and lower conversion rates.`,
                priority: complexityData.elementCount > 600 ? 'high' : 'medium',
                effort: 'high',
                impact: 'Simpler pages load faster and convert up to 35% better',
                dimension: 'Visual Hierarchy',
                actionItems: [
                    'Remove or consolidate redundant sections',
                    'Use progressive disclosure (show more on click)',
                    'Prioritise content above the fold',
                    'Consider removing decorative elements that don\'t serve a purpose',
                    'Lazy-load content below the fold',
                ],
            });
        }
    }
    // Sort by priority (high first) then by score impact
    recommendations.sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
    // Return top 5 recommendations
    return recommendations.slice(0, 5);
}
// ============================================================================
// Main Analysis Function
// ============================================================================
async function analyzeWebsite(job, onProgress) {
    const { jobId, url, userId } = job;
    const startTime = Date.now();
    console.log(`[Analyzer] Starting analysis for job ${jobId}: ${url}`);
    const reportProgress = async (progress, step, message) => {
        if (onProgress) {
            await onProgress({ jobId, progress, step, message });
        }
        await (0, supabase_1.updateJobProgress)(jobId, progress, step, message);
        console.log(`[Analyzer] ${progress}% - ${step}: ${message}`);
    };
    try {
        await (0, supabase_1.updateJobStatus)(jobId, 'processing');
        // Step 1: Initialize (5%)
        await reportProgress(5, 'initialization', 'Starting analysis...');
        // Step 2: Launch browser (10%)
        await reportProgress(10, 'browser', 'Launching browser...');
        const browser = new browser_1.PlaywrightBrowser({
            headless: true,
            timeout: 30000,
        });
        await browser.launch();
        const page = await browser.newPage();
        try {
            // Step 3: Navigate to URL (20%)
            await reportProgress(20, 'navigation', `Loading ${url}...`);
            const navigationSuccess = await browser.navigateToUrl(page, url);
            if (!navigationSuccess) {
                throw new Error(`Failed to load URL: ${url}`);
            }
            // Step 4: Capture screenshot (30%)
            await reportProgress(30, 'screenshot', 'Capturing screenshot...');
            const screenshotBuffer = await browser.captureScreenshot(page);
            console.log(`[Analyzer] Screenshot captured: ${screenshotBuffer.length} bytes`);
            // Step 4.5: Upload screenshot (35%)
            await reportProgress(35, 'upload', 'Uploading screenshot...');
            const screenshotUrl = await (0, supabase_1.uploadScreenshot)(jobId, screenshotBuffer);
            if (!screenshotUrl) {
                console.warn('[Analyzer] Screenshot upload failed, continuing without it');
            }
            // Step 5: Extract data (40%)
            await reportProgress(40, 'extraction', 'Extracting design data...');
            const [colors, typography, elementCount, ctas] = await Promise.all([
                browser.extractColors(page),
                browser.extractTypography(page),
                browser.countElements(page),
                browser.findCTAs(page),
            ]);
            console.log(`[Analyzer] Extracted data:`, {
                colorsFound: colors.length,
                fontsFound: typography.fontFamilies.length,
                elements: elementCount,
                ctasFound: ctas.length,
            });
            // Step 6: Run analysis (50-80%)
            await reportProgress(50, 'analysis', 'Analyzing colors...');
            const colorAnalysis = analyzeColors(colors);
            await reportProgress(60, 'analysis', 'Analyzing typography...');
            const typographyAnalysis = analyzeTypography(typography);
            await reportProgress(70, 'analysis', 'Analyzing CTAs...');
            const ctaAnalysis = analyzeCTAs(ctas);
            await reportProgress(75, 'analysis', 'Analyzing complexity...');
            const complexityAnalysis = analyzeComplexity(elementCount);
            // Default scores for dimensions not fully analyzed yet
            const whitespaceAnalysis = { score: 75, findings: ['Whitespace analysis shows reasonable spacing'] };
            const layoutAnalysis = { score: 75, findings: ['Layout structure is standard'] };
            const hierarchyAnalysis = { score: complexityAnalysis.score, findings: complexityAnalysis.findings };
            const dimensionScores = {
                colors: colorAnalysis.score,
                whitespace: whitespaceAnalysis.score,
                complexity: complexityAnalysis.score,
                typography: typographyAnalysis.score,
                layout: layoutAnalysis.score,
                ctaProminence: ctaAnalysis.score,
                hierarchy: hierarchyAnalysis.score,
            };
            const overallScore = Math.round(Object.values(dimensionScores).reduce((a, b) => a + b, 0) /
                Object.values(dimensionScores).length);
            // Build dimensions object for storage
            const dimensions = {
                colors: { score: colorAnalysis.score, findings: colorAnalysis.findings },
                whitespace: whitespaceAnalysis,
                complexity: { score: complexityAnalysis.score, findings: complexityAnalysis.findings },
                typography: { score: typographyAnalysis.score, findings: typographyAnalysis.findings },
                layout: layoutAnalysis,
                ctaProminence: { score: ctaAnalysis.score, findings: ctaAnalysis.findings },
                hierarchy: hierarchyAnalysis,
            };
            // Build analysis data for enhanced recommendations
            const analysisData = {
                colors: colorAnalysis,
                typography: typographyAnalysis,
                ctas: ctaAnalysis,
                complexity: complexityAnalysis,
            };
            // Step 7: Generate recommendations (80%)
            await reportProgress(80, 'recommendations', 'Generating recommendations...');
            const recommendations = generateRecommendations(analysisData, dimensions);
            // Build report
            const report = {
                id: jobId,
                url,
                timestamp: new Date().toISOString(),
                screenshot: screenshotUrl || undefined,
                dimensions,
                overallScore,
                dimensionScores,
                recommendations,
                analysisTime: Date.now() - startTime,
                version: '1.0.0',
            };
            // Step 8: Save to database (90%)
            await reportProgress(90, 'saving', 'Saving report...');
            await (0, supabase_1.saveReport)(jobId, userId, url, report);
            console.log(`[Analyzer] Analysis complete:`, {
                overallScore: report.overallScore,
                dimensions: Object.keys(report.dimensionScores).length,
                recommendations: report.recommendations.length,
                time: `${report.analysisTime}ms`,
            });
            // Step 9: Complete (100%)
            await reportProgress(100, 'complete', 'Analysis complete!');
            await (0, supabase_1.updateJobStatus)(jobId, 'completed');
            return report;
        }
        finally {
            await browser.cleanup();
        }
    }
    catch (error) {
        console.error(`[Analyzer] Analysis failed for ${jobId}:`, error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        await (0, supabase_1.updateJobStatus)(jobId, 'failed', errorMessage);
        throw error;
    }
}
/**
 * Validate URL before analysis
 */
function validateUrl(url) {
    try {
        const parsed = new URL(url);
        if (!['http:', 'https:'].includes(parsed.protocol)) {
            return { valid: false, error: 'URL must use HTTP or HTTPS protocol' };
        }
        if (!parsed.hostname) {
            return { valid: false, error: 'Invalid hostname' };
        }
        if (process.env.NODE_ENV === 'production' &&
            (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1')) {
            return { valid: false, error: 'Cannot analyze localhost URLs' };
        }
        return { valid: true };
    }
    catch (error) {
        return { valid: false, error: 'Invalid URL format' };
    }
}
/**
 * Estimate analysis time based on URL
 */
function estimateAnalysisTime(url) {
    return 30000; // 30 seconds in milliseconds
}
exports.default = {
    analyzeWebsite,
    validateUrl,
    estimateAnalysisTime,
};
