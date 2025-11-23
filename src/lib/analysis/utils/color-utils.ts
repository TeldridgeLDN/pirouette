/**
 * Color Utility Functions
 * Extracted and adapted from visual-design-analyzer.mjs
 */

import type { RGB, HSL, ColorInfo } from '../core/types';

// ============================================================================
// Color Conversion Functions
// ============================================================================

/**
 * Convert hex color to RGB
 */
export function hexToRgb(hex: string): RGB | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Convert RGB to hex
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((x) => {
    const hex = Math.round(x).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

/**
 * Convert RGB to HSL
 */
export function rgbToHsl(r: number, g: number, b: number): HSL {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Convert HSL to RGB
 */
export function hslToRgb(h: number, s: number, l: number): RGB {
  h /= 360;
  s /= 100;
  l /= 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

// ============================================================================
// Contrast Calculation (WCAG)
// ============================================================================

/**
 * Calculate relative luminance of an RGB color
 * https://www.w3.org/TR/WCAG20/#relativeluminancedef
 */
export function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate WCAG contrast ratio between two colors
 * https://www.w3.org/TR/WCAG20/#contrast-ratiodef
 */
export function getContrastRatio(
  color1: RGB | string,
  color2: RGB | string
): number {
  const rgb1 = typeof color1 === 'string' ? hexToRgb(color1) : color1;
  const rgb2 = typeof color2 === 'string' ? hexToRgb(color2) : color2;

  if (!rgb1 || !rgb2) return 0;

  const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast ratio passes WCAG standards
 */
export function checkWCAGContrast(ratio: number, level: 'AA' | 'AAA', isLargeText: boolean = false) {
  const thresholds = {
    AA: { normal: 4.5, large: 3.0 },
    AAA: { normal: 7.0, large: 4.5 },
  };

  const threshold = isLargeText ? thresholds[level].large : thresholds[level].normal;
  return ratio >= threshold;
}

// ============================================================================
// Color Distance & Similarity
// ============================================================================

/**
 * Calculate Euclidean distance between two RGB colors
 */
export function colorDistance(rgb1: RGB, rgb2: RGB): number {
  const rDiff = rgb1.r - rgb2.r;
  const gDiff = rgb1.g - rgb2.g;
  const bDiff = rgb1.b - rgb2.b;

  return Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff);
}

/**
 * Calculate perceptual color distance (Delta E CIE76)
 * More accurate than Euclidean distance for human perception
 */
export function perceptualColorDistance(rgb1: RGB, rgb2: RGB): number {
  // Convert to LAB color space for more perceptual accuracy
  // Simplified version using RGB distance weighted by perception
  const rMean = (rgb1.r + rgb2.r) / 2;
  const r = rgb1.r - rgb2.r;
  const g = rgb1.g - rgb2.g;
  const b = rgb1.b - rgb2.b;

  return Math.sqrt(
    (2 + rMean / 256) * r * r +
    4 * g * g +
    (2 + (255 - rMean) / 256) * b * b
  );
}

/**
 * Check if two colors are similar (within threshold)
 */
export function areColorsSimilar(
  color1: RGB | string,
  color2: RGB | string,
  threshold: number = 30
): boolean {
  const rgb1 = typeof color1 === 'string' ? hexToRgb(color1) : color1;
  const rgb2 = typeof color2 === 'string' ? hexToRgb(color2) : color2;

  if (!rgb1 || !rgb2) return false;

  return colorDistance(rgb1, rgb2) < threshold;
}

// ============================================================================
// Color Adjustments
// ============================================================================

/**
 * Lighten a color by a percentage
 */
export function lightenColor(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  hsl.l = Math.min(100, hsl.l + percent);

  const newRgb = hslToRgb(hsl.h, hsl.s, hsl.l);
  return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
}

/**
 * Darken a color by a percentage
 */
export function darkenColor(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  hsl.l = Math.max(0, hsl.l - percent);

  const newRgb = hslToRgb(hsl.h, hsl.s, hsl.l);
  return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
}

/**
 * Adjust color to meet WCAG contrast ratio
 */
export function adjustColorForContrast(
  foreground: string,
  background: string,
  targetRatio: number = 4.5
): string {
  let adjusted = foreground;
  let currentRatio = getContrastRatio(adjusted, background);

  // Try darkening first
  let percent = 5;
  while (currentRatio < targetRatio && percent <= 100) {
    adjusted = darkenColor(foreground, percent);
    currentRatio = getContrastRatio(adjusted, background);
    if (currentRatio >= targetRatio) return adjusted;
    percent += 5;
  }

  // If darkening didn't work, try lightening
  adjusted = foreground;
  percent = 5;
  while (currentRatio < targetRatio && percent <= 100) {
    adjusted = lightenColor(foreground, percent);
    currentRatio = getContrastRatio(adjusted, background);
    if (currentRatio >= targetRatio) return adjusted;
    percent += 5;
  }

  // If still not meeting ratio, return black or white based on background
  const bgRgb = hexToRgb(background);
  if (!bgRgb) return foreground;
  
  const bgLuminance = getLuminance(bgRgb.r, bgRgb.g, bgRgb.b);
  return bgLuminance > 0.5 ? '#000000' : '#FFFFFF';
}

// ============================================================================
// Color Palette Analysis
// ============================================================================

/**
 * Extract dominant color from a palette
 */
export function getDominantColor(palette: string[]): string {
  if (palette.length === 0) return '#000000';
  if (palette.length === 1) return palette[0];

  // For now, return first color
  // TODO: Implement proper color frequency analysis
  return palette[0];
}

/**
 * Get color temperature (warm/cool)
 */
export function getColorTemperature(hex: string): 'warm' | 'cool' | 'neutral' {
  const rgb = hexToRgb(hex);
  if (!rgb) return 'neutral';

  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  
  // Warm: red, orange, yellow (0-60°)
  // Cool: blue, green (180-300°)
  // Neutral: everything else
  if (hsl.h >= 0 && hsl.h <= 60) return 'warm';
  if (hsl.h >= 180 && hsl.h <= 300) return 'cool';
  return 'neutral';
}

/**
 * Check if color is neutral (gray, black, white)
 */
export function isNeutralColor(hex: string): boolean {
  const rgb = hexToRgb(hex);
  if (!rgb) return false;

  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  return hsl.s < 10; // Low saturation = neutral
}

// ============================================================================
// Exports
// ============================================================================

export default {
  // Conversions
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  hslToRgb,
  
  // Contrast
  getLuminance,
  getContrastRatio,
  checkWCAGContrast,
  
  // Distance & Similarity
  colorDistance,
  perceptualColorDistance,
  areColorsSimilar,
  
  // Adjustments
  lightenColor,
  darkenColor,
  adjustColorForContrast,
  
  // Analysis
  getDominantColor,
  getColorTemperature,
  isNeutralColor,
};


