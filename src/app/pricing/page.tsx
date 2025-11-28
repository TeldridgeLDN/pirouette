'use client';

import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';

// ============================================================================
// PRICING PAGE
// Dedicated page for SEO, upgrade prompts, and detailed plan comparison
// ============================================================================

export default function PricingPage() {
  const { user, isLoaded } = useUser();
  const [currentPlan, setCurrentPlan] = useState<string>('free');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  // Fetch user's current plan if logged in
  useEffect(() => {
    if (user) {
      fetch('/api/user/plan')
        .then(res => res.json())
        .then(data => setCurrentPlan(data.plan || 'free'))
        .catch(() => setCurrentPlan('free'));
    }
  }, [user]);

  return (
    <main className="min-h-screen bg-slate-50">
      <Navigation />
      
      {/* Hero Section */}
      <PricingHero billingCycle={billingCycle} setBillingCycle={setBillingCycle} />
      
      {/* Pricing Cards */}
      <PricingCards 
        currentPlan={currentPlan} 
        isLoggedIn={!!user} 
        isLoaded={isLoaded}
        billingCycle={billingCycle}
      />
      
      {/* Feature Comparison Table */}
      <FeatureComparisonTable />
      
      {/* FAQ Section */}
      <FAQSection />
      
      {/* Trust Indicators */}
      <TrustIndicators />
      
      {/* Final CTA */}
      <FinalCTA isLoggedIn={!!user} />
      
      {/* Footer */}
      <Footer />
    </main>
  );
}

// ============================================================================
// HERO SECTION
// ============================================================================

