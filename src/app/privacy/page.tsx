import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Pirouette',
  description: 'Privacy Policy for Pirouette - How we collect, use, and protect your data.',
};

export default function PrivacyPolicyPage() {
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
          <h1 className="text-3xl font-bold text-slate-900">Privacy Policy</h1>
          <p className="text-slate-500 mt-2">Last updated: 28 November 2024</p>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="prose prose-slate max-w-none">
          
          {/* Summary Box */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-indigo-900 mt-0 mb-3">Privacy at a Glance</h2>
            <ul className="text-indigo-800 space-y-2 mb-0 text-sm">
              <li>✓ We only collect data necessary to provide the service</li>
              <li>✓ We don&apos;t sell your data to third parties</li>
              <li>✓ We use privacy-respecting analytics (no cookies required)</li>
              <li>✓ You can request deletion of your data at any time</li>
              <li>✓ We comply with UK GDPR and Data Protection Act 2018</li>
            </ul>
          </div>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">1. Who We Are</h2>
            <p className="text-slate-600 mb-4">
              Pirouette (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) is a design analysis service operated from the United Kingdom. We are the data controller for the personal data we collect through our website and services.
            </p>
            <div className="bg-slate-100 p-4 rounded-lg">
              <p className="text-slate-700 mb-0">
                <strong>Contact:</strong> privacy@pirouette.design<br />
                <strong>Location:</strong> United Kingdom
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">2. Data We Collect</h2>
            
            <h3 className="text-lg font-medium text-slate-800 mb-3">2.1 Account Information</h3>
            <p className="text-slate-600 mb-4">When you create an account, we collect:</p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
              <li><strong>Email address</strong> - For account access and communications</li>
              <li><strong>Name</strong> - If provided during registration</li>
              <li><strong>Authentication data</strong> - Managed securely by our authentication provider (Clerk)</li>
            </ul>

            <h3 className="text-lg font-medium text-slate-800 mb-3">2.2 Analysis Data</h3>
            <p className="text-slate-600 mb-4">When you submit a URL for analysis, we collect:</p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
              <li><strong>URL submitted</strong> - The web address you want analysed</li>
              <li><strong>Screenshot</strong> - A visual capture of the page at time of analysis</li>
              <li><strong>Analysis results</strong> - Scores, metrics, and recommendations generated</li>
              <li><strong>Optional traffic data</strong> - If you provide weekly visitor estimates</li>
            </ul>

            <h3 className="text-lg font-medium text-slate-800 mb-3">2.3 Usage Information</h3>
            <p className="text-slate-600 mb-4">We automatically collect:</p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
              <li><strong>IP address</strong> - For rate limiting and security (anonymised for analytics)</li>
              <li><strong>Device type and browser</strong> - To ensure compatibility</li>
              <li><strong>Pages visited</strong> - To understand how you use our service</li>
              <li><strong>Timestamps</strong> - When you access our service</li>
            </ul>

            <h3 className="text-lg font-medium text-slate-800 mb-3">2.4 Payment Information</h3>
            <p className="text-slate-600">
              Payment processing is handled by Stripe. We do not store your full card details. Stripe&apos;s privacy policy applies to payment data: <a href="https://stripe.com/privacy" className="text-indigo-600 hover:text-indigo-700" target="_blank" rel="noopener noreferrer">stripe.com/privacy</a>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">3. Legal Basis for Processing</h2>
            <p className="text-slate-600 mb-4">Under UK GDPR, we process your data on the following legal bases:</p>
            
            <div className="overflow-x-auto">
              <table className="min-w-full border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Purpose</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Legal Basis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="px-4 py-3 text-sm text-slate-600">Providing the analysis service</td>
                    <td className="px-4 py-3 text-sm text-slate-600">Contract performance</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-slate-600">Processing payments</td>
                    <td className="px-4 py-3 text-sm text-slate-600">Contract performance</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-slate-600">Rate limiting and security</td>
                    <td className="px-4 py-3 text-sm text-slate-600">Legitimate interests</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-slate-600">Service improvement</td>
                    <td className="px-4 py-3 text-sm text-slate-600">Legitimate interests</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-slate-600">Marketing communications</td>
                    <td className="px-4 py-3 text-sm text-slate-600">Consent (opt-in)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">4. How We Use Your Data</h2>
            <p className="text-slate-600 mb-4">We use your personal data to:</p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2">
              <li>Provide and maintain our design analysis service</li>
              <li>Process your subscription and payments</li>
              <li>Send you service-related notifications (e.g., analysis complete)</li>
              <li>Respond to your enquiries and support requests</li>
              <li>Improve our analysis algorithms and service quality</li>
              <li>Detect and prevent fraud, abuse, and security issues</li>
              <li>Comply with legal obligations</li>
              <li>Send marketing communications (only with your consent)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">5. Data Sharing</h2>
            <p className="text-slate-600 mb-4">
              We do not sell your personal data. We may share data with:
            </p>
            
            <h3 className="text-lg font-medium text-slate-800 mb-3">5.1 Service Providers</h3>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
              <li><strong>Clerk</strong> - Authentication services (USA, Privacy Shield compliant)</li>
              <li><strong>Supabase</strong> - Database hosting (EU region)</li>
              <li><strong>Stripe</strong> - Payment processing (USA, Privacy Shield compliant)</li>
              <li><strong>Railway</strong> - Application hosting (USA)</li>
              <li><strong>Vercel</strong> - Website hosting (USA, Privacy Shield compliant)</li>
            </ul>
            
            <h3 className="text-lg font-medium text-slate-800 mb-3">5.2 Legal Requirements</h3>
            <p className="text-slate-600">
              We may disclose your data if required by law, court order, or government request, or to protect our rights, property, or safety.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">6. International Transfers</h2>
            <p className="text-slate-600 mb-4">
              Some of our service providers are located outside the UK. When we transfer data internationally, we ensure appropriate safeguards are in place:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2">
              <li>UK adequacy decisions</li>
              <li>Standard Contractual Clauses (SCCs)</li>
              <li>Privacy Shield certification (where applicable)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">7. Data Retention</h2>
            <p className="text-slate-600 mb-4">We retain your data for as long as necessary to provide our services:</p>
            
            <div className="overflow-x-auto">
              <table className="min-w-full border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Data Type</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Retention Period</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="px-4 py-3 text-sm text-slate-600">Account data</td>
                    <td className="px-4 py-3 text-sm text-slate-600">Until account deletion + 30 days</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-slate-600">Analysis reports</td>
                    <td className="px-4 py-3 text-sm text-slate-600">12 months (or until account deletion)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-slate-600">Screenshots</td>
                    <td className="px-4 py-3 text-sm text-slate-600">90 days</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-slate-600">Anonymous analysis data</td>
                    <td className="px-4 py-3 text-sm text-slate-600">24 hours (IP data), 7 days (analysis)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-slate-600">Payment records</td>
                    <td className="px-4 py-3 text-sm text-slate-600">7 years (legal requirement)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">8. Your Rights</h2>
            <p className="text-slate-600 mb-4">
              Under UK GDPR, you have the following rights regarding your personal data:
            </p>
            
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-medium text-slate-800">Right of Access</h4>
                <p className="text-slate-600 text-sm mt-1">Request a copy of your personal data we hold.</p>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-medium text-slate-800">Right to Rectification</h4>
                <p className="text-slate-600 text-sm mt-1">Request correction of inaccurate personal data.</p>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-medium text-slate-800">Right to Erasure (&quot;Right to be Forgotten&quot;)</h4>
                <p className="text-slate-600 text-sm mt-1">Request deletion of your personal data in certain circumstances.</p>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-medium text-slate-800">Right to Restrict Processing</h4>
                <p className="text-slate-600 text-sm mt-1">Request limitation of how we use your data.</p>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-medium text-slate-800">Right to Data Portability</h4>
                <p className="text-slate-600 text-sm mt-1">Receive your data in a machine-readable format.</p>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-medium text-slate-800">Right to Object</h4>
                <p className="text-slate-600 text-sm mt-1">Object to processing based on legitimate interests or for marketing.</p>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-medium text-slate-800">Right to Withdraw Consent</h4>
                <p className="text-slate-600 text-sm mt-1">Withdraw consent for processing where consent is the legal basis.</p>
              </div>
            </div>
            
            <p className="text-slate-600 mt-4">
              To exercise these rights, contact us at <a href="mailto:privacy@pirouette.design" className="text-indigo-600 hover:text-indigo-700">privacy@pirouette.design</a>. We will respond within one month.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">9. Cookies and Tracking</h2>
            <p className="text-slate-600 mb-4">
              We aim to minimise cookie usage:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
              <li><strong>Essential cookies</strong> - Required for authentication and security</li>
              <li><strong>No advertising cookies</strong> - We don&apos;t use third-party advertising</li>
              <li><strong>Privacy-respecting analytics</strong> - We use cookieless analytics where possible</li>
            </ul>
            <p className="text-slate-600">
              You can control cookies through your browser settings. Blocking essential cookies may affect service functionality.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">10. Security</h2>
            <p className="text-slate-600 mb-4">
              We implement appropriate technical and organisational measures to protect your data:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2">
              <li>Encryption in transit (TLS/HTTPS)</li>
              <li>Encryption at rest for sensitive data</li>
              <li>Access controls and authentication</li>
              <li>Regular security reviews</li>
              <li>Secure development practices</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">11. Children&apos;s Privacy</h2>
            <p className="text-slate-600">
              Our Service is not intended for individuals under 18 years of age. We do not knowingly collect personal data from children. If you believe we have collected data from a child, please contact us immediately.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">12. Changes to This Policy</h2>
            <p className="text-slate-600">
              We may update this Privacy Policy from time to time. We will notify you of significant changes by posting a notice on our website or sending an email. The &quot;Last updated&quot; date at the top indicates when the policy was last revised.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">13. Complaints</h2>
            <p className="text-slate-600 mb-4">
              If you have concerns about how we handle your data, please contact us first at <a href="mailto:privacy@pirouette.design" className="text-indigo-600 hover:text-indigo-700">privacy@pirouette.design</a>.
            </p>
            <p className="text-slate-600">
              You also have the right to lodge a complaint with the Information Commissioner&apos;s Office (ICO), the UK supervisory authority for data protection:
            </p>
            <div className="bg-slate-100 p-4 rounded-lg mt-4">
              <p className="text-slate-700 mb-0">
                <strong>Information Commissioner&apos;s Office</strong><br />
                Website: <a href="https://ico.org.uk" className="text-indigo-600 hover:text-indigo-700" target="_blank" rel="noopener noreferrer">ico.org.uk</a><br />
                Helpline: 0303 123 1113
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">14. Contact Us</h2>
            <p className="text-slate-600 mb-4">
              For any questions about this Privacy Policy or our data practices:
            </p>
            <div className="bg-slate-100 p-4 rounded-lg">
              <p className="text-slate-700 mb-0">
                <strong>General:</strong> <a href="mailto:hello@pirouette.design" className="text-indigo-600 hover:text-indigo-700">hello@pirouette.design</a><br />
                <strong>Privacy:</strong> <a href="mailto:privacy@pirouette.design" className="text-indigo-600 hover:text-indigo-700">privacy@pirouette.design</a><br />
                <strong>Location:</strong> United Kingdom
              </p>
            </div>
          </section>

        </div>

        {/* Footer Links */}
        <div className="mt-12 pt-8 border-t border-slate-200 flex flex-wrap gap-6 text-sm">
          <Link href="/terms" className="text-indigo-600 hover:text-indigo-700">Terms of Service</Link>
          <Link href="/ethics" className="text-indigo-600 hover:text-indigo-700">Crawler Ethics</Link>
          <Link href="/" className="text-indigo-600 hover:text-indigo-700">Back to Home</Link>
        </div>
      </div>
    </main>
  );
}




