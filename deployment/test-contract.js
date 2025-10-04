const { Universal: Ae, Node, MemoryAccount } = require('@aeternity/aepp-sdk');
const fs = require('fs');
const path = require('path');

// Testnet configuration
const TESTNET_CONFIG = {
  url: 'https://testnet.aeternity.io',
  compilerUrl: 'https://compiler.aepps.com'
};

/**
 * Test deployed contract functionality
 */
async function testContract(contractAddress) {
  try {
    console.log('🧪 Testing deployed contract...');
    console.log(`📍 Contract Address: ${contractAddress}`);

    // Load account
    const accountPath = path.join(__dirname, 'account.json');
    if (!fs.existsSync(accountPath)) {
      throw new Error('Account file not found. Run deployment first.');
    }

    const accountData = JSON.parse(fs.readFileSync(accountPath, 'utf8'));
    const account = new MemoryAccount(accountData.secretKey);

    // Initialize client
    const client = await Ae({
      nodes: [{ name: 'testnet', instance: await Node({ url: TESTNET_CONFIG.url }) }],
      compilerUrl: TESTNET_CONFIG.compilerUrl,
      accounts: [account]
    });

    // Load contract ACI
    const contractSource = fs.readFileSync(path.join(__dirname, '../contracts/TrustLensEscrow.aes'), 'utf8');
    const compiledContract = await client.contractCompile(contractSource);

    // Get contract instance
    const contractInstance = await client.getContractInstance(compiledContract.aci, contractAddress);

    console.log('✅ Contract instance created');

    // Test 1: Get project details
    console.log('🔍 Test 1: Getting project details...');
    try {
      const details = await contractInstance.methods.get_project_details();
      console.log('✅ Project details retrieved successfully:');
      console.log('   Client:', details.decodedResult[0]);
      console.log('   Freelancer:', details.decodedResult[1]);
      console.log('   Mediator:', details.decodedResult[2]);
      console.log('   Amount:', details.decodedResult[3]);
      console.log('   Deadline:', new Date(details.decodedResult[4] * 1000));
      console.log('   Disputed:', details.decodedResult[5]);
      console.log('   Description:', details.decodedResult[6]);
    } catch (error) {
      console.log('❌ Failed to get project details:', error.message);
    }

    // Test 2: Get state
    console.log('🔍 Test 2: Getting contract state...');
    try {
      const state = await contractInstance.methods.get_state();
      console.log('✅ Contract state retrieved successfully:');
      console.log('   State:', JSON.stringify(state.decodedResult, null, 2));
    } catch (error) {
      console.log('❌ Failed to get contract state:', error.message);
    }

    // Test 3: Check balance
    console.log('🔍 Test 3: Checking contract balance...');
    try {
      const balance = await client.balance(contractAddress);
      console.log(`✅ Contract balance: ${(balance / Math.pow(10, 18)).toFixed(4)} AE`);
    } catch (error) {
      console.log('❌ Failed to get contract balance:', error.message);
    }

    console.log('🎉 Contract testing completed successfully!');

  } catch (error) {
    console.error('❌ Contract testing failed:', error.message);
    throw error;
  }
}

/**
 * Main test function
 */
async function main() {
  console.log('🧪 TrustLens Escrow Contract Testing');
  console.log('=' .repeat(50));

  // Check if deployment info exists
  const deploymentPath = path.join(__dirname, 'deployment-info.json');
  if (!fs.existsSync(deploymentPath)) {
    console.log('❌ Deployment info not found.');
    console.log('   Please run deployment first: npm run deploy');
    process.exit(1);
  }

  // Load deployment info
  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
  const contractAddress = deploymentInfo.contractAddress;

  if (!contractAddress) {
    console.log('❌ Contract address not found in deployment info.');
    process.exit(1);
  }

  try {
    await testContract(contractAddress);
  } catch (error) {
    console.error('💥 Testing failed:', error);
    process.exit(1);
  }
}

// Run test if this script is executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Unhandled error:', error);
    process.exit(1);
  });
}

module.exports = { testContract };
