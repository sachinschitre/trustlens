const { Universal: Ae, Node, MemoryAccount } = require('@aeternity/aepp-sdk');
const fs = require('fs');
const path = require('path');

// Testnet configuration
const TESTNET_CONFIG = {
  url: 'https://testnet.aeternity.io',
  compilerUrl: 'https://compiler.aepps.com',
  internalUrl: 'https://sdk-testnet.aepps.com',
  gas: 200000,
  gasPrice: 1000000000,
  networkId: 'ae_uat'
};

// Contract configuration
const CONTRACT_CONFIG = {
  contractPath: '../contracts/TrustLensEscrow.aes',
  contractName: 'TrustLensEscrow'
};

/**
 * Load account from file or create a new one
 */
async function loadAccount() {
  const accountPath = path.join(__dirname, 'account.json');
  
  try {
    // Try to load existing account
    if (fs.existsSync(accountPath)) {
      console.log('📁 Loading existing account from account.json');
      const accountData = JSON.parse(fs.readFileSync(accountPath, 'utf8'));
      return new MemoryAccount(accountData.secretKey);
    }
  } catch (error) {
    console.log('⚠️  Could not load existing account, will create a new one');
  }

  // Create new account for testing
  console.log('🆕 Creating new testnet account...');
  const account = MemoryAccount.generate();
  const accountData = {
    publicKey: account.publicKey,
    secretKey: account.secretKey,
    address: account.address
  };

  // Save account for future use
  fs.writeFileSync(accountPath, JSON.stringify(accountData, null, 2));
  console.log('💾 Account saved to account.json');
  console.log(`🔑 Public Key: ${account.publicKey}`);
  console.log(`📍 Address: ${account.address}`);
  console.log('⚠️  IMPORTANT: Keep the secret key secure and fund this account with testnet AE tokens!');
  
  return account;
}

/**
 * Get account balance
 */
async function getBalance(client, address) {
  try {
    const balance = await client.balance(address);
    return parseInt(balance);
  } catch (error) {
    console.error('❌ Error fetching balance:', error.message);
    return 0;
  }
}

/**
 * Fund account with testnet tokens (if needed)
 */
async function checkAccountFunding(client, account) {
  const balance = await getBalance(client, account.address);
  const balanceAE = balance / Math.pow(10, 18);
  
  console.log(`💰 Account balance: ${balanceAE.toFixed(4)} AE (${balance} aettos)`);
  
  if (balanceAE < 0.1) {
    console.log('⚠️  WARNING: Account has insufficient balance for deployment!');
    console.log('💡 Please fund your account with testnet AE tokens:');
    console.log(`   1. Go to: https://testnet.faucet.aepps.com/`);
    console.log(`   2. Enter address: ${account.address}`);
    console.log(`   3. Request testnet tokens`);
    console.log('   4. Wait for confirmation and try deployment again');
    return false;
  }
  
  return true;
}

/**
 * Deploy the TrustLens escrow contract
 */
async function deployContract(client, account) {
  try {
    console.log('📦 Reading contract source...');
    const contractSource = fs.readFileSync(path.join(__dirname, CONTRACT_CONFIG.contractPath), 'utf8');
    console.log(`✅ Contract source loaded (${contractSource.length} characters)`);

    console.log('🔨 Compiling contract...');
    const compiledContract = await client.contractCompile(contractSource);
    console.log('✅ Contract compiled successfully');

    console.log('🚀 Deploying contract to testnet...');
    
    // Example deployment parameters - you can modify these
    const deployParams = {
      client: account.address, // Using deployer as client for testing
      freelancer: 'ak_2KAcA2Pp3nrR8Wn3SEkDrC2oufkgLf8V1oW9vWgXy7K8x9mN2v', // Example freelancer address
      mediator: 'ak_2KAcA2Pp3nrR8Wn3SEkDrC2oufkgLf8V1oW9vWgXy7K8x9mN2v', // Example mediator address
      amount: 1000000000000000000, // 1 AE in aettos
      deadline: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days from now
      project_description: 'TrustLens escrow contract deployment test'
    };

    const deployment = await client.contractDeploy(
      compiledContract.bytecode,
      deployParams,
      {
        amount: 0,
        gas: TESTNET_CONFIG.gas,
        gasPrice: TESTNET_CONFIG.gasPrice
      }
    );

    console.log('🎉 Contract deployed successfully!');
    console.log(`📍 Contract Address: ${deployment.address}`);
    console.log(`🔗 Transaction Hash: ${deployment.txHash}`);
    console.log(`⛽ Gas Used: ${deployment.gasUsed}`);
    
    // Save deployment info
    const deploymentInfo = {
      contractAddress: deployment.address,
      transactionHash: deployment.txHash,
      deployerAddress: account.address,
      deployParams: deployParams,
      deployedAt: new Date().toISOString(),
      network: 'testnet'
    };

    const deploymentPath = path.join(__dirname, 'deployment-info.json');
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
    console.log('💾 Deployment info saved to deployment-info.json');

    // Verify deployment
    console.log('🔍 Verifying deployment...');
    try {
      const contractInstance = await client.getContractInstance(compiledContract.aci, deployment.address);
      const result = await contractInstance.methods.get_project_details();
      console.log('✅ Contract verification successful');
      console.log('📋 Project details:', result.decodedResult);
    } catch (verifyError) {
      console.log('⚠️  Contract verification failed:', verifyError.message);
    }

    return deployment;
  } catch (error) {
    console.error('❌ Deployment failed:', error);
    throw error;
  }
}

/**
 * Main deployment function
 */
async function main() {
  console.log('🚀 Starting TrustLens Escrow Contract Deployment');
  console.log('🌐 Network: Aeternity Testnet');
  console.log('=' .repeat(60));

  try {
    // Load account
    const account = await loadAccount();
    
    // Initialize client
    console.log('🔌 Connecting to Aeternity testnet...');
    const client = await Ae({
      nodes: [{ name: 'testnet', instance: await Node({ url: TESTNET_CONFIG.url }) }],
      compilerUrl: TESTNET_CONFIG.compilerUrl,
      accounts: [account]
    });
    console.log('✅ Connected to testnet successfully');

    // Check account funding
    const isFunded = await checkAccountFunding(client, account);
    if (!isFunded) {
      console.log('❌ Deployment aborted due to insufficient funds');
      process.exit(1);
    }

    // Deploy contract
    const deployment = await deployContract(client, account);

    console.log('=' .repeat(60));
    console.log('🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!');
    console.log('=' .repeat(60));
    console.log(`📍 Contract Address: ${deployment.address}`);
    console.log(`🔗 View on Explorer: https://explorer.aeternity.io/transactions/${deployment.txHash}`);
    console.log(`🔗 View Contract: https://explorer.aeternity.io/contracts/${deployment.address}`);
    console.log('=' .repeat(60));

  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run deployment if this script is executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Unhandled error:', error);
    process.exit(1);
  });
}

module.exports = { main, loadAccount, deployContract };
