# Orchestrator Handoff: Pirouette Project

**Date:** 2025-11-22  
**Project:** Pirouette - Design Confidence for Non-Designers  
**Status:** Ready for Project Scaffolding  
**PRD Location:** `docs/PRD_PIROUETTE.md`

---

## 🎯 Project Overview

**What:** SaaS tool that analyzes landing page designs and provides data-driven recommendations  
**Target Market:** Bootstrapped founders, agencies, e-commerce owners  
**Revenue Model:** Freemium ($0 → $29-49/mo)  
**Tech Stack:** Next.js 14 + Vercel (frontend), Railway (analysis), Supabase (database)  
**MVP Timeline:** 4 weeks to launch  
**Budget:** $5/mo (MVP costs)

---

## 📋 Handoff Checklist

### ✅ Documentation Provided

1. **Complete PRD** (`docs/PRD_PIROUETTE.md`)
   - 60+ pages covering all aspects
   - Technical architecture diagrams
   - Database schemas
   - API contracts
   - User flows
   - Marketing strategy

2. **Lateral Thinking Analysis** (`docs/lateral-thinking/VISUAL_DESIGN_SERVICE_POSITIONING.md`)
   - Market positioning options
   - Competitive analysis
   - Value propositions

3. **PRD Completeness Analysis** (`docs/lateral-thinking/PIROUETTE_PRD_ANALYSIS.md`)
   - Gap analysis
   - Risk assessment
   - Decision documentation

4. **Technical Architecture Comparison** (`docs/lateral-thinking/VERCEL_VS_RAILWAY_ANALYSIS.md`)
   - Vercel vs Railway detailed comparison
   - Hybrid architecture justification
   - Cost analysis

5. **Source Material: Visual Design Analysis Skills** (from `portfolio-redesign`)
   - `.cursor/skills/visual-design-analyzer.mjs` (6,122 lines)
   - `.cursor/skills/page-quality-auditor.mjs`
   - Pattern library with 57 designs from 3 sources
   - 22 patterns across 7 dimensions

---

## 🚀 What the Orchestrator Should Do

### Phase 1: Repository Setup (Day 1)

```bash
# 1. Create new GitHub repository
gh repo create pirouette --public --description "Design Confidence for Non-Designers - Landing page analysis SaaS"

# 2. Clone repository
git clone https://github.com/[username]/pirouette.git
cd pirouette

# 3. Initialize Next.js 14 project
npx create-next-app@latest . --typescript --tailwind --app --use-npm
# Answers:
# - TypeScript: Yes
# - ESLint: Yes
# - Tailwind CSS: Yes
# - src/ directory: Yes
# - App Router: Yes
# - Import alias: @/*

# 4. Initial commit
git add .
git commit -m "chore: Initialize Next.js 14 project with TypeScript and Tailwind"
git push origin main
```

---

### Phase 2: Infrastructure Setup (Day 1-2)

#### A. Vercel Deployment

