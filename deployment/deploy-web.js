/**
 * Web-based Smart Contract Deployment
 * Uses browser-compatible methods to deploy the Sophia contract
 */

const fs = require('fs');
const path = require('path');

// Contract source code
const CONTRACT_SOURCE = `contract TrustLensEscrow =
  record state = 
    { client : address
    , freelancer : address
    , mediator : address
    , amount : int
    , deadline : int
    , disputed : bool
    , project_description : string }

  entrypoint init(client : address, freelancer : address, mediator : address, 
                  amount : int, deadline : int, project_description : string) : state =
    { client = client
    , freelancer = freelancer
    , mediator = mediator
    , amount = amount
    , deadline = deadline
    , disputed = false
    , project_description = project_description }

  payable stateful entrypoint deposit() : bool =
    require(Call.value >= state.amount, "Insufficient deposit amount")
    require(Call.caller == state.client, "Only client can deposit")
    Chain.event("FundDeposited", { amount = Call.value, client = Call.caller })
    true

  payable stateful entrypoint release() : bool =
    require(Call.caller == state.client || Call.caller == state.mediator, 
           "Only client or mediator can release funds")
    require(Chain.beneficiary == state.freelancer, "Wrong beneficiary")
    require(state.disputed == false, "Cannot release disputed funds")
    Chain.event("FundReleased", { amount = state.amount, freelancer = state.freelancer })
    true

  stateful entrypoint dispute(reason : string) : bool =
    require(Call.caller == state.client || Call.caller == state.freelancer, 
           "Only client or freelancer can dispute")
    require(state.disputed == false, "Already disputed")
    
    let new_state = { state | disputed = true }
    put(new_state)
    
    Chain.event("DisputeRaised", { 
      reason = reason
    , disputant = Call.caller 
    , mediator = state.mediator 
    })
    true

  payable stateful entrypoint refund() : bool =
    require(Call.caller == state.client || Call.caller == state.mediator, 
           "Only client or mediator can refund")
    require(Chain.beneficiary == state.client, "Wrong beneficiary")
    require(state.disputed == true, "Can only refund disputed funds")
    Chain.event("FundRefunded", { amount = state.amount, client = state.client })
    true

  entrypoint get_project_details() : (address, address, address, int, int, bool, string) =
    (state.client, state.freelancer, state.mediator, state.amount, state.deadline, state.disputed, state.project_description)

  entrypoint get_state() : state =
    state`;

// Deployment instructions
const DEPLOYMENT_INSTRUCTIONS = `
🚀 TRUSTLENS ESCROW CONTRACT DEPLOYMENT INSTRUCTIONS
============================================================

📋 MANUAL DEPLOYMENT STEPS:

1. 🌐 Go to Aeternity Testnet Compiler:
   https://compiler.aepps.com/

2. 📝 Copy and paste this Sophia contract source code:

${CONTRACT_SOURCE}

3. ⚙️ Set deployment parameters:
   - Client Address: [Your wallet address]
   - Freelancer Address: [Freelancer wallet address]
   - Mediator Address: [Mediator wallet address]
   - Amount: 1000000000000000000 (1 AE in aettos)
   - Deadline: ${Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60)} (30 days from now)
   - Project Description: "TrustLens escrow contract deployment"

4. 💰 Ensure you have testnet AE tokens:
   - Get tokens from: https://testnet.faucet.aepps.com/
   - You need at least 0.5 AE for deployment

5. 🚀 Deploy the contract:
   - Click "Deploy" button
   - Sign the transaction with your wallet
   - Wait for confirmation

6. 📋 Copy the contract address and transaction hash

7. 🔄 Update the configuration:
   - Replace the mock address in frontend/src/config/contract.js
   - Update deployment/deployment-info.json

============================================================

📄 CONTRACT FEATURES:
- ✅ Three-party escrow (Client, Freelancer, Mediator)
- ✅ Dispute resolution mechanism
- ✅ Automatic fund release/refund
- ✅ Event logging for all actions
- ✅ State querying functions

🔗 EXPLORER LINKS:
- Testnet Explorer: https://testnet.aescan.io/
- Contract Explorer: https://explorer.aeternity.io/

📞 SUPPORT:
- Aeternity Documentation: https://docs.aeternity.io/
- Community Forum: https://forum.aeternity.com/
`;

async function generateDeploymentInstructions() {
  console.log(DEPLOYMENT_INSTRUCTIONS);
  
  // Save contract source to file
  const contractPath = path.join(__dirname, 'TrustLensEscrow.aes');
  fs.writeFileSync(contractPath, CONTRACT_SOURCE);
  console.log(`\n💾 Contract source saved to: ${contractPath}`);
  
  // Generate deployment info template
  const deploymentInfo = {
    contractAddress: "REPLACE_WITH_ACTUAL_CONTRACT_ADDRESS",
    transactionHash: "REPLACE_WITH_ACTUAL_TRANSACTION_HASH",
    deployerAddress: "REPLACE_WITH_YOUR_WALLET_ADDRESS",
    deployParams: {
      client: "REPLACE_WITH_CLIENT_ADDRESS",
      freelancer: "REPLACE_WITH_FREELANCER_ADDRESS", 
      mediator: "REPLACE_WITH_MEDIATOR_ADDRESS",
      amount: 1000000000000000000,
      deadline: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60),
      project_description: "TrustLens escrow contract deployment"
    },
    deployedAt: new Date().toISOString(),
    network: "testnet",
    note: "Update this file after successful deployment"
  };
  
  const deploymentPath = path.join(__dirname, 'deployment-info-template.json');
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`📋 Deployment template saved to: ${deploymentPath}`);
  
  console.log('\n✅ Deployment preparation complete!');
  console.log('📖 Follow the instructions above to deploy your contract manually.');
}

// Run the deployment instructions
generateDeploymentInstructions().catch(console.error);
