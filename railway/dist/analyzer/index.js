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
        recommendedCount: { min: 2, max: 5 },
        contrastRatio: { min: 4.5 },
    },
    typography: {
        recommendedFontCount: { min: 1, max: 3 },
        minFontSize: 14,
    },
    cta: {
        minSize: 44,
        recommendedColors: ['#FF6B6B', '#4ECDC4', '#45B7D1'],
    },
};
// ============================================================================
// Analysis Functions (Simplified)
// ============================================================================
function analyzeColors(colors) {
    const uniqueColors = [...new Set(colors)];
    const colorCount = uniqueColors.length;
    let score = 70;
    const findings = [];
    if (colorCount >= 2 && colorCount <= 5) {
        score += 15;
        findings.push('Good color palette size');
    }
    else if (colorCount > 5) {
        score -= 10;
        findings.push('Consider reducing color palette');
    }
    return { score: Math.min(100, Math.max(0, score)), findings };
}
function analyzeTypography(typography) {
    let score = 70;
    const findings = [];
    const fontCount = typography.fontFamilies.length;
    if (fontCount >= 1 && fontCount <= 3) {
        score += 15;
        findings.push('Good font variety');
    }
    else if (fontCount > 3) {
        score -= 10;
        findings.push('Consider using fewer fonts');
    }
    const minSize = Math.min(...typography.fontSizes);
    if (minSize >= 14) {
        score += 10;
        findings.push('Good minimum font size for readability');
    }
    else {
        findings.push('Consider increasing minimum font size');
    }
    return { score: Math.min(100, Math.max(0, score)), findings };
}
function analyzeCTAs(ctas) {
    let score = 70;
    const findings = [];
    if (ctas.length > 0) {
        score += 15;
        findings.push(`Found ${ctas.length} call-to-action elements`);
    }
    else {
        score -= 20;
        findings.push('No clear CTAs found');
    }
    const buttonCtas = ctas.filter(c => c.isButton);
    if (buttonCtas.length > 0) {
        score += 10;
        findings.push('Good use of button CTAs');
    }
    return { score: Math.min(100, Math.max(0, score)), findings };
}
function analyzeComplexity(elementCount) {
    let score = 75;
    const findings = [];
    if (elementCount < 100) {
        score += 15;
        findings.push('Clean, simple page structure');
    }
    else if (elementCount > 500) {
        score -= 15;
        findings.push('Page may be too complex');
    }
    return { score: Math.min(100, Math.max(0, score)), findings };
}
function generateRecommendations(dimensions) {
    const recommendations = [];
    for (const [dimension, analysis] of Object.entries(dimensions)) {
        if (analysis.score < 70) {
            recommendations.push({
                title: `Improve ${dimension}`,
                description: analysis.findings.join('. ') || `Consider improving your ${dimension} design.`,
                priority: analysis.score < 50 ? 'high' : 'medium',
                impact: 'Potential conversion improvement',
            });
        }
    }
    return recommendations.slice(0, 5); // Top 5 recommendations
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
            // Default scores for dimensions not fully analyzed
            const whitespaceAnalysis = { score: 75, findings: ['Basic whitespace analysis'] };
            const layoutAnalysis = { score: 75, findings: ['Basic layout analysis'] };
            const hierarchyAnalysis = { score: 75, findings: ['Basic hierarchy analysis'] };
            const imageTextAnalysis = { score: 75, findings: ['Basic image-text ratio analysis'] };
            const dimensionScores = {
                colors: colorAnalysis.score,
                whitespace: whitespaceAnalysis.score,
                complexity: complexityAnalysis.score,
                imageText: imageTextAnalysis.score,
                typography: typographyAnalysis.score,
                layout: layoutAnalysis.score,
                ctaProminence: ctaAnalysis.score,
                hierarchy: hierarchyAnalysis.score,
            };
            const overallScore = Math.round(Object.values(dimensionScores).reduce((a, b) => a + b, 0) /
                Object.values(dimensionScores).length);
            // Build dimensions object
            const dimensions = {
                colors: colorAnalysis,
                whitespace: whitespaceAnalysis,
                complexity: complexityAnalysis,
                imageText: imageTextAnalysis,
                typography: typographyAnalysis,
                layout: layoutAnalysis,
                ctaProminence: ctaAnalysis,
                hierarchy: hierarchyAnalysis,
            };
            // Step 7: Generate recommendations (80%)
            await reportProgress(80, 'recommendations', 'Generating recommendations...');
            const recommendations = generateRecommendations(dimensions);
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
