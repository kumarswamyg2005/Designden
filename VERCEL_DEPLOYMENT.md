# Vercel Deployment Guide

## Latest Updates (Fixed Internal Server Error):
✅ Fixed dependency conflict (date-fns downgraded to v3.6.0)
✅ Added .npmrc for legacy peer dependencies
✅ Created api/index.js for Vercel serverless functions
✅ Updated vercel.json to use api/index.js
✅ Modified app.js to export properly for serverless
✅ Enhanced MongoDB connection with connection pooling
✅ Added error handling for production environment

## Environment Variables Required in Vercel:

**CRITICAL**: You MUST add these environment variables in your Vercel project settings:

1. **MONGODB_URI** (REQUIRED) - Your MongoDB connection string
   Example: `mongodb+srv://username:password@cluster.mongodb.net/designden?retryWrites=true&w=majority`
   
   ⚠️ **Without this, you'll get "Internal Server Error"**

2. **SESSION_SECRET** (OPTIONAL) - A random secret string for session encryption
   Example: `your-super-secret-session-key-here-make-it-long-and-random`

3. **NODE_ENV** (Auto-set by Vercel)
   Vercel sets this to: `production`

## How to Add Environment Variables in Vercel:

1. Go to your Vercel project dashboard
2. Click on "Settings"
3. Click on "Environment Variables" in the left sidebar
4. Add each variable with:
   - Key: Variable name (e.g., MONGODB_URI)
   - Value: Your actual value
   - Environment: Select "Production", "Preview", and "Development"
5. Click "Save"

## After Adding Environment Variables:

1. Go to "Deployments" tab
2. Click "Redeploy" on the latest deployment
3. Your app should now deploy successfully!

## Important Notes:

⚠️ **MongoDB Connection**: Make sure your MongoDB Atlas (or other MongoDB service) allows connections from Vercel's IP addresses. In MongoDB Atlas:

- Go to Network Access
- Add IP Address: 0.0.0.0/0 (allow from anywhere)
- Or add Vercel's specific IP ranges

⚠️ **Static Files**: Your public folder with images, CSS, and JS should deploy automatically

⚠️ **Sessions**: Express sessions might not work perfectly on Vercel's serverless environment. Consider using JWT tokens or external session storage (Redis) for production.

## Vercel Deployment:

Your app is now ready to deploy! Try redeploying in Vercel.
