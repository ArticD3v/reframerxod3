# Vercel Deployment Guide

This guide will help you deploy your Next.js application to Vercel.

## Prerequisites

- A GitHub account with your repository pushed
- A Vercel account (free tier is perfect for this)

## One-Click Deployment Steps

### 1. Push Your Code to GitHub

Make sure all your latest changes are pushed:

```bash
git add .
git commit -m "Migrated from Firebase to Supabase, configured Gemini AI"
git push origin main
```

### 2. Deploy to Vercel

**Option A: Via Vercel Dashboard (Recommended)**

1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign Up"** or **"Login"** (use your GitHub account)
3. Click **"New Project"**
4. **Import your repository** from GitHub
5. Vercel will auto-detect it's a Next.js project ✅
6. **Configure Environment Variables:**
   - Click "Environment Variables"
   - Add these three variables:
     ```
     NEXT_PUBLIC_SUPABASE_URL = https://ykgykpsocuxijdpvsbbe.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlrZ3lrcHNvY3V4aWpkcHZzYmJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0NDQ4NzYsImV4cCI6MjA4MDAyMDg3Nn0.e4AVEHkHgKzjXyygfCSSKOxRmCSvKkK1hBpCcORe7vQ
     GEMINI_API_KEY = your_gemini_api_key_here
     ```
7. Click **"Deploy"**

**Option B: Via Vercel CLI**

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy (from your project root)
vercel

# Follow the prompts:
# - Set up and deploy? Y
# - Which scope? (select your account)
# - Link to existing project? N
# - What's your project's name? reframerxod3
# - In which directory is your code located? ./
# - Vercel will auto-detect Next.js settings
```

### 3. Add Environment Variables (CLI Method)

If using CLI, add your environment variables:

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
# Paste: https://ykgykpsocuxijdpvsbbe.supabase.co

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# Paste: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlrZ3lrcHNvY3V4aWpkcHZzYmJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0NDQ4NzYsImV4cCI6MjA4MDAyMDg3Nn0.e4AVEHkHgKzjXyygfCSSKOxRmCSvKkK1hBpCcORe7vQ

vercel env add GEMINI_API_KEY
# Paste: your_gemini_api_key
```

Then redeploy:

```bash
vercel --prod
```

## What Vercel Does Automatically

✅ **Detects Next.js** - No configuration needed!  
✅ **Optimizes Build** - Automatic static optimization  
✅ **CDN Deployment** - Global edge network  
✅ **Auto HTTPS** - Free SSL certificate  
✅ **Preview Deployments** - Every git push gets a preview URL  
✅ **Production Deployment** - Merges to main branch auto-deploy  

## Post-Deployment

After deployment, you'll get:

1. **Production URL**: `https://your-project.vercel.app`
2. **Preview URLs**: For every branch/PR
3. **Deployment Dashboard**: Monitor builds and logs

## Updating Supabase Redirect URLs

Don't forget to add your Vercel URLs to Supabase:

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **URL Configuration**
3. Add your Vercel URLs to **Redirect URLs**:
   ```
   https://your-project.vercel.app/*
   https://your-project.vercel.app/auth/callback
   ```

## Automatic Deployments

Once set up, Vercel will automatically:
- Deploy when you push to `main` branch (Production)
- Create preview deployments for other branches
- Run builds on every PR

## Troubleshooting

**Build fails?**
- Check the build logs in Vercel dashboard
- Ensure all environment variables are set correctly
- Make sure `.env.local` is in `.gitignore` (it should be)

**App works locally but not on Vercel?**
- Verify environment variables are set in Vercel project settings
- Check if there are any references to `localhost` that need updating

## Next Steps

After your first deployment:

1. ✅ Add Vercel URLs to Supabase
2. ✅ Test authentication flow on production
3. ✅ Test journal rephrasing with Gemini AI
4. ✅ Set up custom domain (optional)

---

**That's it!** Vercel will handle everything else automatically. 🚀
