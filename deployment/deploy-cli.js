/**
 * Command Line Deployment Script
 * Alternative deployment method using AEproject CLI
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 TRUSTLENS SMART CONTRACT DEPLOYMENT (CLI METHOD)');
console.log('============================================================');
console.log('');

// Check if AEproject is installed
console.log('🔍 Checking for AEproject installation...');

exec('aeproject --version', (error, stdout, stderr) => {
    if (error) {
        console.log('❌ AEproject not found. Installing...');
        console.log('');
        console.log('📦 Installing AEproject globally...');
        
        exec('npm install -g aeproject', (installError, installStdout, installStderr) => {
            if (installError) {
                console.log('❌ Failed to install AEproject. Please install manually:');
                console.log('   npm install -g aeproject');
                console.log('');
                console.log('🌐 Alternative: Use AEStudio at https://studio.aepps.com/');
                return;
            }
            
            console.log('✅ AEproject installed successfully!');
            console.log('');
            setupProject();
        });
    } else {
        console.log('✅ AEproject found:', stdout.trim());
        console.log('');
        setupProject();
    }
});

function setupProject() {
    console.log('📁 Setting up deployment project...');
    
    // Create deployment directory
    const deployDir = path.join(__dirname, 'aeproject-deployment');
    
    if (!fs.existsSync(deployDir)) {
        fs.mkdirSync(deployDir, { recursive: true });
    }
    
    // Copy contract to deployment directory
    const contractSource = `contract TrustLensEscrow =
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

    const contractPath = path.join(deployDir, 'contracts', 'TrustLensEscrow.aes');
    fs.mkdirSync(path.dirname(contractPath), { recursive: true });
    fs.writeFileSync(contractPath, contractSource);
    
    // Create aeproject.yaml
    const aeprojectConfig = `name: TrustLensEscrow
version: 1.0.0
compiler: 8.2.0
namespace: TrustLens
contracts:
  - path: contracts/TrustLensEscrow.aes
    name: TrustLensEscrow
networks:
  testnet:
    url: https://testnet.aeternity.io
    compilerUrl: https://compiler.aepps.com
    internalUrl: https://sdk-testnet.aepps.com
    gas: 200000
    gasPrice: 1000000000
deployment:
  testnet:
    contracts:
      - name: TrustLensEscrow
        deploy: true
        args:
          - ak_YOUR_CLIENT_ADDRESS
          - ak_YOUR_FREELANCER_ADDRESS
          - ak_YOUR_MEDIATOR_ADDRESS
          - 1000000000000000000
          - ${Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60)}
          - "TrustLens escrow contract deployment"`;

    const configPath = path.join(deployDir, 'aeproject.yaml');
    fs.writeFileSync(configPath, aeprojectConfig);
    
    console.log('✅ Project setup complete!');
    console.log(`📁 Deployment directory: ${deployDir}`);
    console.log('');
    console.log('📋 DEPLOYMENT STEPS:');
    console.log('');
    console.log('1. 💰 Get testnet tokens:');
    console.log('   https://testnet.faucet.aepps.com/');
    console.log('');
    console.log('2. 🔧 Update aeproject.yaml with your addresses:');
    console.log('   - Replace ak_YOUR_CLIENT_ADDRESS with your wallet address');
    console.log('   - Replace ak_YOUR_FREELANCER_ADDRESS with freelancer address');
    console.log('   - Replace ak_YOUR_MEDIATOR_ADDRESS with mediator address');
    console.log('');
    console.log('3. 🚀 Deploy the contract:');
    console.log(`   cd ${deployDir}`);
    console.log('   aeproject deploy --network testnet');
    console.log('');
    console.log('4. 🔄 Update configuration:');
    console.log('   node deployment/update-config.js <contract-address> <transaction-hash> <deployer-address>');
    console.log('');
    console.log('🌐 Alternative: Use AEStudio at https://studio.aepps.com/');
    console.log('');
    console.log('📖 For detailed instructions, see:');
    console.log('   https://aekiti.github.io/documentation-hub/site/getting-started/deploying-on-testnet/');
    
    // Open the deployment directory in finder
    console.log('');
    console.log('📁 Opening deployment directory...');
    exec(`open "${deployDir}"`, (error) => {
        if (error) {
            console.log(`📁 Please navigate to: ${deployDir}`);
        }
    });
}