**Steps:**
1. Go to [vercel.com](https://vercel.com)
2. Import GitHub repository: `pirouette`
3. Configure project:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`
4. Add environment variables (see section below)
5. Deploy

**Expected Result:** Live at `pirouette.vercel.app`

---

#### B. Supabase Database

**Steps:**
1. Go to [supabase.com](https://supabase.com)
2. Create new project: `pirouette`
3. Region: Choose closest to users (e.g., US East)
4. Database password: Generate strong password (save in 1Password)
5. Wait for project creation (~2 minutes)
6. Run SQL migrations (from PRD Appendix):
   - Go to SQL Editor
   - Paste `migrations/001_initial_schema.sql` from PRD
   - Run migration
7. Set up Storage bucket:
   - Go to Storage
   - Create bucket: `screenshots`
   - Set to public access
8. Copy credentials:
   - Project URL: `https://xxx.supabase.co`
   - Anon Key: `eyJhbGc...`
   - Service Role Key: `eyJhbGc...` (keep secret!)

**Expected Result:** Database ready with 4 tables (users, jobs, reports, patterns)

---

#### C. Clerk Authentication

**Steps:**
1. Go to [clerk.com](https://clerk.com)
2. Create application: `Pirouette`
3. Configure authentication:
   - Enable: Email/Password
   - Enable: Google OAuth
   - Enable: GitHub OAuth (optional)
4. Configure appearance:
   - Brand color: (choose from Tailwind palette)
   - Logo: Upload Pirouette logo when ready
5. Set up Supabase integration:
   - Go to Integrations → Supabase
   - Connect to Supabase project
   - Sync users to `users` table
6. Copy credentials:
   - Publishable Key: `pk_test_...`
   - Secret Key: `sk_test_...`

**Expected Result:** Authentication ready, users sync to Supabase

---

#### D. Stripe Payments

**Steps:**
1. Go to [stripe.com](https://stripe.com)
2. Create account (or use existing)
3. Switch to Test Mode
4. Create products:
   - Product 1: "Pro Monthly ($29)"
     - Name: Pirouette Pro
     - Billing: Monthly
     - Price: $29 USD
   - Product 2: "Pro Monthly ($49)" (for A/B test)
     - Name: Pirouette Pro Plus
     - Billing: Monthly
     - Price: $49 USD
5. Set up webhook:
   - Endpoint: `https://pirouette.vercel.app/api/webhooks/stripe`
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
6. Copy credentials:
   - Publishable Key: `pk_test_...`
   - Secret Key: `sk_test_...`
   - Webhook Secret: `whsec_...`

**Expected Result:** Payment processing ready

---

#### E. Railway Analysis Service

**Steps:**
1. Go to [railway.app](https://railway.app)
2. Create new project: `pirouette-analysis`
3. Deploy from GitHub:
   - Connect GitHub account
   - Select `pirouette` repository
   - Set root directory: `/` (or `/railway` if you create subdirectory)
4. Add Dockerfile (create in repo):
   ```dockerfile
   FROM mcr.microsoft.com/playwright:v1.40.0-jammy
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   RUN npx playwright install chromium
   EXPOSE 3001
   CMD ["node", "server.js"]
   ```
5. Add Redis service:
   - Click "New" → "Database" → "Redis"
   - Note connection URL
6. Set environment variables (see section below)
7. Deploy

**Expected Result:** Analysis service running at `https://pirouette-analysis.railway.app`

---

### Phase 3: Environment Variables

#### Vercel Environment Variables

Add these in Vercel dashboard (Settings → Environment Variables):

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... # Server-side only

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Railway Integration
RAILWAY_API_URL=https://pirouette-analysis.railway.app
RAILWAY_SECRET=<generate-random-secret> # Use: openssl rand -base64 32

# Analytics
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=pirouette.app
```

---

#### Railway Environment Variables

Add these in Railway dashboard (Variables):

```bash
# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Redis (auto-provided by Railway)
REDIS_URL=redis://default:xxx@railway.app:6379

# Secrets
RAILWAY_SECRET=<same-as-vercel> # Must match Vercel

# Monitoring (optional)
SENTRY_DSN=https://xxx@sentry.io/xxx
```

---

### Phase 4: Copy Analysis Skills (Day 2)

**Source:** `portfolio-redesign/.cursor/skills/`  
**Destination:** `pirouette/lib/analysis/`

**Files to Copy:**

1. **visual-design-analyzer.mjs** (6,122 lines)
   - Core analysis engine
   - Pattern matching
   - 7-dimensional analysis

2. **Pattern Library Data**
   - Copy latest pattern report from: `portfolio-redesign/docs/visual-design-audits/[latest]/pattern-learning.json`
   - Destination: `pirouette/lib/analysis/patterns/default-patterns.json`

**Adaptations Needed:**

```javascript
// In visual-design-analyzer.mjs, update imports:
// BEFORE (portfolio-redesign):
import { chromium } from 'playwright';

// AFTER (pirouette):
import { chromium } from 'playwright'; // Same import, but ensure Dockerfile includes Playwright

// Update file paths:
// BEFORE:
const reportDir = 'docs/visual-design-audits';

// AFTER:
const reportDir = '/tmp/analysis-reports'; // Railway ephemeral storage
// (Reports saved to Supabase, not local filesystem)
```

**Pattern Library Migration:**

```javascript
// Create: lib/analysis/pattern-loader.js
import supabase from '@/lib/supabase';

export async function loadPatternLibrary() {
  // Load from Supabase patterns table
  const { data: patterns } = await supabase
    .from('patterns')
    .select('*')
    .eq('version', 'latest')
    .order('updated_at', { ascending: false });
  
  return patterns;
}

// Seed initial patterns (one-time)
import defaultPatterns from './patterns/default-patterns.json';

export async function seedPatterns() {
  await supabase.from('patterns').insert(
    defaultPatterns.patterns.colors.map(p => ({
      dimension: 'colors',
      pattern_data: p,
      source: 'portfolio-redesign',
      designs_analyzed: defaultPatterns.meta.designsAnalyzed,
      prevalence: p.prevalence,
      version: '1.0'
    }))
  );
  // Repeat for other dimensions...
}
```

---

### Phase 5: Project Structure (Day 2)

**Recommended Directory Structure:**

```
pirouette/
├── .github/
│   └── workflows/
│       ├── vercel-deploy.yml    # Auto-deploy to Vercel
│       └── railway-deploy.yml   # Auto-deploy to Railway
├── public/
│   ├── logo.svg
│   ├── og-image.png
│   └── favicon.ico
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── layout.tsx
│   │   ├── page.tsx             # Landing page
│   │   ├── dashboard/
│   │   │   └── page.tsx         # User dashboard
│   │   ├── reports/
│   │   │   └── [id]/
│   │   │       └── page.tsx     # Report view
│   │   └── api/
│   │       ├── analyze/
│   │       │   └── route.ts     # POST /api/analyze
│   │       ├── status/
│   │       │   └── [jobId]/
│   │       │       └── route.ts # GET /api/status/:jobId
│   │       ├── reports/
│   │       │   └── [id]/
│   │       │       └── route.ts # GET /api/reports/:id
│   │       └── webhooks/
│   │           └── stripe/
│   │               └── route.ts # POST /api/webhooks/stripe
│   ├── components/              # React components
│   │   ├── ui/                  # Shadcn/ui components
│   │   ├── landing/
│   │   │   ├── Hero.tsx
│   │   │   ├── Features.tsx
│   │   │   ├── Pricing.tsx
│   │   │   └── Testimonials.tsx
│   │   ├── analysis/
│   │   │   ├── AnalysisForm.tsx
│   │   │   ├── ProgressIndicator.tsx
│   │   │   └── Report.tsx
│   │   └── dashboard/
│   │       ├── AnalysisHistory.tsx
│   │       ├── UsageQuota.tsx
│   │       └── AccountSettings.tsx
│   ├── lib/                     # Utilities
│   │   ├── supabase.ts          # Supabase client
│   │   ├── stripe.ts            # Stripe client
│   │   └── analysis/            # Analysis engine
│   │       ├── analyzer.ts      # Main entry point
│   │       ├── visual-design-analyzer.ts # Copied from portfolio-redesign
│   │       ├── pattern-loader.ts
│   │       └── patterns/
│   │           └── default-patterns.json
│   └── types/                   # TypeScript types
│       ├── database.ts          # Supabase types
│       └── analysis.ts          # Analysis result types
├── railway/                     # Railway service
│   ├── Dockerfile
│   ├── railway.toml             # Railway config
│   ├── server.js                # Express server
│   ├── analyzer.js              # Analysis worker
│   └── scripts/
│       ├── refresh-patterns.js  # Weekly cron
│       ├── send-digest.js       # Daily cron
│       └── retry-failed.js      # Retry cron
├── migrations/                  # Supabase migrations
│   └── 001_initial_schema.sql
├── .env.local.example           # Example env vars
├── .env.production              # Production env vars (not committed)
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── next.config.js
└── README.md
```

---

### Phase 6: Development Tasks (Week 1-4)

**Follow the roadmap in PRD Section 13:**

#### Week 1: Foundation
- [ ] Set up project structure (above)
- [ ] Implement landing page (hero, pricing, CTA)
- [ ] Configure Tailwind + Shadcn/ui
- [ ] Set up Clerk authentication
- [ ] Test: User can sign up and log in

#### Week 2: Analysis Engine
- [ ] Copy analysis skills from portfolio-redesign
- [ ] Seed pattern library to Supabase
- [ ] Implement Railway server (`server.js`)
- [ ] Implement analysis worker (`analyzer.js`)
- [ ] Test: Analysis completes successfully (Railway logs)

#### Week 3: User Flow
- [ ] Implement `/api/analyze` (Vercel → Railway trigger)
- [ ] Implement `/api/status/:jobId` (status polling)
- [ ] Implement report page (`/reports/[id]`)
- [ ] Build progress indicator UI
- [ ] Test: Submit URL → see report (end-to-end)

#### Week 4: Monetization
- [ ] Integrate Stripe Checkout
- [ ] Implement webhook handler (`/api/webhooks/stripe`)
- [ ] Add rate limiting (free: 1/week, pro: unlimited)
- [ ] Build user dashboard
- [ ] Test: Upgrade to Pro, analyze unlimited sites

---

## 📦 Dependencies to Install

### Frontend (Vercel)

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@clerk/nextjs": "^4.27.0",
    "@supabase/supabase-js": "^2.38.0",
    "@stripe/stripe-js": "^2.2.0",
    "stripe": "^14.7.0",
    "zustand": "^4.4.7",
    "react-hook-form": "^7.48.2",
    "zod": "^3.22.4",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-progress": "^1.0.3",
    "tailwindcss": "^3.3.5",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.9.0",
    "@types/react": "^18.2.37",
    "typescript": "^5.2.2",
    "eslint": "^8.54.0",
    "eslint-config-next": "^14.0.0"
  }
}
```

### Backend (Railway)

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "playwright": "^1.40.0",
    "bullmq": "^4.15.0",
    "ioredis": "^5.3.2",
    "@supabase/supabase-js": "^2.38.0",
    "dotenv": "^16.3.1"
  }
}
```

---

## 🧪 Testing Checklist

**Before considering MVP complete, test:**

### User Flow Tests
- [ ] Landing page loads in <2 seconds
- [ ] User can sign up with email/password
- [ ] User can sign up with Google OAuth
- [ ] User can submit URL for analysis
- [ ] Progress indicator updates every 3-5 seconds
- [ ] Analysis completes in <5 minutes
- [ ] Report displays all 7 dimensions
- [ ] Screenshot is captured and displayed
- [ ] User can view analysis history

### Payment Flow Tests
- [ ] Free user hits rate limit (1/week)
- [ ] Upgrade modal appears with pricing
- [ ] User can click "Upgrade to Pro"
- [ ] Stripe Checkout opens (pre-filled email)
- [ ] User completes test payment
- [ ] User is redirected to dashboard
- [ ] Plan is updated to "Pro"
- [ ] User can now analyze unlimited sites

### Error Handling Tests
- [ ] Invalid URL → Clear error message
- [ ] Site unreachable → Graceful failure
- [ ] Analysis timeout → Retry or error
- [ ] Stripe webhook fails → Logged, retried

### Performance Tests
- [ ] Landing page: Lighthouse score >90
- [ ] Report page: Loads in <3 seconds
- [ ] API routes: Respond in <1 second
- [ ] Analysis: Completes in <5 minutes

---

## 🚨 Critical Path Items

**Must be done before launch:**

1. ✅ **Legal Compliance**
   - [ ] Write Terms of Service (use template, customize)
   - [ ] Write Privacy Policy (GDPR-compliant)
   - [ ] Add cookie consent (if needed)
   - [ ] Add DMCA takedown email (dmca@pirouette.app)

2. ✅ **Domain Setup**
   - [ ] Purchase domain: `pirouette.app` (Namecheap, $12/year)
   - [ ] Point DNS to Vercel (A record, CNAME)
   - [ ] Set up SSL (automatic via Vercel)

3. ✅ **Monitoring**
   - [ ] Set up Sentry (error tracking)
   - [ ] Set up Plausible Analytics (pageviews)
   - [ ] Set up Railway metrics (analysis success rate)
   - [ ] Create admin dashboard (internal use)

4. ✅ **Email Setup**
   - [ ] Set up transactional emails (Resend.com)
   - [ ] Templates: Welcome, analysis complete, payment success
   - [ ] Test all email flows

---

## 📧 Launch Communication

**Once MVP is complete, notify user (Tom) with:**

```
Subject: Pirouette MVP Ready for Review 🎉

Hi Tom,

Pirouette is complete and deployed! Here's what's live:

🌐 Live Site: https://pirouette.app
🔐 Test Account: test@pirouette.app (password: TestAccount123!)
💳 Test Stripe: Use card 4242 4242 4242 4242

✅ All MVP features implemented:
- Landing page (hero, pricing, testimonials)
- Free analysis (1/week rate limit)
- User authentication (email + Google OAuth)
- Analysis reports (7 dimensions, recommendations)
- User dashboard (analysis history)
- Payment integration (Stripe Checkout)
- Pro plan upgrade ($29/mo or $49/mo A/B test)

📊 Tech Stack Deployed:
- Frontend: Vercel (Next.js 14)
- Backend: Railway (Playwright analysis)
- Database: Supabase (PostgreSQL)
- Auth: Clerk
- Payments: Stripe

🧪 Next Steps:
1. Review site, try analysis flow
2. Provide feedback on UX/design
3. Approve for public launch
4. Execute Week 4 launch plan (Product Hunt, Twitter, Reddit)

Let me know any changes needed before launch!

Best,
Orchestrator
```

---

## 🎯 Success Criteria

**MVP is complete when:**

- [ ] Landing page is live at `pirouette.app`
- [ ] User can sign up and analyze 1 site for free
- [ ] Analysis completes in <5 minutes
- [ ] Report shows all 7 dimensions + recommendations
- [ ] User can upgrade to Pro ($29 or $49/mo)
- [ ] Payment flow works end-to-end
- [ ] Terms of Service and Privacy Policy are published
- [ ] All critical bugs are fixed
- [ ] Lighthouse score >90 on landing page

**Then proceed to Week 4 Launch Plan** (PRD Section 10)

---

## 📚 Reference Documents

1. **PRD:** `docs/PRD_PIROUETTE.md` (primary reference)
2. **Lateral Thinking Analysis:** `docs/lateral-thinking/VISUAL_DESIGN_SERVICE_POSITIONING.md`
3. **PRD Completeness Check:** `docs/lateral-thinking/PIROUETTE_PRD_ANALYSIS.md`
4. **Tech Architecture Analysis:** `docs/lateral-thinking/VERCEL_VS_RAILWAY_ANALYSIS.md`
5. **Source Analysis Skills:** `portfolio-redesign/.cursor/skills/visual-design-analyzer.mjs`

---

## ✅ Final Checklist for Orchestrator

Before starting development:
- [ ] Read complete PRD (`docs/PRD_PIROUETTE.md`)
- [ ] Understand hybrid architecture (Vercel + Railway)
- [ ] Review database schema (Section 5 of PRD)
- [ ] Note all environment variables needed
- [ ] Understand analysis skills source (`portfolio-redesign/.cursor/skills/`)

During development:
- [ ] Follow Phase 1-6 setup instructions (this document)
- [ ] Install all dependencies (see Dependencies section)
- [ ] Test each feature as you build (see Testing Checklist)
- [ ] Commit frequently with clear messages

Before launch:
- [ ] Complete all Critical Path Items
- [ ] Run full testing checklist
- [ ] Verify Success Criteria are met
- [ ] Send launch communication to Tom

---

**Status:** Ready for Handoff ✅  
**Orchestrator Action Required:** Begin Phase 1 (Repository Setup)  
**Estimated Time to MVP:** 4 weeks (160 hours)  
**Estimated Cost:** $5/month (MVP), $50/month (at scale)

---

*This handoff document contains everything needed to build Pirouette MVP. All technical decisions are documented in the PRD. All source materials are available in the portfolio-redesign project.*

**Good luck, Orchestrator! 🚀**


