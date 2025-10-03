/**
 * TrustLens AI Verification Service - Usage Examples
 * 
 * This file demonstrates how to use the AI Verification Service API
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

// Example 1: Verify a single task
async function verifySingleTask() {
  try {
    const response = await axios.post(`${API_BASE_URL}/verification/verify`, {
      taskDescription: `
        Create a responsive e-commerce website with the following features:
        - Product catalog with search and filtering
        - Shopping cart functionality
        - User authentication (login/register)
        - Payment integration with Stripe
        - Mobile-responsive design
        - Admin dashboard for managing products
      `,
      deliverySummary: `
        Successfully built a full-stack e-commerce platform using React, Node.js, and PostgreSQL.
        
        Features delivered:
        ✅ Responsive product catalog with advanced search and category filtering
        ✅ Complete shopping cart with add/remove items and quantity management
        ✅ User authentication system with JWT tokens and password encryption
        ✅ Stripe payment integration with secure checkout process
        ✅ Mobile-first responsive design that works on all devices
        ✅ Admin dashboard with product management, order tracking, and analytics
        
        Additional features:
        - Email notifications for orders
        - Product reviews and ratings
        - Inventory management
        - SEO optimization
        
        The website is fully functional and deployed on AWS with SSL certificate.
      `
    });

    console.log('✅ Single Task Verification Result:');
    console.log(`Score: ${response.data.data.completionScore}/100`);
    console.log(`Recommendation: ${response.data.data.recommendation}`);
    console.log(`Reasoning: ${response.data.data.reasoning}`);
    console.log('');

  } catch (error) {
    console.error('❌ Single task verification failed:', error.response?.data || error.message);
  }
}

// Example 2: Verify multiple tasks in batch
async function verifyBatchTasks() {
  try {
    const response = await axios.post(`${API_BASE_URL}/verification/batch`, {
      tasks: [
        {
          taskId: 'web_design_001',
          taskDescription: 'Design a modern landing page for a SaaS product with hero section, features, pricing, and contact form',
          deliverySummary: 'Created a stunning landing page using Figma with modern design principles. Included hero section with compelling copy, feature showcase with icons, pricing table with three tiers, and contact form. Used consistent color scheme and typography throughout.'
        },
        {
          taskId: 'content_writing_002',
          taskDescription: 'Write 5 blog posts about digital marketing trends, each 1000+ words with SEO optimization',
          deliverySummary: 'Delivered 5 comprehensive blog posts covering AI in marketing, social media trends, email marketing automation, content marketing strategies, and video marketing. Each post is 1200+ words with proper SEO keywords, meta descriptions, and internal linking.'
        },
        {
          taskId: 'app_development_003',
          taskDescription: 'Build a mobile app for task management with user authentication, task creation, and notifications',
          deliverySummary: 'Developed a React Native app with user registration/login, task creation and editing, due date reminders, push notifications, and offline sync. App is available on both iOS and Android stores.'
        }
      ]
    });

    console.log('✅ Batch Verification Results:');
    console.log(`Total Tasks: ${response.data.data.totalTasks}`);
    console.log(`Completed: ${response.data.data.completedTasks}`);
    console.log(`Failed: ${response.data.data.failedTasks}`);
    console.log('');

    response.data.data.results.forEach((result, index) => {
      if (result.error) {
        console.log(`❌ Task ${index + 1} (${result.taskId}): ${result.error}`);
      } else {
        console.log(`✅ Task ${index + 1} (${result.taskId}): ${result.completionScore}/100 - ${result.recommendation}`);
        console.log(`   Reasoning: ${result.reasoning}`);
      }
    });
    console.log('');

  } catch (error) {
    console.error('❌ Batch verification failed:', error.response?.data || error.message);
  }
}

// Example 3: Check service health
async function checkHealth() {
  try {
    const response = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Service Health Check:');
    console.log(`Status: ${response.data.message}`);
    console.log(`Uptime: ${Math.round(response.data.uptime)} seconds`);
    console.log(`Service: ${response.data.service}`);
    console.log('');

  } catch (error) {
    console.error('❌ Health check failed:', error.response?.data || error.message);
  }
}

// Example 4: Get detailed health information
async function checkDetailedHealth() {
  try {
    const response = await axios.get(`${API_BASE_URL}/health/detailed`);
    console.log('✅ Detailed Health Check:');
    console.log(`Overall Status: ${response.data.status}`);
    console.log(`API Status: ${response.data.components.api.status}`);
    console.log(`AI Status: ${response.data.components.ai.status}`);
    console.log(`Memory Usage: ${response.data.environment.memory.used}`);
    console.log('');

  } catch (error) {
    console.error('❌ Detailed health check failed:', error.response?.data || error.message);
  }
}

// Example 5: Get available AI models
async function getAvailableModels() {
  try {
    const response = await axios.get(`${API_BASE_URL}/verification/models`);
    console.log('✅ Available AI Models:');
    console.log(`Current Model: ${response.data.data.currentModel}`);
    console.log(`Available Models: ${response.data.data.availableModels.join(', ')}`);
    console.log('');

  } catch (error) {
    console.error('❌ Failed to get models:', error.response?.data || error.message);
  }
}

// Example 6: Integration with escrow workflow
async function escrowWorkflowExample() {
  console.log('🏦 Escrow Workflow Integration Example:');
  
  try {
    // Step 1: Verify task completion
    const verification = await axios.post(`${API_BASE_URL}/verification/verify`, {
      taskDescription: 'Develop a customer support chatbot with natural language processing',
      deliverySummary: 'Built an AI-powered chatbot using OpenAI API with natural language understanding, multi-turn conversations, FAQ handling, and integration with CRM system. Bot can handle 80% of customer inquiries automatically.'
    });

    const result = verification.data.data;
    console.log(`Verification Score: ${result.completionScore}/100`);
    console.log(`Recommendation: ${result.recommendation}`);
    
    // Step 2: Make escrow decision based on verification
    if (result.recommendation === 'release' && result.completionScore >= 70) {
      console.log('✅ RECOMMENDATION: Release funds to freelancer');
      console.log('   - Task completed satisfactorily');
      console.log('   - Quality meets requirements');
      // In real implementation, this would trigger smart contract release
    } else {
      console.log('❌ RECOMMENDATION: Initiate dispute resolution');
      console.log('   - Task completion below threshold');
      console.log('   - Requires mediator intervention');
      // In real implementation, this would trigger dispute process
    }
    
    console.log('');

  } catch (error) {
    console.error('❌ Escrow workflow example failed:', error.response?.data || error.message);
  }
}

// Run all examples
async function runAllExamples() {
  console.log('🚀 TrustLens AI Verification Service - Usage Examples\n');
  console.log('='.repeat(60));
  
  await checkHealth();
  await checkDetailedHealth();
  await getAvailableModels();
  await verifySingleTask();
  await verifyBatchTasks();
  await escrowWorkflowExample();
  
  console.log('='.repeat(60));
  console.log('✅ All examples completed!');
}

// Export functions for individual use
module.exports = {
  verifySingleTask,
  verifyBatchTasks,
  checkHealth,
  checkDetailedHealth,
  getAvailableModels,
  escrowWorkflowExample,
  runAllExamples
};

// Run examples if this file is executed directly
if (require.main === module) {
  runAllExamples().catch(console.error);
}
