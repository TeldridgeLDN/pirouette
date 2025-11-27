/**
 * Playwright Browser Utilities
 * Railway Analysis Worker
 */

import { chromium, Browser, Page, BrowserContext } from 'playwright';

export interface BrowserConfig {
  headless?: boolean;
  timeout?: number;
  viewport?: {
    width: number;
    height: number;
  };
}

export class PlaywrightBrowser {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private config: BrowserConfig;

  constructor(config: BrowserConfig = {}) {
    this.config = {
      headless: config.headless ?? true,
      timeout: config.timeout ?? 30000,
      viewport: config.viewport ?? { width: 1920, height: 1080 },
    };
  }

  /**
   * Launch browser instance
   */
  async launch(): Promise<void> {
    if (this.browser) {
      console.warn('Browser already launched');
      return;
    }

    console.log('[Browser] Launching Chromium...');
    this.browser = await chromium.launch({
      headless: this.config.headless,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
      ],
    });

    this.context = await this.browser.newContext({
      viewport: this.config.viewport,
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    });

    console.log('[Browser] Launched successfully');
  }

  /**
   * Create a new page
   */
  async newPage(): Promise<Page> {
    if (!this.context) {
      await this.launch();
    }

    const page = await this.context!.newPage();
    page.setDefaultTimeout(this.config.timeout!);
    
    return page;
  }

  /**
   * Navigate to URL with error handling
   */
  async navigateToUrl(page: Page, url: string): Promise<boolean> {
    try {
      console.log(`[Browser] Navigating to: ${url}`);
      
      const response = await page.goto(url, {
        waitUntil: 'networkidle',
        timeout: this.config.timeout,
      });

      if (!response || !response.ok()) {
        console.error(`[Browser] Failed to load ${url}: ${response?.status()}`);
        return false;
      }

      console.log(`[Browser] Successfully loaded ${url}`);
      return true;
    } catch (error) {
      console.error(`[Browser] Navigation error for ${url}:`, error);
      return false;
    }
  }

  /**
   * Capture full-page screenshot
   */
  async captureScreenshot(page: Page): Promise<Buffer> {
    console.log('[Browser] Capturing screenshot...');
    
    const screenshot = await page.screenshot({
      type: 'png',
      fullPage: true,
    });

    console.log(`[Browser] Screenshot captured: ${screenshot.length} bytes`);
    return screenshot;
  }

  /**
   * Extract computed styles for an element
   */
  async getComputedStyles(page: Page, selector: string): Promise<any> {
    return page.evaluate((sel) => {
      const element = document.querySelector(sel);
      if (!element) return null;

      const styles = window.getComputedStyle(element);
      return {
        color: styles.color,
        backgroundColor: styles.backgroundColor,
        fontSize: styles.fontSize,
        fontFamily: styles.fontFamily,
        fontWeight: styles.fontWeight,
        lineHeight: styles.lineHeight,
        padding: styles.padding,
        margin: styles.margin,
      };
    }, selector);
  }

  /**
   * Extract all colors used on the page
   */
  async extractColors(page: Page): Promise<string[]> {
    return page.evaluate(() => {
      const colors = new Set<string>();
      const elements = document.querySelectorAll('*');

      elements.forEach((el) => {
        const styles = window.getComputedStyle(el);
        const color = styles.color;
        const bgColor = styles.backgroundColor;

        if (color && color !== 'rgba(0, 0, 0, 0)') {
          colors.add(color);
        }
        if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)') {
          colors.add(bgColor);
        }
      });

      return Array.from(colors);
    });
  }

  /**
   * Extract typography information
   */
  async extractTypography(page: Page): Promise<any> {
    return page.evaluate(() => {
      const fonts = new Set<string>();
      const fontSizes = new Set<string>();
      const elements = document.querySelectorAll('*');

      elements.forEach((el) => {
        const styles = window.getComputedStyle(el);
        fonts.add(styles.fontFamily);
        fontSizes.add(styles.fontSize);
      });

      return {
        fontFamilies: Array.from(fonts),
        fontSizes: Array.from(fontSizes).sort(),
      };
    });
  }

  /**
   * Count elements on page
   */
  async countElements(page: Page): Promise<number> {
    return page.evaluate(() => {
      return document.querySelectorAll('*').length;
    });
  }

  /**
   * Find CTA elements
   */
  async findCTAs(page: Page): Promise<any[]> {
    return page.evaluate(() => {
      const ctaSelectors = [
        'button',
        'a[href*="signup"]',
        'a[href*="register"]',
        'a[href*="get-started"]',
        'a[href*="download"]',
        'a[href*="buy"]',
        'input[type="submit"]',
        '[role="button"]',
      ];

      const ctas: any[] = [];

      ctaSelectors.forEach((selector) => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((el) => {
          const rect = el.getBoundingClientRect();
          const styles = window.getComputedStyle(el);

          ctas.push({
            selector,
            text: el.textContent?.trim(),
            position: {
              x: rect.x,
              y: rect.y,
              width: rect.width,
              height: rect.height,
            },
            styles: {
              color: styles.color,
              backgroundColor: styles.backgroundColor,
              fontSize: styles.fontSize,
            },
          });
        });
      });

      return ctas;
    });
  }

  /**
   * Close browser and cleanup
   */
  async close(): Promise<void> {
    if (this.context) {
      await this.context.close();
      this.context = null;
    }

    if (this.browser) {
      console.log('[Browser] Closing browser...');
      await this.browser.close();
      this.browser = null;
      console.log('[Browser] Closed successfully');
    }
  }

  /**
   * Ensure browser is closed (for cleanup)
   */
  async cleanup(): Promise<void> {
    try {
      await this.close();
    } catch (error) {
      console.error('[Browser] Cleanup error:', error);
    }
  }
}

// Export convenience function
export async function withBrowser<T>(
  fn: (browser: PlaywrightBrowser) => Promise<T>,
  config?: BrowserConfig
): Promise<T> {
  const browser = new PlaywrightBrowser(config);
  
  try {
    await browser.launch();
    return await fn(browser);
  } finally {
    await browser.cleanup();
  }
}

export default PlaywrightBrowser;



