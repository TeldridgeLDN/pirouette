# Clerk Authentication Setup Guide

This guide walks you through configuring Clerk webhooks and testing the authentication flow.

---

## ✅ What's Already Done

- ✅ Clerk package installed (`@clerk/nextjs`, `svix`)
- ✅ ClerkProvider added to root layout
- ✅ Middleware configured for protected routes
- ✅ Sign-in page created (`/sign-in`)
- ✅ Sign-up page created (`/sign-up`)
- ✅ Dashboard created (`/dashboard`)
- ✅ Webhook handler created (`/api/webhooks/clerk`)

---

## 📝 Step 1: Configure Clerk Webhook

The webhook syncs user data from Clerk to your Supabase database.

### **1.1: Get Webhook Secret**

1. Go to your Clerk dashboard: [https://dashboard.clerk.com](https://dashboard.clerk.com)
2. Select your **Pirouette** application
3. In the left sidebar, click **"Webhooks"**
4. Click **"Add Endpoint"**
5. Configure the endpoint:
   - **Endpoint URL:** `https://YOUR_DOMAIN/api/webhooks/clerk`
     - For local testing: Use [ngrok](https://ngrok.com) or similar
     - For production: `https://pirouette.vercel.app/api/webhooks/clerk`
   - **Subscribe to events:**
     - ✅ `user.created`
     - ✅ `user.updated`
     - ✅ `user.deleted`
6. Click **"Create"**
7. Copy the **Signing Secret** (starts with `whsec_...`)

### **1.2: Add Webhook Secret to Environment**

Add this to your `.env.local`:

```bash
# Clerk Webhook (ADD THIS)
CLERK_WEBHOOK_SECRET=whsec_xxxxx
```

---

## 🧪 Step 2: Test Authentication Flow

### **2.1: Start Development Server**

```bash
npm run dev
```

Your app should be running at `http://localhost:3001`

### **2.2: Test Sign-Up**

1. Go to: `http://localhost:3001/sign-up`
2. Enter your email and create a password
3. Complete email verification (check your inbox)
4. You should be redirected to `/dashboard`

**Check Supabase:**
- Go to Supabase dashboard → **Table Editor** → **users**
- You should see your new user with:
  - `clerk_id` matching your Clerk user ID
  - `email` matching your sign-up email
  - `plan` set to `'free'`

### **2.3: Test Sign-In**

1. Sign out (if you're signed in)
2. Go to: `http://localhost:3001/sign-in`
3. Enter your credentials
4. You should be redirected to `/dashboard`

### **2.4: Test Protected Routes**

1. Sign out
2. Try to access: `http://localhost:3001/dashboard`
3. You should be redirected to `/sign-in`

---

## 🔐 Step 3: Configure OAuth Providers (Optional)

### **3.1: Add Google OAuth**

1. In Clerk dashboard, go to **"User & Authentication"** → **"Social Connections"**
2. Click **"Add social connection"**
3. Select **Google**
4. Follow instructions to:
   - Create Google OAuth app
   - Add Clerk redirect URLs
   - Copy Client ID and Secret
5. Save configuration

### **3.2: Add GitHub OAuth**

1. Same process as Google
2. Select **GitHub**
3. Follow instructions for GitHub OAuth app setup

### **3.3: Test OAuth**

1. Go to `/sign-up` or `/sign-in`
2. You should see buttons for "Continue with Google" and "Continue with GitHub"
3. Click one and complete OAuth flow
4. User should be created in both Clerk and Supabase

---

## 🧪 Testing Checklist

### **Basic Authentication**
- [ ] User can sign up with email/password
- [ ] Email verification works
- [ ] User can sign in
- [ ] User can sign out
- [ ] Password reset works (check Clerk settings)

### **Database Sync**
- [ ] User created in Supabase on sign-up
- [ ] User data matches Clerk data
- [ ] User updated in Supabase when Clerk profile changes
- [ ] User deleted from Supabase when deleted from Clerk

### **Route Protection**
- [ ] `/dashboard` requires authentication
- [ ] Unauthenticated users redirected to `/sign-in`
- [ ] After sign-in, user redirected to `/dashboard`
- [ ] `/api/test-supabase` is accessible (public route)

### **OAuth (if configured)**
- [ ] Google sign-in works
- [ ] GitHub sign-in works
- [ ] OAuth users created in Supabase

---

## 🐛 Troubleshooting

### Issue: "Clerk keys not found"
**Solution:** 
- Make sure `.env.local` has `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`
- Restart dev server after adding env vars

### Issue: "Webhook failing"
**Solution:**
- Check `CLERK_WEBHOOK_SECRET` is set correctly
- For local testing, use ngrok: `ngrok http 3001`
- Update webhook URL in Clerk dashboard to ngrok URL

### Issue: "User not created in Supabase"
**Solution:**
- Check webhook logs in Clerk dashboard
- Check Next.js terminal for errors
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set
- Test webhook manually: Clerk dashboard → Webhooks → Send test event

### Issue: "Middleware redirecting all routes"
**Solution:**
- Check `src/middleware.ts` public routes list
- Make sure `/sign-in` and `/sign-up` are in `isPublicRoute` matcher

---

## 📊 Environment Variables Checklist

Your `.env.local` should now have:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
CLERK_WEBHOOK_SECRET=whsec_xxxxx

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

---

## 🎯 What's Next

After Clerk is set up:

1. **Task 10:** Build API routes for analysis job submission
2. **Task 14:** Enhance dashboard with analysis history
3. **Task 13:** Integrate Stripe for payment plans

---

## 🔄 User Flow

```
1. User visits / (landing page)
2. User clicks "Get Started"
3. User directed to /sign-up
4. User creates account (email or OAuth)
5. Clerk webhook fires → User created in Supabase
6. User redirected to /dashboard
7. User can submit landing page URLs for analysis
```

---

**Setup Complete!** 🎉

Your authentication is now fully integrated with Supabase user sync.

