# 🎭 Pirouette

**Design Confidence, Backed by Data**

Pirouette is a SaaS tool that analyzes landing page designs and provides data-driven recommendations based on patterns from 50+ award-winning sites.

## 🎯 Project Overview

- **Target Market**: Bootstrapped founders, agencies, e-commerce owners
- **Revenue Model**: Freemium ($0 → $29-49/mo)
- **Tech Stack**: Next.js 14 + Vercel (frontend), Railway (analysis), Supabase (database)
- **MVP Timeline**: 4 weeks to launch
- **Budget**: $5/mo (MVP costs)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📦 Tech Stack

### Frontend (Vercel)
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Clerk**: Authentication
- **Stripe**: Payment processing

### Backend (Railway)
- **Express**: API server
- **Playwright**: Headless browser for analysis
- **BullMQ**: Job queue management
- **Redis**: Queue and caching

### Database & Storage
- **Supabase**: PostgreSQL database
- **Supabase Storage**: Screenshot storage

## 📁 Project Structure

```
pirouette/
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── layout.tsx      # Root layout
│   │   ├── page.tsx        # Landing page
│   │   └── globals.css     # Global styles
│   ├── components/         # React components
│   ├── lib/               # Utilities and services
│   └── types/             # TypeScript types
├── public/                # Static assets
├── .taskmaster/          # TaskMaster project management
│   ├── docs/             # PRD and documentation
│   └── tasks/            # Task tracking
└── README.md

```

## 📚 Documentation

- **PRD**: `.taskmaster/docs/prd.txt` - Complete product requirements
- **Handoff Document**: `.taskmaster/docs/handoff.md` - Setup instructions
- **TaskMaster Tasks**: Use `task-master` CLI to view and manage tasks

## 🔧 Development Workflow

This project uses [TaskMaster](https://github.com/cyanheads/task-master-ai) for project management:

```bash
# View all tasks
task-master list

# Get next task to work on
task-master next

# View specific task
task-master show <id>

# Mark task complete
task-master set-status --id=<id> --status=done
```

## 🎯 MVP Features

- **Landing Page**: Hero, pricing, CTA
- **Authentication**: Email/password and Google OAuth
- **Free Analysis**: 1 analysis per week
- **Analysis Engine**: 7-dimensional design analysis
- **Analysis Reports**: Screenshots + recommendations
- **User Dashboard**: Analysis history and quota
- **Pro Upgrade**: $29 or $49/mo unlimited access

## 📊 Success Metrics

- **Month 1**: 100 free signups (validation)
- **Month 2**: 500 signups + 10% conversion = 50 paid users
- **Month 6**: 5,000 signups + 500 paid users = $14,500 MRR

## 🚨 Status

**Current Phase**: Initial Setup Complete ✅
**Next Steps**: Configure infrastructure services (Vercel, Supabase, Railway)

## 📧 Contact

For questions or support, contact the development team.

---

*Built with ❤️ for founders who deserve design confidence*

