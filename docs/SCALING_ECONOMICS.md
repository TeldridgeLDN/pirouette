# Pirouette Scaling Economics

> **Last Updated:** November 2025  
> **Purpose:** Track infrastructure costs, tier limits, and profitability thresholds

---

## Current Service Stack

| Service | Purpose | Tier | Monthly Cost |
|---------|---------|------|--------------|
| **Vercel** | Frontend hosting, API routes | Free/Hobby | £0 |
| **Railway** | Analysis worker (Playwright) | Hobby | ~£4 (~$5) |
| **Supabase** | PostgreSQL database, file storage | Free | £0 |
| **Clerk** | Authentication | Free | £0 |
| **Stripe** | Payment processing | N/A | 2.9% + 20p/txn |
| **Domain** | pirouette.app | Annual | ~£1/mo |

**Total Minimum Operating Cost: ~£5/month**

---

## Tier Limits & Upgrade Triggers

### Vercel (Free → Pro £16/mo)

| Metric | Free Tier Limit | Pro Tier |
|--------|-----------------|----------|
| **Bandwidth** | 100 GB/month | 1 TB/month |
| **Serverless Invocations** | 1 million/month | 10 million/month |
| **Build Time** | 100 hours/month | 400 hours/month |
| **Deployments** | 100/day | Unlimited |
| **Commercial Use** | ❌ Not allowed | ✅ Allowed |

**Upgrade Triggers:**
- ⚠️ Commercial use requires Pro (technically Day 1)
- ~20,000-50,000 monthly visitors (bandwidth)
- High API usage approaching 1M invocations

### Railway (Hobby £4/mo → Usage-based)

| Metric | Hobby Plan | Pro Plan |
|--------|------------|----------|
| **Included Credit** | $5/month | Usage-based |
| **Memory** | 0.5 GB/service | Configurable |
| **CPU** | 1 vCPU | Configurable |
| **Sleep** | After 10 min inactive | Always on |

**Upgrade Triggers:**
- Heavy Playwright usage exceeds $5 credit
- Need for continuous uptime (no sleep)
- ~200-300 analyses/month exceeds credit

**Note:** Railway is the most variable cost. Playwright analysis is CPU/memory intensive. Monitor usage closely.

### Supabase (Free → Pro £20/mo)

| Metric | Free Tier Limit | Pro Tier |
|--------|-----------------|----------|
| **Database Storage** | 500 MB | 8 GB |
| **Monthly Active Users** | 50,000 MAU | 100,000 MAU |
| **File Storage** | 1 GB | 100 GB |
| **Bandwidth** | 5 GB | 250 GB |
| **Projects** | 2 | Unlimited |

**Upgrade Triggers:**
- 🚨 **File storage (screenshots)** - Hit first at ~200 analyses (5MB/screenshot)
- Database exceeds 500 MB (~5,000-10,000 reports)
- User signups exceed 50,000 MAU

**Recommendation:** Likely first service to upgrade due to screenshot storage.

### Clerk (Free → Pro ~£20/mo)

| Metric | Free Tier Limit | Pro Tier |
|--------|-----------------|----------|
| **Monthly Active Users** | 10,000 MAU | 100,000 MAU |
| **Social Logins** | ✅ Included | ✅ Included |
| **Custom Domains** | ❌ | ✅ |

**Upgrade Triggers:**
- Logged-in users exceed 10,000/month
- Need for custom auth domain

**Note:** Anonymous analyses don't count toward MAU. Only registered users who log in.

### Stripe (No Base Fee)

| Fee Type | Amount |
|----------|--------|
| **UK Cards** | 1.5% + 20p |
| **EU Cards** | 2.5% + 20p |
| **International** | 3.25% + 20p |
| **Effective Average** | ~3-3.5% |

**At £29/mo Pro tier:**
- Stripe fee: ~£1.04/transaction (3.6% effective)
- Net revenue: ~£27.96/customer

---

## Profitability Analysis

### Break-Even Calculation

