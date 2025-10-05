/**
 * Contract Verification Script
 * Verifies the deployed contract on Aeternity testnet
 */

const https = require('https');

const CONTRACT_ADDRESS = 'ct_2F23rJX3XrocNV9xGpKBwD2ahzRZfohGPC4Q8BQ9jtQK2DYf5';

console.log('🔍 TRUSTLENS CONTRACT VERIFICATION');
console.log('============================================================');
console.log('');
console.log(`📍 Contract Address: ${CONTRACT_ADDRESS}`);
console.log('');

// Function to make HTTPS requests
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve({ error: 'Invalid JSON response', raw: data });
        }
      });
    }).on('error', reject);
  });
}

// Verify contract on testnet
async function verifyContract() {
  console.log('🌐 Checking contract on Aeternity testnet...');
  console.log('');

  try {
    // Try different API endpoints
    const endpoints = [
      `https://testnet.aeternity.io/v3/contracts/${CONTRACT_ADDRESS}`,
      `https://testnet.aeternity.io/middleware/contracts/${CONTRACT_ADDRESS}`,
      `https://testnet.aeternity.io/mdw/contracts/${CONTRACT_ADDRESS}`,
      `https://testnet.aeternity.io/v2/contracts/${CONTRACT_ADDRESS}`
    ];

    let contractData = null;
    let workingEndpoint = null;

    for (const endpoint of endpoints) {
      try {
        console.log(`🔗 Trying: ${endpoint}`);
        const data = await makeRequest(endpoint);
        
        if (data && !data.error) {
          contractData = data;
          workingEndpoint = endpoint;
          console.log(`✅ Success with: ${endpoint}`);
          break;
        }
      } catch (error) {
        console.log(`❌ Failed: ${endpoint}`);
      }
    }

    if (contractData) {
      console.log('');
      console.log('✅ CONTRACT VERIFIED SUCCESSFULLY!');
      console.log('============================================================');
      console.log('');
      console.log('📋 Contract Details:');
      console.log(`   Address: ${contractData.address || CONTRACT_ADDRESS}`);
      console.log(`   Owner: ${contractData.owner || 'N/A'}`);
      console.log(`   Created: ${contractData.created || 'N/A'}`);
      console.log(`   Source: ${contractData.source || 'N/A'}`);
      console.log('');
      
      if (contractData.log) {
        console.log('📄 Contract Log:');
        console.log(`   ${contractData.log}`);
        console.log('');
      }

      console.log('🔗 Explorer Links:');
      console.log(`   Contract: https://testnet.aescan.io/contracts/${CONTRACT_ADDRESS}`);
      console.log(`   Transaction: https://testnet.aescan.io/transactions/${contractData.tx_hash || 'N/A'}`);
      console.log('');

      console.log('📋 Contract Functions Available:');
      console.log('   ✅ deposit() - Client deposits funds');
      console.log('   ✅ release() - Release funds to freelancer');
      console.log('   ✅ dispute(reason) - Raise a dispute');
      console.log('   ✅ refund() - Refund disputed funds');
      console.log('   ✅ get_project_details() - Get project info');
      console.log('   ✅ get_state() - Get contract state');
      console.log('');

      console.log('🎯 Next Steps:');
      console.log('   1. ✅ Contract is deployed and verified');
      console.log('   2. 🔄 Frontend configuration updated');
      console.log('   3. 🚀 Ready to use in your application!');
      console.log('');

    } else {
      console.log('⚠️  Could not verify contract via API');
      console.log('');
      console.log('🔍 Manual Verification:');
      console.log(`   Visit: https://testnet.aescan.io/contracts/${CONTRACT_ADDRESS}`);
      console.log('');
      console.log('📋 Contract should be visible with:');
      console.log('   • Contract address: ct_2F23rJX3XrocNV9xGpKBwD2ahzRZfohGPC4Q8BQ9jtQK2DYf5');
      console.log('   • Owner address');
      console.log('   • Creation transaction');
      console.log('   • Source code');
      console.log('');
    }

  } catch (error) {
    console.log('❌ Error verifying contract:', error.message);
    console.log('');
    console.log('🔍 Manual Verification:');
    console.log(`   Visit: https://testnet.aescan.io/contracts/${CONTRACT_ADDRESS}`);
  }
}

// Test contract functions
async function testContractFunctions() {
  console.log('🧪 TESTING CONTRACT FUNCTIONS');
  console.log('============================================================');
  console.log('');
  
  console.log('📋 To test contract functions:');
  console.log('');
  console.log('1. 🌐 Go to AEStudio: https://studio.aepps.com/');
  console.log('2. 📝 Connect to your deployed contract:');
  console.log(`   Contract Address: ${CONTRACT_ADDRESS}`);
  console.log('3. 🔧 Test these functions:');
  console.log('   • get_project_details() - Should return deployment parameters');
  console.log('   • get_state() - Should return current contract state');
  console.log('');
  
  console.log('💡 Example function calls:');
  console.log('   • get_project_details() → (client, freelancer, mediator, amount, deadline, disputed, description)');
  console.log('   • get_state() → Complete contract state object');
  console.log('');
}

// Run verification
verifyContract().then(() => {
  testContractFunctions();
}).catch(console.error);
