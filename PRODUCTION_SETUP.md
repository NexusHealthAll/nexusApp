# Production Setup Guide

## ✅ Deployment Successful!

Your NexusApp is now deployed to Cloudflare Pages.

## 🔧 Configure Backend URL

Your backend is running at: `https://nexuscare-backend-8o2l.onrender.com`

### Set Environment Variables in Cloudflare Pages:

1. Go to your Cloudflare Pages dashboard
2. Select your **nexusapp** project
3. Navigate to **Settings** → **Environment variables**
4. Add the following variables:

#### For Production:
```
VITE_API_BASE_URL=https://nexuscare-backend-8o2l.onrender.com
```

#### Optional (if using Firebase for waitlist):
```
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id_here
VITE_FIREBASE_WAITLIST_COLLECTION=your_collection_name_here
```

#### Optional (if using Paystack for payments):
```
VITE_PAYSTACK_PUBLIC_KEY=your_paystack_public_key_here
```

5. **Save** the environment variables
6. **Trigger a new deployment** for the changes to take effect

### Alternative: Create .env file (for local development only)

Create a `.env` file in the root directory (this is already .gitignored):

```env
VITE_API_BASE_URL=https://nexuscare-backend-8o2l.onrender.com
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id_here
VITE_FIREBASE_WAITLIST_COLLECTION=your_collection_name_here
VITE_PAYSTACK_PUBLIC_KEY=your_paystack_public_key_here
```

**Note:** The `.env` file is for local development only and won't be used in production. Production uses Cloudflare Pages environment variables.

## 🔐 CORS Configuration

Make sure your backend at `https://nexuscare-backend-8o2l.onrender.com` allows CORS requests from your Cloudflare Pages domain.

Add your Cloudflare Pages URL to the backend's CORS allowed origins:
- `https://nexusapp.pages.dev` (or your custom domain)

## 🚀 Deploy Changes

After adding environment variables in Cloudflare:
1. Go to **Deployments** tab
2. Click **Retry deployment** on the latest build, OR
3. Push a new commit to trigger automatic deployment

## ✅ Verify Connection

After deployment with the new environment variables:
1. Open your deployed app
2. Check browser console for API calls
3. Verify requests are going to `https://nexuscare-backend-8o2l.onrender.com`

## 📝 Default Behavior

If `VITE_API_BASE_URL` is not set, the app defaults to:
```
http://0.0.0.0:8080
```

This is only for local development and won't work in production.

## 🎯 Summary

- ✅ Frontend deployed to Cloudflare Pages
- ✅ Backend running at: `https://nexuscare-backend-8o2l.onrender.com`
- ⏳ **Next step**: Add `VITE_API_BASE_URL` environment variable in Cloudflare Pages
- ⏳ **Then**: Redeploy to apply changes
