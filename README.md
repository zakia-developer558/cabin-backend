# Cabin Booking Backend

## Vercel Deployment Setup

This backend is configured to deploy on Vercel as serverless functions.

### Environment Variables Required

Set these environment variables in your Vercel dashboard:

```
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_CLIENT_ID=your_client_id (optional)
FIREBASE_CLIENT_X509_CERT_URL=your_cert_url (optional)
FRONTEND_URL=https://your-frontend-domain.vercel.app
JWT_SECRET=your_jwt_secret
SENDGRID_API_KEY=your_sendgrid_key (if using email)
```

### Deployment Steps

1. Install Vercel CLI: `npm i -g vercel`
2. Login to Vercel: `vercel login`
3. Deploy: `vercel --prod`

### Local Development

```bash
npm install
npm run dev
```

### API Endpoints

All endpoints are prefixed with `/v1`:

- `/v1/auth/*` - Authentication routes
- `/v1/cabins/*` - Cabin management routes
- `/health` - Health check endpoint

### Notes

- The app is configured as a serverless function in `api/index.js`
- Firebase is initialized once per cold start
- CORS is configured for production frontend URL