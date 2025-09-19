import express from "express";
import routes from "../src/routes/index.js";
import dotenv from "dotenv";
import cors from "cors";
import admin from "firebase-admin";

// Load environment variables
dotenv.config();

// Add request timeout for serverless
const REQUEST_TIMEOUT = 25000; // 25 seconds (less than Vercel's 30s limit)

// Check if Firebase environment variables are set
const requiredFirebaseVars = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_PRIVATE_KEY_ID',
  'FIREBASE_PRIVATE_KEY',
  'FIREBASE_CLIENT_EMAIL'
];

// Initialize Firebase only if not already initialized
if (!admin.apps.length) {
  console.log('🔍 Checking Firebase environment variables...');
  
  const missingVars = requiredFirebaseVars.filter(varName => !process.env[varName] || process.env[varName].trim() === '');
  
  if (missingVars.length > 0) {
    console.error('❌ Missing required Firebase environment variables:', missingVars.join(', '));
    throw new Error(`Missing Firebase environment variables: ${missingVars.join(', ')}`);
  }
  
  console.log('✅ All Firebase environment variables found');
  
  // Initialize Firebase with real credentials
  const serviceAccount = {
    type: 'service_account',
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID || '',
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL || ''
  };

  console.log('🔧 Initializing Firebase with service account...');
  
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID
    });
    console.log("✅ Firebase initialized successfully with service account credentials");
  } catch (error) {
    console.error('❌ Firebase initialization error:', error.message);
    throw error;
  }
}

// Create Express app
const app = express();

// Middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request timeout middleware for serverless
app.use((req, res, next) => {
  req.setTimeout(REQUEST_TIMEOUT, () => {
    res.status(408).json({ success: false, message: 'Request timeout' });
  });
  next();
});

// CORS configuration for production
app.use(cors({
  origin: process.env.FRONTEND_URL || "https://your-frontend-domain.vercel.app",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Use routes
app.use("/v1", routes);

// 404 handler for unmatched routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      error: err.message
    });
  }
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized'
    });
  }
  
  // Default error response
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Export the Express app as a serverless function
export default app;