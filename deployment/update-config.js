/**
 * Update Configuration Script
 * Updates the contract configuration with real deployment details
 */

const fs = require('fs');
const path = require('path');

function updateContractConfig(contractAddress, transactionHash, deployerAddress) {
  console.log('🔄 Updating contract configuration...');
  
  // Update frontend config
  const frontendConfigPath = path.join(__dirname, '../frontend/src/config/contract.js');
  
  if (fs.existsSync(frontendConfigPath)) {
    let configContent = fs.readFileSync(frontendConfigPath, 'utf8');
    
    // Replace mock contract address
    configContent = configContent.replace(
      /address: 'ct_mgcu3hf44v523o840mx'/g,
      `address: '${contractAddress}'`
    );
    
    // Replace mock transaction hash
    configContent = configContent.replace(
      /transactionHash: 'th_mgcu3hf46bhx96u8b0h'/g,
      `transactionHash: '${transactionHash}'`
    );
    
    // Replace mock deployer address
    configContent = configContent.replace(
      /deployerAddress: 'ak_mockAddress123456789'/g,
      `deployerAddress: '${deployerAddress}'`
    );
    
    // Update deployment date
    configContent = configContent.replace(
      /deployedAt: '2025-10-04T22:17:52.624Z'/g,
      `deployedAt: '${new Date().toISOString()}'`
    );
    
    // Remove mock note
    configContent = configContent.replace(
      /note: "This is a mock deployment for demonstration purposes"/g,
      'note: "Real contract deployment"'
    );
    
    fs.writeFileSync(frontendConfigPath, configContent);
    console.log('✅ Frontend config updated');
  }
  
  // Update deployment info
  const deploymentInfoPath = path.join(__dirname, 'deployment-info.json');
  
  if (fs.existsSync(deploymentInfoPath)) {
    const deploymentInfo = JSON.parse(fs.readFileSync(deploymentInfoPath, 'utf8'));
    
    deploymentInfo.contractAddress = contractAddress;
    deploymentInfo.transactionHash = transactionHash;
    deploymentInfo.deployerAddress = deployerAddress;
    deploymentInfo.deployedAt = new Date().toISOString();
    deploymentInfo.note = "Real contract deployment";
    
    fs.writeFileSync(deploymentInfoPath, JSON.stringify(deploymentInfo, null, 2));
    console.log('✅ Deployment info updated');
  }
  
  console.log('🎉 Configuration update complete!');
  console.log(`📍 Contract Address: ${contractAddress}`);
  console.log(`🔗 Transaction Hash: ${transactionHash}`);
  console.log(`👤 Deployer: ${deployerAddress}`);
  console.log('\n🌐 Explorer Links:');
  console.log(`   Contract: https://testnet.aescan.io/contracts/${contractAddress}`);
  console.log(`   Transaction: https://testnet.aescan.io/transactions/${transactionHash}`);
}

// Command line usage
if (process.argv.length >= 5) {
  const contractAddress = process.argv[2];
  const transactionHash = process.argv[3];
  const deployerAddress = process.argv[4];
  
  console.log('🚀 Updating TrustLens Contract Configuration');
  console.log('============================================================');
  
  updateContractConfig(contractAddress, transactionHash, deployerAddress);
} else {
  console.log('📋 USAGE: node update-config.js <contract-address> <transaction-hash> <deployer-address>');
  console.log('');
  console.log('📝 Example:');
  console.log('   node update-config.js ct_2KAcA2Pp3nrR8Wn3SEkDrC2oufkgLf8V1oW9vWgXy7K8x9mN2v th_2KAcA2Pp3nrR8Wn3SEkDrC2oufkgLf8V1oW9vWgXy7K8x9mN2v ak_2KAcA2Pp3nrR8Wn3SEkDrC2oufkgLf8V1oW9vWgXy7K8x9mN2v');
  console.log('');
  console.log('📖 After deploying your contract manually:');
  console.log('   1. Copy the contract address from the compiler');
  console.log('   2. Copy the transaction hash');
  console.log('   3. Copy your wallet address');
  console.log('   4. Run this script with those values');
}
