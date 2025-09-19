// Simple deployment verification script
import fetch from 'node-fetch';

const BASE_URL = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';

async function checkDeployment() {
  console.log('🚀 Checking deployment at:', BASE_URL);
  
  try {
    // Test health endpoint
    console.log('\n1. Testing health endpoint...');
    const healthResponse = await fetch(`${BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);
    
    // Test API endpoint
    console.log('\n2. Testing API endpoint...');
    const apiResponse = await fetch(`${BASE_URL}/v1/cabins`);
    const apiData = await apiResponse.json();
    console.log('✅ API response:', apiData);
    
    console.log('\n🎉 Deployment verification completed successfully!');
  } catch (error) {
    console.error('❌ Deployment verification failed:', error.message);
    process.exit(1);
  }
}

checkDeployment();