function PricingHero({ 
  billingCycle, 
  setBillingCycle 
}: { 
  billingCycle: 'monthly' | 'annual';
  setBillingCycle: (cycle: 'monthly' | 'annual') => void;
}) {
  return (
    <section className="pt-32 pb-8 md:pt-40 md:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 mb-6">
          <span className="text-sm font-medium text-indigo-700">Simple, transparent pricing</span>
        </div>
        
        {/* Headline */}
        <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 mb-4">
          Choose Your Plan
        </h1>
        
        {/* Subheadline */}
        <p className="text-lg sm:text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
          Start free, upgrade when you need more. Design audits cost £500-5,000 — 
          we're 96% cheaper with better data.
        </p>
        
        {/* Billing Toggle */}
        <div className="inline-flex items-center gap-4 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
              billingCycle === 'monthly'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('annual')}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
              billingCycle === 'annual'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Annual
            <span className="ml-2 text-xs text-emerald-600 font-semibold">Save 17%</span>
          </button>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// PRICING CARDS
// ============================================================================

function PricingCards({ 
  currentPlan, 
  isLoggedIn, 
  isLoaded,
  billingCycle 
}: { 
  currentPlan: string;
  isLoggedIn: boolean;
  isLoaded: boolean;
  billingCycle: 'monthly' | 'annual';
}) {
  const plans = [
    {
      id: 'free',
      name: 'Free',
      monthlyPrice: 0,
      annualPrice: 0,
      description: 'Perfect for trying out Pirouette',
      features: [
        { text: '1 analysis per week', included: true },
        { text: '7 dimension scores', included: true },
        { text: 'Top 3 recommendations', included: true },
        { text: 'Reports saved 30 days', included: true },
        { text: 'Revenue impact estimates', included: true },
        { text: 'Historical tracking', included: false },
        { text: 'Competitor comparison', included: false },
        { text: 'Export as PDF', included: false },
      ],
      cta: isLoggedIn ? 'Current Plan' : 'Get Started Free',
      ctaDisabled: isLoggedIn && currentPlan === 'free',
      href: '/sign-up',
      popular: false,
      badge: null,
    },
    {
      id: 'pro_29',
      name: 'Pro',
      monthlyPrice: 29,
      annualPrice: 290, // 2 months free
      description: 'For founders serious about conversions',
      features: [
        { text: 'Unlimited analyses', included: true },
        { text: '7 dimension scores', included: true },
        { text: 'Full recommendation list', included: true },
        { text: 'Reports saved forever', included: true },
        { text: 'Revenue impact estimates', included: true },
        { text: 'ROI-prioritised suggestions', included: true },
        { text: 'Historical comparisons', included: true },
        { text: 'Export as PDF', included: true },
      ],
      cta: currentPlan === 'pro_29' ? 'Current Plan' : 'Start 7-Day Trial',
      ctaDisabled: currentPlan === 'pro_29',
      href: '/api/create-checkout-session?plan=pro_29',
      popular: true,
      badge: 'Most Popular',
    },
    {
      id: 'agency',
      name: 'Agency',
      monthlyPrice: 99,
      annualPrice: 990,
      description: 'For teams managing multiple clients',
      features: [
        { text: 'Everything in Pro', included: true },
        { text: 'Unlimited team members', included: true },
        { text: 'White-label reports', included: true },
        { text: 'Custom branding', included: true },
        { text: 'API access', included: true },
        { text: 'Competitor comparison', included: true },
        { text: 'Priority support', included: true },
        { text: 'Dedicated onboarding', included: true },
      ],
      cta: currentPlan === 'agency' ? 'Current Plan' : 'Contact Sales',
      ctaDisabled: currentPlan === 'agency',
      href: 'mailto:hello@pirouette.app?subject=Agency%20Plan%20Enquiry',
      popular: false,
      badge: 'Coming Soon',
    },
  ];

  return (
    <section className="py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => {
            const price = billingCycle === 'annual' ? plan.annualPrice : plan.monthlyPrice;
            const priceLabel = billingCycle === 'annual' && plan.monthlyPrice > 0
              ? `/year`
              : plan.monthlyPrice === 0 ? 'forever' : '/month';
            
            return (
              <div 
                key={plan.id}
                className={`relative rounded-2xl p-8 ${
                  plan.popular 
                    ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white scale-105 shadow-xl z-10' 
                    : 'bg-white border-2 border-slate-100 hover:border-indigo-100 hover:shadow-lg'
                } transition-all duration-300`}
              >
                {/* Badge */}
                {plan.badge && (
                  <div className={`absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 text-sm font-semibold rounded-full ${
                    plan.popular 
                      ? 'bg-orange-500 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}>
                    {plan.badge}
                  </div>
                )}
                
                {/* Plan Name */}
                <h3 className={`font-heading text-xl font-bold mb-2 ${plan.popular ? 'text-white' : 'text-slate-900'}`}>
                  {plan.name}
                </h3>
                
                {/* Price */}
                <div className="mb-4">
                  <span className={`text-4xl font-bold ${plan.popular ? 'text-white' : 'text-slate-900'}`}>
                    £{price}
                  </span>
                  <span className={plan.popular ? 'text-indigo-200' : 'text-slate-500'}>
                    {priceLabel}
                  </span>
                  {billingCycle === 'annual' && plan.monthlyPrice > 0 && (
                    <div className={`text-sm mt-1 ${plan.popular ? 'text-indigo-200' : 'text-slate-500'}`}>
                      £{Math.round(plan.annualPrice / 12)}/month billed annually
                    </div>
                  )}
                </div>
                
                {/* Description */}
                <p className={`text-sm mb-6 ${plan.popular ? 'text-indigo-100' : 'text-slate-600'}`}>
                  {plan.description}
                </p>
                
                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      {feature.included ? (
                        <CheckIcon className={`w-5 h-5 flex-shrink-0 ${plan.popular ? 'text-indigo-200' : 'text-emerald-500'}`} />
                      ) : (
                        <XIcon className={`w-5 h-5 flex-shrink-0 ${plan.popular ? 'text-indigo-300/50' : 'text-slate-300'}`} />
                      )}
                      <span className={`text-sm ${
                        plan.popular 
                          ? feature.included ? 'text-white' : 'text-indigo-300/70'
                          : feature.included ? 'text-slate-600' : 'text-slate-400'
                      }`}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
                
                {/* CTA Button */}
                {plan.id === 'free' ? (
                  <Link
                    href={plan.href}
                    className={`block w-full py-3 px-4 rounded-xl font-semibold text-center transition-all duration-200 ${
                      plan.ctaDisabled
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                ) : plan.id === 'agency' ? (
                  <a
                    href={plan.href}
                    className={`block w-full py-3 px-4 rounded-xl font-semibold text-center transition-all duration-200 ${
                      plan.ctaDisabled
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : plan.popular
                          ? 'bg-white text-indigo-600 hover:bg-indigo-50'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {plan.cta}
                  </a>
                ) : (
                  <CheckoutButton 
                    plan={plan.id} 
                    billingCycle={billingCycle}
                    disabled={plan.ctaDisabled || !isLoaded}
                    popular={plan.popular}
                    label={plan.cta}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// CHECKOUT BUTTON COMPONENT
// ============================================================================

function CheckoutButton({ 
  plan, 
  billingCycle, 
  disabled, 
  popular, 
  label 
}: { 
  plan: string;
  billingCycle: 'monthly' | 'annual';
  disabled: boolean;
  popular: boolean;
  label: string;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    if (disabled) return;
    
    setIsLoading(true);
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          plan,
          billingCycle,
          successUrl: `${window.location.origin}/dashboard?upgraded=true`,
          cancelUrl: `${window.location.origin}/pricing`,
        }),
      });
      
      const data = await res.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to create checkout session');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={disabled || isLoading}
      className={`block w-full py-3 px-4 rounded-xl font-semibold text-center transition-all duration-200 ${
        disabled
          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
          : popular
            ? 'bg-white text-indigo-600 hover:bg-indigo-50'
            : 'text-white hover:-translate-y-1'
      }`}
      style={!popular && !disabled ? { 
        background: 'linear-gradient(135deg, #F97316 0%, #FB923C 100%)', 
        boxShadow: '0 4px 14px 0 rgba(249, 115, 22, 0.39)' 
      } : {}}
    >
      {isLoading ? 'Loading...' : label}
    </button>
  );
}

// ============================================================================
// FEATURE COMPARISON TABLE
// ============================================================================

function FeatureComparisonTable() {
  const features = [
    { name: 'Analyses per week', free: '1', pro: 'Unlimited', agency: 'Unlimited' },
    { name: '7 dimension scores', free: true, pro: true, agency: true },
    { name: 'Revenue impact estimates', free: true, pro: true, agency: true },
    { name: 'ROI-prioritised suggestions', free: true, pro: true, agency: true },
    { name: 'Full recommendation list', free: 'Top 3 only', pro: true, agency: true },
    { name: 'Report retention', free: '30 days', pro: 'Forever', agency: 'Forever' },
    { name: 'Historical tracking', free: false, pro: true, agency: true },
    { name: 'Competitor comparison', free: false, pro: false, agency: true },
    { name: 'Export as PDF', free: false, pro: true, agency: true },
    { name: 'White-label reports', free: false, pro: false, agency: true },
    { name: 'API access', free: false, pro: false, agency: true },
    { name: 'Team members', free: '1', pro: '1', agency: 'Unlimited' },
    { name: 'Support', free: 'Community', pro: 'Email (24hr)', agency: 'Priority (4hr)' },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Compare Plans
          </h2>
          <p className="text-lg text-slate-600">
            Everything you need to improve your landing page conversions
          </p>
        </div>
        
        {/* Desktop Table */}
        <div className="hidden md:block overflow-hidden rounded-2xl border border-slate-200">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left py-4 px-6 font-heading font-semibold text-slate-900">Feature</th>
                <th className="text-center py-4 px-6 font-heading font-semibold text-slate-900">Free</th>
                <th className="text-center py-4 px-6 font-heading font-semibold text-indigo-600 bg-indigo-50">Pro</th>
                <th className="text-center py-4 px-6 font-heading font-semibold text-slate-900">Agency</th>
              </tr>
            </thead>
            <tbody>
              {features.map((feature, idx) => (
                <tr key={feature.name} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                  <td className="py-4 px-6 text-slate-700 font-medium">{feature.name}</td>
                  <td className="py-4 px-6 text-center">
                    <FeatureValue value={feature.free} />
                  </td>
                  <td className="py-4 px-6 text-center bg-indigo-50/50">
                    <FeatureValue value={feature.pro} highlight />
                  </td>
                  <td className="py-4 px-6 text-center">
                    <FeatureValue value={feature.agency} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Mobile Cards */}
        <div className="md:hidden space-y-4">
          {features.map((feature) => (
            <div key={feature.name} className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="font-medium text-slate-900 mb-3">{feature.name}</div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="text-center">
                  <div className="text-xs text-slate-500 mb-1">Free</div>
                  <FeatureValue value={feature.free} />
                </div>
                <div className="text-center bg-indigo-50 rounded-lg py-1">
                  <div className="text-xs text-indigo-600 mb-1">Pro</div>
                  <FeatureValue value={feature.pro} highlight />
                </div>
                <div className="text-center">
                  <div className="text-xs text-slate-500 mb-1">Agency</div>
                  <FeatureValue value={feature.agency} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureValue({ value, highlight = false }: { value: boolean | string; highlight?: boolean }) {
  if (typeof value === 'boolean') {
    return value ? (
      <CheckIcon className={`w-5 h-5 mx-auto ${highlight ? 'text-indigo-600' : 'text-emerald-500'}`} />
    ) : (
      <XIcon className="w-5 h-5 mx-auto text-slate-300" />
    );
  }
  return <span className={highlight ? 'text-indigo-600 font-medium' : 'text-slate-600'}>{value}</span>;
}

// ============================================================================
// FAQ SECTION
// ============================================================================

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  
  const faqs = [
    {
      question: 'What happens after my trial ends?',
      answer: 'After your 7-day free trial, you\'ll be charged the plan amount (£29/month for Pro). You can cancel anytime before the trial ends and you won\'t be charged. Your reports and data will be preserved regardless.',
    },
    {
      question: 'Can I cancel anytime?',
      answer: 'Absolutely! You can cancel your subscription at any time from your dashboard. Your access continues until the end of your billing period, and there are no cancellation fees.',
    },
    {
      question: 'How does billing work?',
      answer: 'We charge monthly or annually depending on your preference. Annual plans save you 17% (equivalent to 2 months free). All payments are processed securely through Stripe.',
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit and debit cards (Visa, Mastercard, American Express) through Stripe. We also support Apple Pay and Google Pay where available.',
    },
    {
      question: 'Do you offer refunds?',
      answer: 'Yes, we offer a 14-day money-back guarantee for annual plans. For monthly plans, you can cancel anytime but refunds aren\'t typically offered for partial months.',
    },
    {
      question: 'Can I switch plans?',
      answer: 'Yes! You can upgrade or downgrade at any time. When upgrading, you\'ll be charged the prorated difference. When downgrading, your new rate applies at the next billing cycle.',
    },
    {
      question: 'What\'s the difference between Pro and Agency?',
      answer: 'Pro is designed for individual founders and small teams. Agency is for design agencies managing multiple clients, with features like white-label reports, custom branding, and API access. Agency pricing includes unlimited team members.',
    },
    {
      question: 'Is my data secure?',
      answer: 'Yes. We use industry-standard encryption, and your data is stored securely with Supabase (hosted on AWS). We never share your data with third parties, and you can export or delete your data at any time.',
    },
  ];

  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-slate-600">
            Everything you need to know about pricing and billing
          </p>
        </div>
        
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div 
              key={idx}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-50 transition-colors"
                aria-expanded={openIndex === idx}
              >
                <span className="font-semibold text-slate-900">{faq.question}</span>
                <ChevronIcon 
                  className={`w-5 h-5 text-slate-400 transition-transform ${openIndex === idx ? 'rotate-180' : ''}`} 
                />
              </button>
              {openIndex === idx && (
                <div className="px-6 pb-6">
                  <p className="text-slate-600 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// TRUST INDICATORS
// ============================================================================

function TrustIndicators() {
  return (
    <section className="py-16 bg-white border-t border-slate-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
              <ShieldIcon className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Secure Payments</h3>
            <p className="text-sm text-slate-600">
              Powered by Stripe. Your card details are never stored on our servers.
            </p>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
              <RefreshIcon className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Cancel Anytime</h3>
            <p className="text-sm text-slate-600">
              No contracts, no commitments. Cancel with one click from your dashboard.
            </p>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-4">
              <StarIcon className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">7-Day Free Trial</h3>
            <p className="text-sm text-slate-600">
              Try Pro free for 7 days. No charge if you cancel before the trial ends.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// FINAL CTA
// ============================================================================

function FinalCTA({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <section className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white mb-6">
          Ready to Improve Your Conversions?
        </h2>
        <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
          Join founders who've improved their landing pages with data-driven recommendations.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href={isLoggedIn ? '/dashboard' : '/sign-up'}
            className="w-full sm:w-auto px-8 py-4 rounded-xl text-white font-semibold text-lg transition-all duration-200 hover:-translate-y-1"
            style={{ 
              background: 'linear-gradient(135deg, #F97316 0%, #FB923C 100%)', 
              boxShadow: '0 4px 14px 0 rgba(249, 115, 22, 0.39)' 
            }}
          >
            {isLoggedIn ? 'Go to Dashboard' : 'Start Free Analysis →'}
          </Link>
        </div>
        
        <p className="text-sm text-slate-400 mt-6">
          No credit card required • Free tier available forever
        </p>
      </div>
    </section>
  );
}

// ============================================================================
// FOOTER
// ============================================================================

function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span className="font-heading font-bold text-xl text-white">Pirouette</span>
            </div>
            <p className="text-sm max-w-xs">
              Design confidence, backed by data. Analyse your landing pages against patterns from award-winning sites.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/#features" className="hover:text-white transition-colors">Features</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              <li><Link href="/#how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/ethics" className="hover:text-white transition-colors">Crawler Ethics</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-slate-800 text-sm text-center">
          <p>© {new Date().getFullYear()} Pirouette. All rights reserved. UK Company.</p>
        </div>
      </div>
    </footer>
  );
}

// ============================================================================
// ICONS
// ============================================================================

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}

function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

