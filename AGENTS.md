# AGENTS.md

This file provides guidance to AI coding assistants (Claude Code, Cursor, Copilot, etc.) when working with code in this repository. It follows the [AGENTS.md standard](https://agents.md/).

## Project Overview

**Pirouette** - Design Confidence, Backed by Data

A SaaS tool that analyses landing page designs and provides data-driven recommendations based on patterns from 50+ award-winning sites.

- **Target Market**: Bootstrapped founders, agencies, e-commerce owners
- **Revenue Model**: Freemium ($0 → $29-49/mo)
- **Tech Stack**: Next.js 15 + Vercel (frontend), Railway (analysis), Supabase (database)
- **MVP Timeline**: 4 weeks to launch
- **Budget**: $5/mo (MVP costs)

## Essential Commands

### Development
```bash
npm run dev       # Start Next.js dev server on http://localhost:3000
npm run build     # Production build
npm run start     # Start production server
npm run lint      # Run ESLint
```

### Task Master
```bash
task-master list                    # View all tasks
task-master next                    # Get next task to work on
task-master show <id>               # View task details
task-master set-status --id=<id> --status=done  # Mark complete
task-master expand --id=<id> --research         # Break down task
task-master update-subtask --id=<id> --prompt="notes"  # Add notes
```

## Architecture

### Tech Stack

**Frontend (Vercel)**
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Clerk**: Authentication (email/password + Google OAuth)
- **Stripe**: Payment processing (planned)

**Backend (Railway)**
- **Express**: API server
- **Playwright**: Headless browser for analysis
- **BullMQ**: Job queue management (planned)
- **Redis**: Queue and caching (planned)

**Database & Storage**
- **Supabase**: PostgreSQL database
- **Supabase Storage**: Screenshot storage

### Directory Structure
```
pirouette/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── sync-user/     # Clerk user sync
│   │   │   ├── test-supabase/ # DB connection test
│   │   │   └── webhooks/      # Clerk webhooks
│   │   ├── dashboard/         # User dashboard
│   │   ├── sign-in/           # Auth pages
│   │   ├── sign-up/
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Landing page
│   │   └── globals.css        # Global styles
│   ├── components/            # React components
│   ├── lib/
│   │   ├── analysis/          # Analysis engine
│   │   │   ├── core/          # Core analyzers
│   │   │   ├── patterns/      # Design patterns
│   │   │   └── utils/         # Analysis utilities
│   │   └── supabase/          # Database client
│   ├── middleware.ts          # Clerk middleware
│   └── types/                 # TypeScript types
├── railway/                   # Railway backend service
│   ├── src/
│   │   ├── analyzer/          # Analysis service
│   │   ├── server.ts          # Express server
│   │   └── utils/             # Utilities
│   └── Dockerfile
├── supabase/
│   ├── migrations/            # Database migrations
│   └── storage/               # Storage config
├── public/                    # Static assets
├── .taskmaster/               # TaskMaster config
│   ├── docs/                  # PRD and handoff
│   └── tasks/                 # Task tracking
├── .cursor/                   # Cursor IDE config
│   └── rules/                 # Cursor rules
├── .claude/                   # Claude Code config
│   └── rules/                 # Claude rules
└── .mcp.json                  # MCP server config
```

## Analysis Engine

The core analysis engine evaluates landing pages across 7 dimensions:

1. **Visual Hierarchy** - Layout and element prioritisation
2. **Typography** - Font choices, sizes, readability
3. **Colour & Contrast** - Accessibility and visual appeal
4. **Whitespace** - Breathing room and balance
5. **CTA Design** - Call-to-action effectiveness
6. **Mobile Responsiveness** - Cross-device compatibility
7. **Loading Performance** - Speed and optimisation

### Analysis Components
- `src/lib/analysis/core/typography-analyzer.ts` - Typography analysis
- `src/lib/analysis/core/visual-design-analyzer.ts` - Visual design scoring
- `src/lib/analysis/core/contrast-validator.ts` - WCAG contrast checking
- `src/lib/analysis/patterns/` - Design pattern matching

## Authentication

Uses **Clerk** for authentication:
- Email/password signup
- Google OAuth
- Webhook sync to Supabase (`/api/webhooks/clerk`)
- User sync endpoint (`/api/sync-user`)

### Middleware
Protected routes configured in `src/middleware.ts`:
- `/dashboard/*` - Requires authentication
- `/api/*` - Public (for webhooks)

## Database Schema

**Supabase** PostgreSQL with:
- `users` table - Synced from Clerk
- `analyses` table - Analysis results
- `screenshots` storage bucket - Page screenshots

Migrations in `supabase/migrations/`:
- `001_initial_schema.sql` - Core tables
- `002_rls_policies.sql` - Row-level security

## Task Master Integration

### Configuration
- **Config**: `.taskmaster/config.json`
- **Tasks**: `.taskmaster/tasks/tasks.json`
- **PRD**: `.taskmaster/docs/prd.txt`
- **Handoff**: `.taskmaster/docs/handoff.md`

### Development Workflow
1. `task-master next` - Get next available task
2. `task-master show <id>` - Review requirements
3. Implement the feature
4. `task-master update-subtask --id=<id> --prompt="notes"` - Log progress
5. `task-master set-status --id=<id> --status=done` - Complete

## MVP Features

### Phase 1 (Current)
- [x] Landing page with hero, pricing, CTA
- [x] Clerk authentication setup
- [x] Supabase database integration
- [ ] Free analysis (1/week limit)
- [ ] Analysis engine integration
- [ ] Results dashboard

### Phase 2
- [ ] Stripe payment integration
- [ ] Pro tier ($29-49/mo)
- [ ] Unlimited analyses for Pro
- [ ] Analysis history

### Phase 3
- [ ] Team accounts
- [ ] White-label reports
- [ ] API access

## Environment Variables

Required in `.env.local`:
```bash
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
CLERK_WEBHOOK_SECRET=whsec_...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Railway Analysis Service (when deployed)
ANALYSIS_SERVICE_URL=https://...
```

See `env.example` for template.

## Cursor Rules

Available in `.cursor/rules/`:
- `project-identity.mdc` - Project context
- `wake-up-protocol.mdc` - Session start
- `wrap-up-protocol.mdc` - Session end
- `cursor_rules.mdc` - General rules
- `self_improve.mdc` - Learning patterns
- `taskmaster/` - TaskMaster integration

## Claude Rules

Available in `.claude/rules/`:
- `project-identity.md` - Project context
- `wake-up-protocol.md` - Session start
- `wrap-up-protocol.md` - Session end

## Success Metrics

- **Month 1**: 100 free signups (validation)
- **Month 2**: 500 signups + 10% conversion = 50 paid users
- **Month 6**: 5,000 signups + 500 paid users = $14,500 MRR

## Important Notes

### UK English
All content should use UK English spelling and grammar.

### Performance Targets
- Lighthouse scores: 90+ across all categories
- Analysis time: < 30 seconds per page
- Dashboard load: < 2 seconds

### Security
- All user data protected by Supabase RLS
- Clerk handles authentication securely
- API keys never exposed to client

## References

- **PRD**: `.taskmaster/docs/prd.txt`
- **Handoff**: `.taskmaster/docs/handoff.md`
- **Clerk Setup**: `CLERK_SETUP.md`
- **Supabase Setup**: `supabase/SETUP.md`
- **Quick Start**: `QUICK_START_PROTOCOLS.md`

---

*Built with ❤️ for founders who deserve design confidence*

