import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | Pirouette',
  description: 'Terms of Service for Pirouette - Design analysis and review platform.',
};

export default function TermsOfServicePage() {
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
          <h1 className="text-3xl font-bold text-slate-900">Terms of Service</h1>
          <p className="text-slate-500 mt-2">Last updated: 28 November 2024</p>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="prose prose-slate max-w-none">
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">1. Introduction</h2>
            <p className="text-slate-600 mb-4">
              Welcome to Pirouette (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;). These Terms of Service (&quot;Terms&quot;) govern your use of our website at pirouette.design and our design analysis services (collectively, the &quot;Service&quot;).
            </p>
            <p className="text-slate-600 mb-4">
              By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any part of these Terms, you may not access the Service.
            </p>
            <p className="text-slate-600">
              Pirouette is operated from the United Kingdom. These Terms are governed by English law.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">2. Description of Service</h2>
            <p className="text-slate-600 mb-4">
              Pirouette provides automated design analysis for landing pages and websites. Our Service:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
              <li>Analyses publicly accessible web pages you submit</li>
              <li>Provides scores and recommendations across design dimensions</li>
              <li>Compares your designs against patterns from award-winning sites</li>
              <li>Generates reports with actionable improvement suggestions</li>
            </ul>
            <p className="text-slate-600">
              The Service is provided &quot;as is&quot; and recommendations are advisory only. We do not guarantee any specific business outcomes from implementing our suggestions.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">3. User Accounts</h2>
            <h3 className="text-lg font-medium text-slate-800 mb-3">3.1 Account Creation</h3>
            <p className="text-slate-600 mb-4">
              You may use certain features of our Service without creating an account. To access full features, you must register for an account by providing accurate and complete information.
            </p>
            
            <h3 className="text-lg font-medium text-slate-800 mb-3">3.2 Account Security</h3>
            <p className="text-slate-600 mb-4">
              You are responsible for safeguarding your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorised access.
            </p>
            
            <h3 className="text-lg font-medium text-slate-800 mb-3">3.3 Age Requirement</h3>
            <p className="text-slate-600">
              You must be at least 18 years old to use this Service. By using the Service, you represent that you are at least 18 years of age.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">4. Acceptable Use</h2>
            <p className="text-slate-600 mb-4">You agree not to use the Service to:</p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
              <li>Analyse websites you do not own or have permission to analyse</li>
              <li>Submit URLs containing illegal, harmful, or offensive content</li>
              <li>Attempt to bypass rate limits or access restrictions</li>
              <li>Reverse engineer, decompile, or disassemble the Service</li>
              <li>Use automated systems to access the Service beyond normal use</li>
              <li>Interfere with or disrupt the Service or servers</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe upon the rights of others</li>
            </ul>
            <p className="text-slate-600">
              We reserve the right to suspend or terminate accounts that violate these terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">5. Subscriptions and Payments</h2>
            <h3 className="text-lg font-medium text-slate-800 mb-3">5.1 Free Tier</h3>
            <p className="text-slate-600 mb-4">
              Free accounts are limited to one analysis per week. Anonymous users (without accounts) are limited to one analysis per day.
            </p>
            
            <h3 className="text-lg font-medium text-slate-800 mb-3">5.2 Paid Subscriptions</h3>
            <p className="text-slate-600 mb-4">
              Paid subscriptions are billed in advance on a monthly or annual basis. Prices are in GBP and include VAT where applicable.
            </p>
            
            <h3 className="text-lg font-medium text-slate-800 mb-3">5.3 Free Trial</h3>
            <p className="text-slate-600 mb-4">
              New paid subscriptions include a 7-day free trial. You may cancel during the trial period without charge.
            </p>
            
            <h3 className="text-lg font-medium text-slate-800 mb-3">5.4 Cancellation</h3>
            <p className="text-slate-600 mb-4">
              You may cancel your subscription at any time through your account settings. Cancellation takes effect at the end of your current billing period. We do not provide refunds for partial billing periods.
            </p>
            
            <h3 className="text-lg font-medium text-slate-800 mb-3">5.5 Price Changes</h3>
            <p className="text-slate-600">
              We may change subscription prices with 30 days&apos; notice. Price changes will not affect your current billing period.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">6. Intellectual Property</h2>
            <h3 className="text-lg font-medium text-slate-800 mb-3">6.1 Our Content</h3>
            <p className="text-slate-600 mb-4">
              The Service, including its design, features, analysis algorithms, and content, is owned by Pirouette and protected by copyright, trademark, and other intellectual property laws.
            </p>
            
            <h3 className="text-lg font-medium text-slate-800 mb-3">6.2 Your Content</h3>
            <p className="text-slate-600 mb-4">
              You retain ownership of the URLs you submit and any websites you own. By submitting a URL for analysis, you grant us a limited licence to access and analyse that page solely for providing the Service.
            </p>
            
            <h3 className="text-lg font-medium text-slate-800 mb-3">6.3 Analysis Reports</h3>
            <p className="text-slate-600">
              Analysis reports generated by the Service are for your personal or business use. You may share reports internally or with clients, but may not resell or redistribute them commercially.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">7. Disclaimer of Warranties</h2>
            <p className="text-slate-600 mb-4">
              THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED.
            </p>
            <p className="text-slate-600 mb-4">
              We do not warrant that:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
              <li>The Service will be uninterrupted or error-free</li>
              <li>Analysis results will be accurate or complete</li>
              <li>Implementing recommendations will improve your conversion rates</li>
              <li>Revenue estimates in reports will reflect actual results</li>
            </ul>
            <p className="text-slate-600">
              Design analysis involves subjective elements. Our recommendations are based on patterns from successful sites but do not guarantee success for any particular use case.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">8. Limitation of Liability</h2>
            <p className="text-slate-600 mb-4">
              To the fullest extent permitted by law, Pirouette shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or business opportunities.
            </p>
            <p className="text-slate-600 mb-4">
              Our total liability for any claims arising from your use of the Service shall not exceed the amount you paid us in the 12 months preceding the claim.
            </p>
            <p className="text-slate-600">
              Nothing in these Terms excludes our liability for death or personal injury caused by negligence, fraud, or any other liability that cannot be excluded by law.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">9. Indemnification</h2>
            <p className="text-slate-600">
              You agree to indemnify and hold harmless Pirouette and its officers, directors, employees, and agents from any claims, damages, losses, or expenses (including legal fees) arising from your use of the Service or violation of these Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">10. Termination</h2>
            <p className="text-slate-600 mb-4">
              We may terminate or suspend your account and access to the Service immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties.
            </p>
            <p className="text-slate-600">
              Upon termination, your right to use the Service will cease immediately. Provisions that by their nature should survive termination shall survive, including ownership provisions, warranty disclaimers, and limitations of liability.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">11. Changes to Terms</h2>
            <p className="text-slate-600 mb-4">
              We reserve the right to modify these Terms at any time. We will notify you of material changes by posting the updated Terms on our website and updating the &quot;Last updated&quot; date.
            </p>
            <p className="text-slate-600">
              Your continued use of the Service after changes are posted constitutes acceptance of the modified Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">12. Governing Law and Disputes</h2>
            <p className="text-slate-600 mb-4">
              These Terms shall be governed by and construed in accordance with the laws of England and Wales, without regard to its conflict of law provisions.
            </p>
            <p className="text-slate-600 mb-4">
              Any disputes arising from these Terms or your use of the Service shall be subject to the exclusive jurisdiction of the courts of England and Wales.
            </p>
            <p className="text-slate-600">
              If you are a consumer, you may also have rights under the Consumer Rights Act 2015 that cannot be excluded by these Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">13. Contact Information</h2>
            <p className="text-slate-600 mb-4">
              If you have any questions about these Terms, please contact us at:
            </p>
            <div className="bg-slate-100 p-4 rounded-lg">
              <p className="text-slate-700">
                <strong>Email:</strong> legal@pirouette.design<br />
                <strong>Address:</strong> United Kingdom
              </p>
            </div>
          </section>

        </div>

        {/* Footer Links */}
        <div className="mt-12 pt-8 border-t border-slate-200 flex flex-wrap gap-6 text-sm">
          <Link href="/privacy" className="text-indigo-600 hover:text-indigo-700">Privacy Policy</Link>
          <Link href="/ethics" className="text-indigo-600 hover:text-indigo-700">Crawler Ethics</Link>
          <Link href="/" className="text-indigo-600 hover:text-indigo-700">Back to Home</Link>
        </div>
      </div>
    </main>
  );
}


