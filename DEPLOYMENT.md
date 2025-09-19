# Vercel Deployment Guide

## Pre-deployment Checklist

### 1. Environment Variables
Ensure these environment variables are set in your Vercel dashboard:

```
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_CLIENT_ID=your_client_id (optional)
FIREBASE_CLIENT_X509_CERT_URL=your_cert_url (optional)
FRONTEND_URL=https://your-frontend-domain.vercel.app
JWT_SECRET=your_jwt_secret_key
SENDGRID_API_KEY=your_sendgrid_key (if using email)
SENDGRID_FROM_EMAIL=your_verified_sender_email
```

### 2. Important Notes
- **FIREBASE_PRIVATE_KEY**: Must include the full private key with `\n` characters for line breaks
- **FRONTEND_URL**: Update this to your actual frontend domain
- **JWT_SECRET**: Use a strong, random secret key

## Deployment Steps

### Option 1: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

### Option 2: GitHub Integration
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically on push

## Configuration Changes Made

### 1. Updated `vercel.json`
- Added proper file inclusion with `includeFiles: "src/**"`
- Configured specific routes for `/health` and `/v1/*`
- Set memory limit to 1024MB
- Specified Node.js 18.x runtime
- Added rewrites for proper routing

### 2. Updated `package.json`
- Downgraded Express to v4.18.2 (better Vercel compatibility)
- Added Node.js engine requirement
- Updated start script to use `api/index.js`

### 3. Enhanced `api/index.js`
- Added request timeout handling (25s limit)
- Improved CORS configuration
- Enhanced error handling for different error types
- Added 404 handler for unmatched routes
- Increased JSON payload limits

### 4. Updated `.vercelignore`
- Removed exclusion of `src/server.js` to allow access to src directory
- Kept exclusion of unnecessary files

## Testing Deployment

After deployment, test these endpoints:

1. **Health Check**: `GET /health`
2. **API Test**: `GET /v1/cabins`
3. **404 Test**: `GET /nonexistent-route`

## Common Issues & Solutions

### 1. Firebase Initialization Error
- **Problem**: Missing or incorrect Firebase environment variables
- **Solution**: Double-check all Firebase env vars, especially `FIREBASE_PRIVATE_KEY` formatting

### 2. Function Timeout
- **Problem**: Requests taking longer than 30 seconds
- **Solution**: Optimize database queries, add request timeout middleware

### 3. CORS Issues
- **Problem**: Frontend can't access API
- **Solution**: Update `FRONTEND_URL` environment variable with correct domain

### 4. Module Not Found
- **Problem**: Serverless function can't find modules
- **Solution**: Ensure `includeFiles: "src/**"` is in vercel.json build config

### 5. Express Version Issues
- **Problem**: Express v5 compatibility issues with Vercel
- **Solution**: Use Express v4.18.2 (already updated)

## Monitoring

- Check Vercel function logs for errors
- Monitor function execution time
- Test all API endpoints after deployment
- Verify Firebase connection in logs

## Performance Tips

1. **Cold Start Optimization**: Firebase is initialized once per cold start
2. **Memory Usage**: Set to 1024MB for better performance
3. **Timeout Handling**: 25s request timeout to prevent Vercel timeouts
4. **Error Handling**: Comprehensive error responses for debugging

## Support

If you encounter issues:
1. Check Vercel function logs
2. Verify environment variables
3. Test locally with `npm run dev`
4. Check Firebase console for authentication issues