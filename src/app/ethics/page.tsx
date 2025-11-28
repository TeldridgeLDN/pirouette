import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Crawler Ethics Policy | Pirouette',
  description: 'How Pirouette respectfully analyses websites - our crawler ethics and responsible web crawling practices.',
};

export default function CrawlerEthicsPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors mb-4">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Home</span>
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">Crawler Ethics Policy</h1>
          <p className="text-slate-500 mt-2">How we respectfully analyse websites</p>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="prose prose-slate max-w-none">
          
          {/* Introduction */}
          <section className="mb-8">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-emerald-900 mt-0 mb-3">Our Commitment</h2>
              <p className="text-emerald-800 mb-0">
                Pirouette is committed to responsible web crawling. We analyse websites to help owners improve their designs, and we do so with respect for server resources, privacy, and the web ecosystem.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">1. What We Do</h2>
            <p className="text-slate-600 mb-4">
              When you submit a URL to Pirouette, our system:
            </p>
            <ol className="list-decimal pl-6 text-slate-600 space-y-2">
              <li>Visits the URL once using a headless browser (like a regular visitor)</li>
              <li>Waits for the page to fully load</li>
              <li>Captures a screenshot of the visible content</li>
              <li>Extracts design-related data (colours, fonts, layout)</li>
              <li>Analyses the data against our design patterns</li>
              <li>Generates recommendations for improvement</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">2. What We Don&apos;t Do</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <span className="text-red-500 font-bold">✕</span>
                <div>
                  <p className="text-red-800 font-medium mb-1">Mass Crawling</p>
                  <p className="text-red-700 text-sm">We only analyse URLs explicitly submitted by users. We don&apos;t crawl the web indiscriminately.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <span className="text-red-500 font-bold">✕</span>
                <div>
                  <p className="text-red-800 font-medium mb-1">Follow Links</p>
                  <p className="text-red-700 text-sm">We analyse only the submitted page. We don&apos;t follow links to other pages.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <span className="text-red-500 font-bold">✕</span>
                <div>
                  <p className="text-red-800 font-medium mb-1">Store Page Content</p>
                  <p className="text-red-700 text-sm">We don&apos;t store the full HTML or content of your pages. We extract only design metrics.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <span className="text-red-500 font-bold">✕</span>
                <div>
                  <p className="text-red-800 font-medium mb-1">Access Private Areas</p>
                  <p className="text-red-700 text-sm">We only access publicly visible content. We don&apos;t attempt to log in or access authenticated areas.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <span className="text-red-500 font-bold">✕</span>
                <div>
                  <p className="text-red-800 font-medium mb-1">Ignore robots.txt</p>
                  <p className="text-red-700 text-sm">We respect robots.txt directives when they disallow our crawler.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <span className="text-red-500 font-bold">✕</span>
                <div>
                  <p className="text-red-800 font-medium mb-1">Overload Servers</p>
                  <p className="text-red-700 text-sm">We make a single request per analysis with reasonable timeouts.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">3. Rate Limiting & Server Respect</h2>
            <p className="text-slate-600 mb-4">
              We implement strict rate limiting to prevent abuse:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2">
              <li><strong>One request per analysis</strong> - We don&apos;t make multiple requests for a single URL</li>
              <li><strong>User rate limits</strong> - Free users can analyse 1 site per day/week, preventing spam</li>
              <li><strong>30-second timeout</strong> - We don&apos;t wait indefinitely for slow pages</li>
              <li><strong>Queue system</strong> - Analyses are queued to prevent server overload</li>
              <li><strong>No retry flooding</strong> - Failed requests aren&apos;t immediately retried</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">4. User Agent Identification</h2>
            <p className="text-slate-600 mb-4">
              Our crawler identifies itself honestly:
            </p>
            <div className="bg-slate-800 text-slate-200 p-4 rounded-lg font-mono text-sm overflow-x-auto">
              <code>
                Mozilla/5.0 (compatible; PirouetteBot/1.0; +https://pirouette.design/ethics)
              </code>
            </div>
            <p className="text-slate-600 mt-4">
              This allows website owners to identify our requests in their logs and block us if desired.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">5. Robots.txt Compliance</h2>
            <p className="text-slate-600 mb-4">
              We respect robots.txt directives. To block Pirouette from analysing your site, add to your robots.txt:
            </p>
            <div className="bg-slate-800 text-slate-200 p-4 rounded-lg font-mono text-sm overflow-x-auto mb-4">
              <code>
                User-agent: PirouetteBot<br />
                Disallow: /
              </code>
            </div>
            <p className="text-slate-600">
              Note: Since analyses are user-initiated (typically by website owners themselves), most users will be analysing their own sites. We honour robots.txt to prevent unwanted analysis of third-party sites.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">6. Data We Extract</h2>
            <p className="text-slate-600 mb-4">
              For design analysis, we extract only:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-medium text-slate-800 mb-2">Visual Data</h4>
                <ul className="text-slate-600 text-sm space-y-1">
                  <li>• Colour palette used</li>
                  <li>• Typography (fonts, sizes)</li>
                  <li>• Layout structure</li>
                  <li>• Whitespace distribution</li>
                  <li>• Element counts</li>
                </ul>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-medium text-slate-800 mb-2">UI Elements</h4>
                <ul className="text-slate-600 text-sm space-y-1">
                  <li>• Button styles</li>
                  <li>• CTA characteristics</li>
                  <li>• Navigation patterns</li>
                  <li>• Form designs</li>
                  <li>• Visual hierarchy</li>
                </ul>
              </div>
            </div>
            
            <p className="text-slate-600 mt-4">
              We do <strong>not</strong> extract personal data, form submissions, user information, or proprietary content.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">7. Screenshot Storage</h2>
            <p className="text-slate-600 mb-4">
              Screenshots are stored temporarily for reference in analysis reports:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2">
              <li>Screenshots are stored for <strong>90 days maximum</strong></li>
              <li>Only the submitting user can view their screenshots</li>
              <li>Screenshots are deleted when accounts are deleted</li>
              <li>Screenshots are stored securely with access controls</li>
              <li>We don&apos;t use screenshots for training AI models</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">8. Blocked URLs</h2>
            <p className="text-slate-600 mb-4">
              We automatically block analysis of:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2">
              <li>Localhost and internal IP addresses</li>
              <li>Government and military domains (unless submitted by owners)</li>
              <li>Sites that have requested exclusion</li>
              <li>URLs in known malware/phishing lists</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">9. Opt-Out Requests</h2>
            <p className="text-slate-600 mb-4">
              If you want to prevent Pirouette from analysing your website:
            </p>
            <ol className="list-decimal pl-6 text-slate-600 space-y-2">
              <li>Add the robots.txt directive shown above</li>
              <li>Or email us at <a href="mailto:ethics@pirouette.design" className="text-indigo-600 hover:text-indigo-700">ethics@pirouette.design</a> with your domain</li>
            </ol>
            <p className="text-slate-600 mt-4">
              We maintain a blocklist of domains that have requested exclusion and will honour all legitimate requests within 48 hours.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">10. DMCA & Copyright</h2>
            <p className="text-slate-600 mb-4">
              If you believe our analysis infringes your copyright:
            </p>
            <ol className="list-decimal pl-6 text-slate-600 space-y-2 mb-4">
              <li>Identify the copyrighted work you believe is infringed</li>
              <li>Identify the specific content on our service</li>
              <li>Provide your contact information</li>
              <li>Include a statement of good faith belief</li>
              <li>Sign under penalty of perjury</li>
            </ol>
            <p className="text-slate-600">
              Send DMCA notices to: <a href="mailto:legal@pirouette.design" className="text-indigo-600 hover:text-indigo-700">legal@pirouette.design</a>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">11. Responsible Disclosure</h2>
            <p className="text-slate-600 mb-4">
              If you discover a security vulnerability in our crawler or service:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2">
              <li>Email us at <a href="mailto:security@pirouette.design" className="text-indigo-600 hover:text-indigo-700">security@pirouette.design</a></li>
              <li>Provide details of the vulnerability</li>
              <li>Allow us reasonable time to address the issue</li>
              <li>Do not publicly disclose before we&apos;ve addressed it</li>
            </ul>
            <p className="text-slate-600 mt-4">
              We appreciate responsible disclosure and will acknowledge security researchers who help us improve.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">12. Contact</h2>
            <p className="text-slate-600 mb-4">
              For questions about our crawling practices or this policy:
            </p>
            <div className="bg-slate-100 p-4 rounded-lg">
              <p className="text-slate-700 mb-0">
                <strong>Email:</strong> ethics@pirouette.design<br />
                <strong>Opt-out requests:</strong> ethics@pirouette.design<br />
                <strong>Security issues:</strong> security@pirouette.design
              </p>
            </div>
          </section>

        </div>

        {/* Footer Links */}
        <div className="mt-12 pt-8 border-t border-slate-200 flex flex-wrap gap-6 text-sm">
          <Link href="/terms" className="text-indigo-600 hover:text-indigo-700">Terms of Service</Link>
          <Link href="/privacy" className="text-indigo-600 hover:text-indigo-700">Privacy Policy</Link>
          <Link href="/" className="text-indigo-600 hover:text-indigo-700">Back to Home</Link>
        </div>
      </div>
    </main>
  );
}

