#!/usr/bin/env node

/**
 * TrustLens AI Verification Service Integration Script
 * 
 * This script helps integrate the AI verification microservice with the main TrustLens platform
 */

const fs = require('fs');
const path = require('path');

console.log('🤖 TrustLens AI Verification Service Integration');
console.log('================================================');

// Update main package.json with AI service scripts
const mainPackagePath = path.join(__dirname, 'package.json');
if (fs.existsSync(mainPackagePath)) {
  const packageJson = JSON.parse(fs.readFileSync(mainPackagePath, 'utf8'));
  
  // Add AI service scripts
  packageJson.scripts = {
    ...packageJson.scripts,
    'ai:install': 'cd ai-verification-service && npm install',
    'ai:start': 'cd ai-verification-service && npm start',
    'ai:dev': 'cd ai-verification-service && npm run dev',
    'ai:test': 'cd ai-verification-service && npm test',
    'ai:build': 'cd ai-verification-service && docker build -t trustlens-ai-verification .',
    'ai:docker': 'cd ai-verification-service && docker-compose up -d',
    'services:start': 'concurrently "npm run frontend:dev" "npm run ai:dev"',
    'install:all': 'npm install && cd frontend && npm install && cd ../ai-verification-service && npm install'
  };
  
  fs.writeFileSync(mainPackagePath, JSON.stringify(packageJson, null, 2));
  console.log('✅ Updated main package.json with AI service scripts');
}

// Create integration documentation
const integrationDoc = `
# TrustLens AI Verification Integration Guide

## Overview

The AI Verification Service provides intelligent task completion verification for the TrustLens escrow platform. It analyzes task descriptions against delivery summaries and provides completion scores and recommendations.

## Architecture

\`\`\`
TrustLens Platform
├── Frontend (React)          # User interface
├── Smart Contract (Sophia)   # Blockchain escrow logic  
├── AI Verification Service   # Task completion analysis
└── Integration Layer        # Connects all components
\`\`\`

## Quick Start

### 1. Install All Services

\`\`\`bash
npm run install:all
\`\`\`

### 2. Configure AI Service

\`\`\`bash
cd ai-verification-service
cp .env.example .env
# Edit .env with your OpenAI API key
\`\`\`

### 3. Start All Services

\`\`\`bash
# Development mode (all services)
npm run services:start

# Or start individually
npm run frontend:dev    # React app on :3000
npm run ai:dev          # AI service on :3001
\`\`\`

## API Integration

### Frontend Integration

Add AI verification to your React components:

\`\`\`javascript
import axios from 'axios';

const verifyTaskCompletion = async (taskDescription, deliverySummary) => {
  try {
    const response = await axios.post('http://localhost:3001/api/verification/verify', {
      taskDescription,
      deliverySummary
    });
    
    return response.data.data;
  } catch (error) {
    console.error('Verification failed:', error);
    throw error;
  }
};
\`\`\`

### Smart Contract Integration

Use verification results to trigger contract actions:

\`\`\`javascript
// Example integration with escrow contract
const handleVerificationResult = async (verificationResult) => {
  if (verificationResult.recommendation === 'release' && verificationResult.completionScore >= 70) {
    // Trigger smart contract release
    await contractService.release();
  } else {
    // Trigger dispute process
    await contractService.dispute('AI verification failed');
  }
};
\`\`\`

## Deployment

### Docker Deployment

\`\`\`bash
# Build and deploy AI service
npm run ai:docker

# Or build manually
npm run ai:build
\`\`\`

### Production Configuration

1. Set environment variables:
   - \`OPENAI_API_KEY\`: Your OpenAI API key
   - \`NODE_ENV=production\`
   - \`ALLOWED_ORIGINS\`: Frontend URLs

2. Deploy to your preferred platform:
   - AWS ECS/EKS
   - Google Cloud Run
   - Azure Container Instances
   - Heroku

## Monitoring

### Health Checks

- Basic: \`GET /api/health\`
- Detailed: \`GET /api/health/detailed\`
- Kubernetes: \`GET /api/health/ready\`, \`GET /api/health/live\`

### Logs

Logs are written to:
- Console (development)
- \`logs/combined.log\` (production)
- \`logs/error.log\` (errors only)

## Testing

\`\`\`bash
# Run AI service tests
npm run ai:test

# Test API endpoints
node ai-verification-service/examples/usage.js
\`\`\`

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| \`PORT\` | Service port | 3001 |
| \`OPENAI_API_KEY\` | OpenAI API key | Required |
| \`OPENAI_MODEL\` | AI model | gpt-3.5-turbo |
| \`LOG_LEVEL\` | Logging level | info |
| \`ALLOWED_ORIGINS\` | CORS origins | localhost:3000 |

### AI Models

- \`gpt-3.5-turbo\`: Fast, cost-effective (default)
- \`gpt-4\`: More accurate, slower
- \`gpt-4-turbo-preview\`: Balanced performance

## Troubleshooting

### Common Issues

1. **OpenAI API Key Error**
   - Ensure \`OPENAI_API_KEY\` is set in .env
   - Check API key validity and quota

2. **CORS Errors**
   - Update \`ALLOWED_ORIGINS\` in .env
   - Ensure frontend URL is included

3. **Rate Limiting**
   - OpenAI has rate limits
   - Consider upgrading API plan
   - Implement request queuing

### Support

- Check logs in \`ai-verification-service/logs/\`
- Monitor health endpoints
- Review OpenAI API status
`;

fs.writeFileSync(path.join(__dirname, 'AI_INTEGRATION.md'), integrationDoc);
console.log('✅ Created AI integration documentation');

// Create Docker Compose for full stack
const dockerComposeContent = `version: '3.8'

services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - VITE_AI_SERVICE_URL=http://ai-verification:3001
    depends_on:
      - ai-verification
    networks:
      - trustlens-network

  ai-verification:
    build: ./ai-verification-service
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - OPENAI_API_KEY=\${OPENAI_API_KEY}
      - OPENAI_MODEL=\${OPENAI_MODEL:-gpt-3.5-turbo}
      - ALLOWED_ORIGINS=http://localhost:3000,http://frontend:3000
    volumes:
      - ./ai-verification-service/logs:/app/logs
    networks:
      - trustlens-network

networks:
  trustlens-network:
    driver: bridge
`;

fs.writeFileSync(path.join(__dirname, 'docker-compose.full.yml'), dockerComposeContent);
console.log('✅ Created full-stack Docker Compose configuration');

console.log('\n🎉 AI Verification Service integration complete!');
console.log('\nNext steps:');
console.log('1. Run: npm run install:all');
console.log('2. Configure OpenAI API key in ai-verification-service/.env');
console.log('3. Run: npm run services:start');
console.log('\nCheck AI_INTEGRATION.md for detailed integration guide.');