| Scenario | Users Required | MRR |
|----------|----------------|-----|
| **Cover base costs (£5/mo)** | 1 Pro user | £29 |
| **Cover upgraded stack (~£60/mo)** | 3 Pro users | £87 |
| **10% profit margin** | 1-2 Pro users | £29-58 |

**Key Insight:** Profitable from first paying customer with current stack.

### Revenue Projections

| Stage | Monthly Signups | Paid Users (10%) | MRR | Est. Costs | Net Profit |
|-------|-----------------|------------------|-----|------------|------------|
| **Launch** | 100 | 10 | £290 | £5 | £285 |
| **Month 2** | 500 | 50 | £1,450 | £25 | £1,425 |
| **Month 3** | 1,000 | 100 | £2,900 | £70 | £2,830 |
| **Month 6** | 5,000 | 500 | £14,500 | £150 | £14,350 |
| **Month 12** | 10,000 | 1,000 | £29,000 | £300 | £28,700 |

*Costs include gradual tier upgrades as usage grows*

---

## Upgrade Timeline Predictions

| Milestone | Likely Upgrade | Est. Timing | Added Cost |
|-----------|----------------|-------------|------------|
| **200+ analyses** | Supabase Pro (storage) | Month 1-2 | +£20/mo |
| **Commercial launch** | Vercel Pro (compliance) | Month 1 | +£16/mo |
| **10K+ signups** | Clerk Pro | Month 4-6 | +£20/mo |
| **Heavy analysis load** | Railway usage overage | Month 3+ | +£10-50/mo |
| **50K+ visitors** | Vercel bandwidth | Month 6+ | Included in Pro |

**Estimated upgraded stack cost at ~500 users: £70-100/month**

---

## Cost Optimization Strategies

### 1. Screenshot Storage (Supabase)
- Implement image compression (reduce 5MB → 1-2MB)
- Consider CDN caching for frequently accessed screenshots
- Auto-delete old screenshots after 90 days (free tier)

### 2. Railway Compute
- Implement analysis caching (same URL within 24h)
- Queue management to batch off-peak analyses
- Consider Playwright optimization (disable unnecessary features)

### 3. Vercel Functions
- Implement edge caching for report pages
- Minimize serverless function cold starts
- Consider ISR for static content

### 4. Database Efficiency
- Index optimization for common queries
- Archive old analysis data to cold storage
- Regular VACUUM for PostgreSQL

---

## Monitoring Checklist

### Weekly
- [ ] Railway usage dashboard (credit consumption)
- [ ] Supabase storage usage (screenshots + database)
- [ ] Vercel bandwidth usage

### Monthly
- [ ] Clerk MAU count
- [ ] Stripe transaction fees vs revenue
- [ ] Overall cost vs MRR ratio

### Quarterly
- [ ] Review tier limits vs usage trends
- [ ] Plan upgrades for next quarter
- [ ] Update projections based on actual data

---

## Key Metrics to Track

```
Gross Margin = (MRR - Infrastructure Costs) / MRR × 100

Target: >95% gross margin (SaaS benchmark: 70-80%)

Current (at £5/mo costs, 10 users):
Gross Margin = (£290 - £5) / £290 × 100 = 98.3% ✅
```

---

## Emergency Scaling Playbook

### If Supabase storage fills suddenly:
1. Enable image compression immediately
2. Upgrade to Pro ($25/mo)
3. Implement cleanup job for old screenshots

### If Railway credits deplete mid-month:
1. Add payment method for overage
2. Review analysis queue for stuck jobs
3. Implement stricter rate limiting temporarily

### If Vercel bandwidth spikes:
1. Check for bot traffic / abuse
2. Enable edge caching if not already
3. Upgrade to Pro if legitimate traffic

---

## References

- [Vercel Pricing](https://vercel.com/pricing)
- [Railway Pricing](https://railway.app/pricing)
- [Supabase Pricing](https://supabase.com/pricing)
- [Clerk Pricing](https://clerk.com/pricing)
- [Stripe Fees (UK)](https://stripe.com/gb/pricing)

---

*This document should be reviewed and updated monthly as the product scales.*

