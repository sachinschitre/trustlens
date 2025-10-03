const Ae = require('@aeternity/aepp-sdk').default;
const fs = require('fs');
const path = require('path');

async function deployEscrow() {
  try {
    // Initialize client
    const client = await Ae({
      url: 'https://testnet.aeternity.io',
      internalUrl: 'https://testnet.aeternity.io',
      keypair: {
        secretKey: process.env.AETERNITY_SECRET_KEY,
        publicKey: process.env.AETERNITY_PUBLIC_KEY
      },
      networkId: 'ae_uat'
    });

    // Contract parameters (replace with actual addresses)
    const contractParams = {
      client: process.env.CLIENT_ADDRESS || 'ak_2a1j2Mk9xSm2nQJv...', // Replace with actual client address
      freelancer: process.env.FREELANCER_ADDRESS || 'ak_2a1j2Mk9xSm2nQJv...', // Replace with actual freelancer address  
      mediator: process.env.MEDIATOR_ADDRESS || 'ak_2a1j2Mk9xSm2nQJv...', // Replace with actual mediator address
      amount: 1000000000000000000, // 1 AE in aettos
      deadline: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30 days from now
    };

    // Read contract source
    const contractSource = fs.readFileSync(path.join(__dirname, 'escrhow.aes'), 'utf8');

    console.log('Deploying contract with parameters:', contractParams);

    // Deploy contract
    const contract = await client.contractCompile(contractSource);
    const deployResult = await contract.deploy({
      client: contractParams.client,
      freelancer: contractParams.freelancer,
      mediator: contractParams.mediator,
      amount: contractParams.amount,
      deadline: contractParams.deadline
    });

    console.log('Contract deployed successfully!');
    console.log('Contract Address:', deployResult.decode.address);
    console.log('Transaction Hash:', deployResult.transactionHash);
    console.log('Gas Used:', deployResult.gasUsed);

    // Save deployment info
    const deploymentInfo = {
      contractAddress: deployResult.decode.address,
      transactionHash: deployResult.transactionHash,
      gasUsed: deployResult.gasUsed,
      parameters: contractParams,
      deployedAt: new Date().toISOString()
    };

    fs.writeFileSync(
      path.join(__dirname, 'deployment-info.json'), 
      JSON.stringify(deploymentInfo, null, 2)
    );

    console.log('Deployment info saved to deployment-info.json');

  } catch (error) {
    console.error('Deployment failed:', error.message);
    process.exit(1);
  }
}

deployEscrow();
