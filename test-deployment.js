// Simple test script to verify deployment setup
import express from 'express';

const app = express();

app.get('/test', (req, res) => {
  res.json({ 
    message: 'Deployment test successful!', 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});