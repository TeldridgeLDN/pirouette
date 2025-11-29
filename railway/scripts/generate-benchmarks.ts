/**
 * Benchmark Generation Script
 * 
 * Analyzes 50+ award-winning sites using Pirouette's own analyzer
 * to create verified benchmark data for Pro insights.
 * 
 * Usage:
 *   npx ts-node scripts/generate-benchmarks.ts
 * 
 * Output:
 *   src/analyzer/benchmark-data.json
 */

import { chromium, Browser, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// Sites to Benchmark (50+ Award-Winning Landing Pages)
// ============================================================================

const BENCHMARK_SITES = [
  // SaaS - Productivity
  { url: 'https://linear.app', name: 'Linear', category: 'SaaS' },
  { url: 'https://notion.so', name: 'Notion', category: 'SaaS' },
  { url: 'https://slack.com', name: 'Slack', category: 'SaaS' },
  { url: 'https://figma.com', name: 'Figma', category: 'SaaS' },
  { url: 'https://framer.com', name: 'Framer', category: 'SaaS' },
  { url: 'https://pitch.com', name: 'Pitch', category: 'SaaS' },
  { url: 'https://loom.com', name: 'Loom', category: 'SaaS' },
  { url: 'https://miro.com', name: 'Miro', category: 'SaaS' },
  
  // SaaS - Developer Tools
  { url: 'https://vercel.com', name: 'Vercel', category: 'DevTools' },
  { url: 'https://stripe.com', name: 'Stripe', category: 'DevTools' },
  { url: 'https://github.com', name: 'GitHub', category: 'DevTools' },
  { url: 'https://supabase.com', name: 'Supabase', category: 'DevTools' },
  { url: 'https://railway.app', name: 'Railway', category: 'DevTools' },
  { url: 'https://planetscale.com', name: 'PlanetScale', category: 'DevTools' },
  { url: 'https://tailwindcss.com', name: 'Tailwind CSS', category: 'DevTools' },
  { url: 'https://prisma.io', name: 'Prisma', category: 'DevTools' },
  
  // Startup/Indie
  { url: 'https://superhuman.com', name: 'Superhuman', category: 'Startup' },
  { url: 'https://raycast.com', name: 'Raycast', category: 'Startup' },
  { url: 'https://arc.net', name: 'Arc', category: 'Startup' },
  { url: 'https://hey.com', name: 'Hey', category: 'Startup' },
  { url: 'https://basecamp.com', name: 'Basecamp', category: 'Startup' },
  { url: 'https://cal.com', name: 'Cal.com', category: 'Startup' },
  { url: 'https://dub.co', name: 'Dub', category: 'Startup' },
  { url: 'https://resend.com', name: 'Resend', category: 'Startup' },
  
  // Big Tech
  { url: 'https://apple.com', name: 'Apple', category: 'BigTech' },
  { url: 'https://airbnb.com', name: 'Airbnb', category: 'BigTech' },
  { url: 'https://dropbox.com', name: 'Dropbox', category: 'BigTech' },
  { url: 'https://spotify.com', name: 'Spotify', category: 'BigTech' },
  { url: 'https://shopify.com', name: 'Shopify', category: 'BigTech' },
  { url: 'https://squarespace.com', name: 'Squarespace', category: 'BigTech' },
  
  // E-commerce/Consumer
  { url: 'https://glossier.com', name: 'Glossier', category: 'Consumer' },
  { url: 'https://allbirds.com', name: 'Allbirds', category: 'Consumer' },
  { url: 'https://warbyparker.com', name: 'Warby Parker', category: 'Consumer' },
  { url: 'https://casper.com', name: 'Casper', category: 'Consumer' },
  
  // Media/Content
  { url: 'https://medium.com', name: 'Medium', category: 'Media' },
  { url: 'https://substack.com', name: 'Substack', category: 'Media' },
  { url: 'https://ghost.org', name: 'Ghost', category: 'Media' },
  
  // Finance
  { url: 'https://mercury.com', name: 'Mercury', category: 'Finance' },
  { url: 'https://ramp.com', name: 'Ramp', category: 'Finance' },
  { url: 'https://brex.com', name: 'Brex', category: 'Finance' },
  { url: 'https://wise.com', name: 'Wise', category: 'Finance' },
  
  // Design Tools
  { url: 'https://canva.com', name: 'Canva', category: 'Design' },
  { url: 'https://webflow.com', name: 'Webflow', category: 'Design' },
  { url: 'https://sketch.com', name: 'Sketch', category: 'Design' },
  
  // Marketing/Growth
  { url: 'https://mailchimp.com', name: 'Mailchimp', category: 'Marketing' },
  { url: 'https://intercom.com', name: 'Intercom', category: 'Marketing' },
  { url: 'https://hubspot.com', name: 'HubSpot', category: 'Marketing' },
  { url: 'https://segment.com', name: 'Segment', category: 'Marketing' },
  { url: 'https://amplitude.com', name: 'Amplitude', category: 'Marketing' },
];

// ============================================================================
// Analysis Functions (Simplified from main analyzer)
// ============================================================================

interface BenchmarkResult {
  name: string;
  url: string;
  category: string;
  analyzedAt: string;
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
    dominantColors: string[];
    ctaCount: number;
    buttonCtaCount: number;
    ctaTexts: string[];
    elementCount: number;
  };
}

