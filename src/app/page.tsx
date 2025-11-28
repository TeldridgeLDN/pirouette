import Link from 'next/link';
import HeroAnalyzeForm from '@/components/HeroAnalyzeForm';
import Navigation from '@/components/Navigation';

// ============================================================================
// PIROUETTE LANDING PAGE
// Design Confidence, Backed by Data
// ============================================================================

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* Navigation - Dynamic auth state */}
      <Navigation />
      
      {/* Hero Section */}
      <HeroSection />
      
      {/* Social Proof Bar */}
      <SocialProofBar />
      
      {/* How It Works */}
      <HowItWorksSection />
      
      {/* Features - 7 Analysis Dimensions */}
      <FeaturesSection />
      
      {/* Pricing */}
      <PricingSection />
      
      {/* Testimonials */}
      <TestimonialsSection />
      
      {/* Final CTA */}
      <FinalCTASection />
      
      {/* Footer */}
      <Footer />
    </main>
  );
}

// Navigation moved to src/components/Navigation.tsx for dynamic auth state

// ============================================================================
// HERO SECTION
// ============================================================================

function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
      {/* Background Gradient Mesh */}
      <div 
        className="absolute inset-0 -z-10"
        style={{
          background: `
            radial-gradient(at 40% 20%, hsla(240, 91%, 67%, 0.12) 0px, transparent 50%),
            radial-gradient(at 80% 0%, hsla(189, 100%, 56%, 0.08) 0px, transparent 50%),
            radial-gradient(at 0% 50%, hsla(355, 100%, 93%, 0.08) 0px, transparent 50%),
            radial-gradient(at 80% 50%, hsla(340, 100%, 76%, 0.08) 0px, transparent 50%),
            radial-gradient(at 0% 100%, hsla(22, 100%, 77%, 0.08) 0px, transparent 50%),
            linear-gradient(to bottom, #FAFAFA, #F1F5F9)
          `
        }}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 mb-8 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
            <span className="text-sm font-medium text-indigo-700">Free analysis • No credit card required</span>
          </div>
          
          {/* Headline */}
          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 mb-6 leading-tight animate-slide-up">
            Design Confidence,{' '}
            <span 
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #A855F7 100%)' }}
            >
              Backed by Data
            </span>
          </h1>
          
          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-slate-600 mb-10 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '100ms' }}>
            Analyse your landing page against patterns from 50+ award-winning sites. 
            Get actionable recommendations to improve conversions—no design experience needed.
          </p>
          
          {/* URL Input Form - No signup required! */}
          <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
            <HeroAnalyzeForm />
          </div>
          
          {/* Secondary CTA */}
          <div className="mt-6 animate-fade-in" style={{ animationDelay: '300ms' }}>
            <a 
              href="#how-it-works" 
              className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium transition-colors"
            >
              <span>See How It Works</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </a>
          </div>
          
          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-8 text-sm text-slate-500 animate-fade-in" style={{ animationDelay: '400ms' }}>
            <div className="flex items-center gap-2">
              <CheckIcon className="w-4 h-4 text-emerald-500" />
              <span>No signup required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckIcon className="w-4 h-4 text-emerald-500" />
              <span>Results in 30 seconds</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckIcon className="w-4 h-4 text-emerald-500" />
              <span>No credit card needed</span>
            </div>
          </div>
        </div>
        
        {/* Hero Image / Demo */}
        <div className="mt-16 relative animate-slide-up" style={{ animationDelay: '300ms' }}>
          <div className="relative mx-auto max-w-5xl">
            {/* Browser Frame */}
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
              {/* Browser Top Bar */}
              <div className="flex items-center gap-2 px-4 py-3 bg-slate-100 border-b border-slate-200">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-white rounded-md px-3 py-1.5 text-sm text-slate-500 text-center">
                    pirouette.app/dashboard
                  </div>
                </div>
              </div>
              
              {/* Dashboard Preview */}
              <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Score Card */}
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                    <div className="text-sm font-medium text-slate-500 mb-2">Overall Score</div>
                    <div className="flex items-end gap-2">
                      <span className="text-5xl font-bold text-slate-900">87</span>
                      <span className="text-emerald-500 text-sm font-medium mb-2">+12 from last</span>
                    </div>
                    <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full w-[87%] bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
                    </div>
                  </div>
                  
                  {/* Dimensions Preview */}
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 md:col-span-2">
                    <div className="text-sm font-medium text-slate-500 mb-4">Analysis Dimensions</div>
                    <div className="grid grid-cols-2 gap-3">
                      {['Typography', 'Colours', 'Whitespace', 'CTA Design'].map((dim, i) => (
                        <div key={dim} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <span className="text-sm text-slate-700">{dim}</span>
                          <span className="text-sm font-semibold text-slate-900">{85 + i * 3}/100</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 bg-white rounded-xl p-4 shadow-lg border border-slate-100 animate-float hidden lg:block">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckIcon className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">Analysis Complete</div>
                  <div className="text-xs text-slate-500">5 recommendations found</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// SOCIAL PROOF BAR
// ============================================================================

function SocialProofBar() {
  return (
    <section className="py-12 bg-white border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-sm font-medium text-slate-500 mb-6">
            Trusted by founders and agencies building better landing pages
          </p>
          <div className="flex items-center justify-center gap-12 opacity-50 grayscale">
            {/* Placeholder logos - replace with actual logos */}
            {['Startup A', 'Agency B', 'Brand C', 'Company D', 'Studio E'].map((name) => (
              <div key={name} className="text-slate-400 font-heading font-bold text-lg">
                {name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// HOW IT WORKS SECTION
// ============================================================================

function HowItWorksSection() {
  const steps = [
    {
      number: '01',
      title: 'Paste Your URL',
      description: 'Enter your landing page URL. Our engine captures a full screenshot and begins analysis.',
      icon: LinkIcon,
    },
    {
      number: '02',
      title: 'AI-Powered Analysis',
      description: 'We analyse 7 design dimensions against patterns from 50+ award-winning sites.',
      icon: SparklesIcon,
    },
    {
      number: '03',
      title: 'Get Recommendations',
      description: 'Receive prioritised, actionable recommendations with estimated conversion impact.',
      icon: ChartIcon,
    },
  ];

  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium mb-4">
            Simple Process
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            How It Works
          </h2>
          <p className="text-lg text-slate-600">
            Get actionable design insights in three simple steps. No design expertise required.
          </p>
        </div>
        
        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-indigo-200 to-transparent -translate-x-1/2 z-0" />
              )}
              
              <div className="relative bg-white rounded-2xl p-8 border border-slate-100 hover:border-indigo-100 hover:shadow-lg transition-all duration-300 z-10">
                {/* Step Number */}
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-heading font-bold text-lg mb-6">
                  {step.number}
                </div>
                
                {/* Icon */}
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mb-6">
                  <step.icon className="w-7 h-7 text-indigo-600" />
                </div>
                
                {/* Content */}
                <h3 className="font-heading text-xl font-bold text-slate-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-slate-600">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// FEATURES SECTION - 7 Analysis Dimensions
// ============================================================================

function FeaturesSection() {
  const dimensions = [
    {
      name: 'Visual Hierarchy',
      description: 'Analyse how effectively your page guides visitors through content',
      score: 92,
      color: 'from-violet-500 to-purple-500',
    },
    {
      name: 'Typography',
      description: 'Evaluate font choices, sizes, and readability across devices',
      score: 88,
      color: 'from-blue-500 to-indigo-500',
    },
    {
      name: 'Colour & Contrast',
      description: 'Check accessibility compliance and visual appeal of your palette',
      score: 85,
      color: 'from-emerald-500 to-teal-500',
    },
    {
      name: 'Whitespace',
      description: 'Measure breathing room and balance in your layout',
      score: 78,
      color: 'from-cyan-500 to-blue-500',
    },
    {
      name: 'CTA Design',
      description: 'Assess call-to-action visibility, placement, and effectiveness',
      score: 94,
      color: 'from-orange-500 to-red-500',
    },
    {
      name: 'Mobile Responsiveness',
      description: 'Verify your design works beautifully on all screen sizes',
      score: 90,
      color: 'from-pink-500 to-rose-500',
    },
    {
      name: 'Loading Performance',
      description: 'Identify speed optimisations for better user experience',
      score: 82,
      color: 'from-amber-500 to-orange-500',
    },
  ];

  return (
    <section id="features" className="py-20 md:py-28 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium mb-4">
            7 Analysis Dimensions
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Comprehensive Design Analysis
          </h2>
          <p className="text-lg text-slate-600">
            Every aspect of your landing page evaluated against proven design patterns from award-winning sites.
          </p>
        </div>
        
        {/* Dimensions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {dimensions.map((dim) => (
            <div 
              key={dim.name}
              className="bg-white rounded-2xl p-6 border border-slate-100 hover:border-indigo-100 hover:shadow-xl transition-all duration-300 group"
            >
              {/* Score Ring */}
              <div className="relative w-16 h-16 mb-4">
                <svg className="w-16 h-16 transform -rotate-90">
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    className="text-slate-100"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="url(#gradient)"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={`${(dim.score / 100) * 176} 176`}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#6366F1" />
                      <stop offset="100%" stopColor="#A855F7" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-slate-900">{dim.score}</span>
                </div>
              </div>
              
              {/* Content */}
              <h3 className="font-heading text-lg font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                {dim.name}
              </h3>
              <p className="text-sm text-slate-600">
                {dim.description}
              </p>
            </div>
          ))}
          
          {/* CTA Card */}
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white flex flex-col justify-between">
            <div>
              <h3 className="font-heading text-lg font-bold mb-2">
                See Your Scores
              </h3>
              <p className="text-sm text-indigo-100 mb-4">
                Get a complete analysis of all 7 dimensions for your landing page.
              </p>
            </div>
            <Link 
              href="/sign-up"
              className="inline-flex items-center justify-center px-4 py-2 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-indigo-50 transition-colors"
            >
              Start Free Analysis →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// PRICING SECTION
// ============================================================================

function PricingSection() {
  const plans = [
    {
      name: 'Free',
      price: '£0',
      period: 'forever',
      description: 'Perfect for trying out Pirouette',
      features: [
        '1 analysis per week',
        '7 dimension scores',
        'Top 3 recommendations',
        'Basic report export',
      ],
      cta: 'Get Started Free',
      ctaStyle: 'secondary',
      popular: false,
    },
    {
      name: 'Pro',
      price: '£29',
      period: '/month',
      description: 'For founders serious about conversions',
      features: [
        'Unlimited analyses',
        'Full recommendation list',
        'Revenue impact estimates',
        'ROI-prioritised suggestions',
        'Historical comparisons',
        'Priority support',
      ],
      cta: 'Start Pro Trial',
      ctaStyle: 'primary',
      popular: true,
    },
    {
      name: 'Agency',
      price: '£99',
      period: '/month',
      description: 'For teams managing multiple clients',
      features: [
        'Everything in Pro',
        'Unlimited team members',
        'White-label reports',
        'API access',
        'Custom integrations',
        'Dedicated support',
      ],
      cta: 'Contact Sales',
      ctaStyle: 'secondary',
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium mb-4">
            Simple Pricing
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Choose Your Plan
          </h2>
          <p className="text-lg text-slate-600">
            Start free, upgrade when you need more. No hidden fees, cancel anytime.
          </p>
        </div>
        
        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div 
              key={plan.name}
              className={`relative rounded-2xl p-8 ${
                plan.popular 
                  ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white scale-105 shadow-xl' 
                  : 'bg-white border-2 border-slate-100 hover:border-indigo-100'
              } transition-all duration-300`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-orange-500 text-white text-sm font-semibold rounded-full">
                  Most Popular
                </div>
              )}
              
              {/* Plan Name */}
              <h3 className={`font-heading text-xl font-bold mb-2 ${plan.popular ? 'text-white' : 'text-slate-900'}`}>
                {plan.name}
              </h3>
              
              {/* Price */}
              <div className="mb-4">
                <span className={`text-4xl font-bold ${plan.popular ? 'text-white' : 'text-slate-900'}`}>
                  {plan.price}
                </span>
                <span className={plan.popular ? 'text-indigo-200' : 'text-slate-500'}>
                  {plan.period}
                </span>
              </div>
              
              {/* Description */}
              <p className={`text-sm mb-6 ${plan.popular ? 'text-indigo-100' : 'text-slate-600'}`}>
                {plan.description}
              </p>
              
              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <CheckIcon className={`w-5 h-5 flex-shrink-0 ${plan.popular ? 'text-indigo-200' : 'text-emerald-500'}`} />
                    <span className={`text-sm ${plan.popular ? 'text-white' : 'text-slate-600'}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
              
              {/* CTA Button */}
              <Link
                href="/sign-up"
                className={`block w-full py-3 px-4 rounded-xl font-semibold text-center transition-all duration-200 ${
                  plan.popular
                    ? 'bg-white text-indigo-600 hover:bg-indigo-50'
                    : plan.ctaStyle === 'primary'
                      ? 'text-white hover:-translate-y-1'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
                style={plan.ctaStyle === 'primary' && !plan.popular ? { 
                  background: 'linear-gradient(135deg, #F97316 0%, #FB923C 100%)', 
                  boxShadow: '0 4px 14px 0 rgba(249, 115, 22, 0.39)' 
                } : {}}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// TESTIMONIALS SECTION
// ============================================================================

function TestimonialsSection() {
  const testimonials = [
    {
      quote: "Pirouette helped us identify issues we'd never have spotted ourselves. Our conversion rate increased by 23% after implementing the recommendations.",
      author: "Sarah Chen",
      role: "Founder, TechStart",
      avatar: "SC",
    },
    {
      quote: "As a developer with no design background, this tool is invaluable. It gives me confidence that my landing pages follow best practices.",
      author: "Marcus Johnson",
      role: "Indie Hacker",
      avatar: "MJ",
    },
    {
      quote: "We use Pirouette for every client project now. The ROI-prioritised recommendations make it easy to focus on what matters most.",
      author: "Emma Williams",
      role: "Agency Director",
      avatar: "EW",
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium mb-4">
            Testimonials
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Loved by Founders & Agencies
          </h2>
          <p className="text-lg text-slate-600">
            See what our users say about improving their landing pages with Pirouette.
          </p>
        </div>
        
        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div 
              key={testimonial.author}
              className="bg-white rounded-2xl p-8 border border-slate-100 hover:shadow-lg transition-all duration-300"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className="w-5 h-5 text-amber-400" />
                ))}
              </div>
              
              {/* Quote */}
              <p className="text-slate-600 mb-6 italic">
                &ldquo;{testimonial.quote}&rdquo;
              </p>
              
              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold text-slate-900">{testimonial.author}</div>
                  <div className="text-sm text-slate-500">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// FINAL CTA SECTION
// ============================================================================

function FinalCTASection() {
  return (
    <section className="py-20 md:py-28 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(99, 102, 241, 0.3) 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, rgba(168, 85, 247, 0.3) 0%, transparent 50%)`
        }}
      />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
          Ready to Improve Your Landing Page?
        </h2>
        <p className="text-lg text-slate-300 mb-10 max-w-2xl mx-auto">
          Join hundreds of founders and agencies using Pirouette to build better, higher-converting landing pages.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href="/sign-up" 
            className="w-full sm:w-auto px-8 py-4 rounded-xl text-white font-semibold text-lg transition-all duration-200 hover:-translate-y-1"
            style={{ 
              background: 'linear-gradient(135deg, #F97316 0%, #FB923C 100%)', 
              boxShadow: '0 4px 14px 0 rgba(249, 115, 22, 0.39)' 
            }}
          >
            Start Free Analysis →
          </Link>
          <a 
            href="#pricing" 
            className="w-full sm:w-auto px-8 py-4 rounded-xl text-white font-semibold text-lg border-2 border-slate-600 hover:border-slate-500 hover:bg-slate-800 transition-all duration-200"
          >
            View Pricing
          </a>
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
          {/* Brand */}
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
          
          {/* Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
              <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">About</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        
        {/* Bottom */}
        <div className="pt-8 border-t border-slate-800 text-sm text-center">
          <p>© {new Date().getFullYear()} Pirouette. All rights reserved.</p>
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

function LinkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  );
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  );
}

function ChartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
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
