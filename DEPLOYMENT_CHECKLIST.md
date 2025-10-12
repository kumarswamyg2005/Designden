# Vercel Deployment Checklist

## ✅ Code Fixes (ALL DONE)

- [x] Fixed dependency conflicts
- [x] Created api/index.js for serverless
- [x] Updated vercel.json configuration
- [x] Added MongoDB connection pooling
- [x] Exported app module properly
- [x] Added error handling for production
- [x] Pushed all changes to GitHub

## ⚠️ YOU MUST DO IN VERCEL DASHBOARD:

### Step 1: Add Environment Variables

Go to your Vercel project → Settings → Environment Variables

Add this variable:

```
Name: MONGODB_URI
Value: mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/designden?retryWrites=true&w=majority
```

**Replace:**

- YOUR_USERNAME with your MongoDB username
- YOUR_PASSWORD with your MongoDB password
- YOUR_CLUSTER with your cluster address

### Step 2: Check MongoDB Atlas Network Access

1. Go to MongoDB Atlas dashboard
2. Click "Network Access" in left sidebar
3. Click "Add IP Address"
4. Select "Allow Access from Anywhere" (0.0.0.0/0)
5. Click "Confirm"

### Step 3: Redeploy in Vercel

1. Go to your Vercel project
2. Click "Deployments" tab
3. Click the three dots (...) on the latest deployment
4. Click "Redeploy"
5. Wait for deployment to complete

## Common Issues & Solutions:

### "Internal Server Error"

- **Cause**: Missing MONGODB_URI environment variable
- **Solution**: Add MONGODB_URI in Vercel settings, then redeploy

### "Cannot connect to MongoDB"

- **Cause**: MongoDB Atlas blocking Vercel's IP
- **Solution**: Allow 0.0.0.0/0 in MongoDB Atlas Network Access

### "Module not found"

- **Cause**: Dependencies not installed correctly
- **Solution**: Already fixed with .npmrc and package.json updates

### Static files not loading (CSS/images)

- **Cause**: Path issues in serverless environment
- **Solution**: Already handled with proper Express static middleware

## Testing After Deployment:

1. Visit your Vercel URL
2. Try to login with: admin@designden.com / admin123
3. Check if images and CSS load correctly
4. Test the cart functionality
5. Toggle dark mode

## Need Help?

If you still see errors after following all steps, check:

1. Vercel deployment logs (in Vercel dashboard)
2. MongoDB Atlas logs (in Atlas dashboard)
3. Browser console for JavaScript errors