async function extractPageData(page: Page): Promise<BenchmarkResult['data']> {
  return await page.evaluate(() => {
    // Font extraction
    const fontFamilies = new Set<string>();
    const fontSizes: number[] = [];
    document.querySelectorAll('*').forEach(el => {
      const style = window.getComputedStyle(el);
      const fontFamily = style.fontFamily.split(',')[0].replace(/['"]/g, '').trim();
      if (fontFamily) fontFamilies.add(fontFamily);
      const fontSize = parseFloat(style.fontSize);
      if (fontSize > 0) fontSizes.push(fontSize);
    });
    
    // Color extraction
    const colors = new Set<string>();
    document.querySelectorAll('*').forEach(el => {
      const style = window.getComputedStyle(el);
      if (style.color) colors.add(style.color);
      if (style.backgroundColor && style.backgroundColor !== 'rgba(0, 0, 0, 0)') {
        colors.add(style.backgroundColor);
      }
    });
    
    // CTA extraction
    const ctas: { text: string; isButton: boolean }[] = [];
    document.querySelectorAll('button, a[href], [role="button"]').forEach(el => {
      const text = (el as HTMLElement).innerText?.trim().slice(0, 50);
      if (text && text.length > 0 && text.length < 50) {
        const isButton = el.tagName === 'BUTTON' || 
          el.getAttribute('role') === 'button' ||
          (el as HTMLElement).className?.includes('btn') ||
          (el as HTMLElement).className?.includes('button');
        ctas.push({ text, isButton });
      }
    });
    
    // Element count
    const elementCount = document.querySelectorAll('*').length;
    
    // Base font size (most common)
    const sizeMap = new Map<number, number>();
    fontSizes.forEach(s => sizeMap.set(s, (sizeMap.get(s) || 0) + 1));
    let baseFontSize = 16;
    let maxCount = 0;
    sizeMap.forEach((count, size) => {
      if (count > maxCount && size >= 14 && size <= 20) {
        maxCount = count;
        baseFontSize = size;
      }
    });
    
    return {
      fontCount: fontFamilies.size,
      fontFamilies: Array.from(fontFamilies).slice(0, 5),
      baseFontSize,
      colorCount: colors.size,
      dominantColors: Array.from(colors).slice(0, 6),
      ctaCount: ctas.length,
      buttonCtaCount: ctas.filter(c => c.isButton).length,
      ctaTexts: ctas.map(c => c.text).slice(0, 5),
      elementCount,
    };
  });
}

function calculateScores(data: BenchmarkResult['data']): BenchmarkResult['scores'] {
  // Typography score
  let typographyScore = 60;
  if (data.fontCount === 1) typographyScore = 75;
  else if (data.fontCount === 2) typographyScore = 90;
  else if (data.fontCount === 3) typographyScore = 75;
  else if (data.fontCount > 3) typographyScore = 50;
  if (data.baseFontSize >= 16) typographyScore += 10;
  
  // Color score
  let colorScore = 60;
  if (data.colorCount >= 3 && data.colorCount <= 6) colorScore = 85;
  else if (data.colorCount >= 2 && data.colorCount <= 8) colorScore = 75;
  else if (data.colorCount > 10) colorScore = 50;
  
  // CTA score
  let ctaScore = 50;
  if (data.ctaCount >= 1 && data.ctaCount <= 3) ctaScore = 90;
  else if (data.ctaCount >= 4 && data.ctaCount <= 5) ctaScore = 75;
  else if (data.ctaCount > 5) ctaScore = 60;
  if (data.buttonCtaCount > 0) ctaScore += 10;
  
  // Complexity score
  let complexityScore = 70;
  if (data.elementCount < 150) complexityScore = 90;
  else if (data.elementCount < 300) complexityScore = 80;
  else if (data.elementCount < 500) complexityScore = 65;
  else complexityScore = 50;
  
  const overall = Math.round(
    (typographyScore + colorScore + ctaScore + complexityScore) / 4
  );
  
  return {
    overall: Math.min(100, overall),
    typography: Math.min(100, typographyScore),
    colors: Math.min(100, colorScore),
    cta: Math.min(100, ctaScore),
    complexity: Math.min(100, complexityScore),
  };
}

// ============================================================================
// Main Generation Function
// ============================================================================

async function generateBenchmarks(): Promise<void> {
  console.log('🚀 Starting benchmark generation...\n');
  console.log(`📊 Analyzing ${BENCHMARK_SITES.length} sites\n`);
  
  const browser: Browser = await chromium.launch({ headless: true });
  const results: BenchmarkResult[] = [];
  const errors: { url: string; error: string }[] = [];
  
  for (let i = 0; i < BENCHMARK_SITES.length; i++) {
    const site = BENCHMARK_SITES[i];
    console.log(`[${i + 1}/${BENCHMARK_SITES.length}] Analyzing ${site.name} (${site.url})...`);
    
    try {
      const page = await browser.newPage();
      await page.setViewportSize({ width: 1440, height: 900 });
      
      await page.goto(site.url, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      
      // Wait for content to settle
      await page.waitForTimeout(2000);
      
      const data = await extractPageData(page);
      const scores = calculateScores(data);
      
      results.push({
        name: site.name,
        url: site.url,
        category: site.category,
        analyzedAt: new Date().toISOString(),
        scores,
        data,
      });
      
      console.log(`   ✓ Overall: ${scores.overall} | Typography: ${scores.typography} | Colors: ${scores.colors} | CTA: ${scores.cta}`);
      
      await page.close();
      
      // Rate limiting - be respectful
      await new Promise(r => setTimeout(r, 1000));
      
    } catch (error) {
      console.log(`   ✗ Error: ${(error as Error).message}`);
      errors.push({ url: site.url, error: (error as Error).message });
    }
  }
  
  await browser.close();
  
  // Generate summary statistics
  const summary = {
    generatedAt: new Date().toISOString(),
    totalSites: results.length,
    averageScores: {
      overall: Math.round(results.reduce((a, r) => a + r.scores.overall, 0) / results.length),
      typography: Math.round(results.reduce((a, r) => a + r.scores.typography, 0) / results.length),
      colors: Math.round(results.reduce((a, r) => a + r.scores.colors, 0) / results.length),
      cta: Math.round(results.reduce((a, r) => a + r.scores.cta, 0) / results.length),
      complexity: Math.round(results.reduce((a, r) => a + r.scores.complexity, 0) / results.length),
    },
    topPerformers: results
      .sort((a, b) => b.scores.overall - a.scores.overall)
      .slice(0, 10)
      .map(r => ({ name: r.name, score: r.scores.overall })),
    byCategory: {} as Record<string, number>,
  };
  
  // Calculate category averages
  const categories = [...new Set(results.map(r => r.category))];
  categories.forEach(cat => {
    const catResults = results.filter(r => r.category === cat);
    summary.byCategory[cat] = Math.round(
      catResults.reduce((a, r) => a + r.scores.overall, 0) / catResults.length
    );
  });
  
  // Save results
  const outputPath = path.join(__dirname, '../src/analyzer/benchmark-data.json');
  const output = {
    summary,
    sites: results,
    errors,
  };
  
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 BENCHMARK GENERATION COMPLETE');
  console.log('='.repeat(60));
  console.log(`\n✓ Analyzed: ${results.length} sites`);
  console.log(`✗ Errors: ${errors.length} sites`);
  console.log(`\n📈 Average Scores:`);
  console.log(`   Overall: ${summary.averageScores.overall}`);
  console.log(`   Typography: ${summary.averageScores.typography}`);
  console.log(`   Colors: ${summary.averageScores.colors}`);
  console.log(`   CTA: ${summary.averageScores.cta}`);
  console.log(`   Complexity: ${summary.averageScores.complexity}`);
  console.log(`\n🏆 Top Performers:`);
  summary.topPerformers.forEach((p, i) => {
    console.log(`   ${i + 1}. ${p.name}: ${p.score}`);
  });
  console.log(`\n💾 Saved to: ${outputPath}`);
}

// Run
generateBenchmarks().catch(console.error);

