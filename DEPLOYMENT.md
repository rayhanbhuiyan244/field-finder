# Field Finder - Vercel Deployment Guide

## ✅ What's Fixed

- ✅ Firebase credentials added to `.env`
- ✅ `vercel.json` configuration created
- ✅ All environment variables configured
- ✅ TanStack Start SSR setup verified
- ✅ Error handling in place

## 🚀 Deploy Steps

### 1. Push to GitHub

```bash
# Navigate to your project
cd field-finder-front-main

# Ensure git is initialized
git init

# Add remote (replace with your GitHub repo URL)
git remote add origin https://github.com/YOUR_USERNAME/field-finder-front.git

# Stage all changes
git add .

# Commit
git commit -m "fix: add Firebase credentials and Vercel config"

# Push to main branch
git branch -M main
git push -u origin main
```

### 2. Configure Vercel Environment Variables

Go to **Vercel Dashboard → Your Project → Settings → Environment Variables**

Add these 6 variables:

```
VITE_FIREBASE_API_KEY=AIzaSyAnn4fsUpqBoZoi3xd5IjfbQ1M35Woe5Vo
VITE_FIREBASE_AUTH_DOMAIN=field-96c85.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=field-96c85
VITE_FIREBASE_STORAGE_BUCKET=field-96c85.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=353626144886
VITE_FIREBASE_APP_ID=1:353626144886:web:6a1b2f4bcce12185a29f57
```

### 3. Redeploy

- **Option A:** Vercel auto-deploys after git push
- **Option B:** Manual: Dashboard → Deployments → Redeploy

## ✔️ Compatibility Checklist

- [x] **Framework**: TanStack Start (SSR-compatible on Vercel)
- [x] **Build**: Nitro with Cloudflare Workers target (auto-handled)
- [x] **Node.js**: ^22.16.5 (Vercel supports)
- [x] **TypeScript**: 5.8.3 (no issues)
- [x] **Firebase**: Client-side only (safe for Vercel)
- [x] **Error Handling**: SSR error page configured
- [x] **Environment Variables**: All configured

## 🔍 Troubleshooting

### Still getting 500 error?
1. Check **Vercel Build Logs**: Dashboard → Deployments → Latest → Logs
2. Verify **Environment Variables** are added in Vercel
3. Check **Function** duration: should be < 30s
4. Look for **Firebase Auth errors** in Runtime Logs

### Build fails?
```bash
# Test locally first
npm install
npm run build
npm run preview
```

### Routes not found (404)?
- Make sure all route files are in `src/routes/`
- Check `routeTree.gen.ts` is generated
- Rebuild: `npm run build`

## 📊 Deployment Status

Once deployed, visit:
- **Production**: `https://your-vercel-domain.vercel.app`
- **Preview**: Created on each PR

Monitor via Vercel Analytics dashboard.
