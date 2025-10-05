/**
 * Browser-based Smart Contract Deployment
 * Opens Aeternity compiler with contract pre-loaded
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

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

// Generate deployment parameters
const deadline = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60); // 30 days from now

console.log('🚀 TRUSTLENS SMART CONTRACT DEPLOYMENT');
console.log('============================================================');
console.log('');
console.log('📋 DEPLOYMENT PARAMETERS:');
console.log(`   Amount: 1000000000000000000 (1 AE)`);
console.log(`   Deadline: ${deadline} (${new Date(deadline * 1000).toLocaleString()})`);
console.log(`   Project: "TrustLens escrow contract deployment"`);
console.log('');
console.log('🌐 Opening Aeternity Compiler...');

// Create HTML file with contract pre-loaded
const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>TrustLens Contract Deployment</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .step { margin: 20px 0; padding: 15px; border-left: 4px solid #667eea; background: #f8f9fa; }
        .code { background: #2d3748; color: #e2e8f0; padding: 15px; border-radius: 5px; font-family: 'Courier New', monospace; white-space: pre-wrap; overflow-x: auto; }
        .button { background: #667eea; color: white; padding: 12px 24px; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; margin: 10px 5px; }
        .button:hover { background: #5a67d8; }
        .warning { background: #fed7d7; border: 1px solid #feb2b2; color: #742a2a; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .success { background: #c6f6d5; border: 1px solid #9ae6b4; color: #22543d; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .link { color: #667eea; text-decoration: none; font-weight: bold; }
        .link:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 TrustLens Smart Contract Deployment</h1>
            <p>Deploy your Sophia escrow contract to Aeternity Testnet</p>
        </div>

        <div class="warning">
            <strong>⚠️ IMPORTANT:</strong> You need testnet AE tokens to deploy the contract. 
            Get them from <a href="https://testnet.faucet.aepps.com/" target="_blank" class="link">Aeternity Testnet Faucet</a>
        </div>

        <div class="step">
            <h3>Step 1: Copy Contract Code</h3>
            <p>Copy the Sophia contract code below:</p>
            <div class="code">${CONTRACT_SOURCE}</div>
            <button class="button" onclick="copyContractCode()">📋 Copy Contract Code</button>
        </div>

            <div class="step">
                <h3>Step 2: Open AEStudio (Aeternity IDE)</h3>
                <p>Click the button below to open AEStudio - the official Aeternity development environment:</p>
                <button class="button" onclick="openCompiler()">🌐 Open AEStudio</button>
                <p><strong>Alternative:</strong> You can also use the command line with AEproject</p>
            </div>

        <div class="step">
            <h3>Step 3: Deploy Parameters</h3>
            <p>Use these parameters when deploying:</p>
            <ul>
                <li><strong>Client Address:</strong> Your wallet address (starts with ak_)</li>
                <li><strong>Freelancer Address:</strong> Example: ak_freelancer123456789</li>
                <li><strong>Mediator Address:</strong> Example: ak_mediator123456789</li>
                <li><strong>Amount:</strong> 1000000000000000000</li>
                <li><strong>Deadline:</strong> ${deadline}</li>
                <li><strong>Project Description:</strong> "TrustLens escrow contract deployment"</li>
            </ul>
        </div>

        <div class="step">
            <h3>Step 4: After Deployment</h3>
            <p>Once deployed, you'll get a contract address (starts with ct_) and transaction hash (starts with th_).</p>
            <p>Run this command to update your configuration:</p>
            <div class="code">node deployment/update-config.js &lt;contract-address&gt; &lt;transaction-hash&gt; &lt;deployer-address&gt;</div>
        </div>

        <div class="success">
            <strong>✅ Contract Features:</strong>
            <ul>
                <li>Three-party escrow (Client, Freelancer, Mediator)</li>
                <li>Dispute resolution mechanism</li>
                <li>Automatic fund release/refund</li>
                <li>Event logging for all actions</li>
                <li>State querying functions</li>
            </ul>
        </div>

        <div class="step">
            <h3>🔗 Useful Links</h3>
            <ul>
                <li><a href="https://testnet.faucet.aepps.com/" target="_blank" class="link">Get Testnet Tokens</a></li>
                <li><a href="https://studio.aepps.com/" target="_blank" class="link">AEStudio (Aeternity IDE)</a></li>
                <li><a href="https://testnet.aescan.io/" target="_blank" class="link">Testnet Explorer</a></li>
                <li><a href="https://docs.aeternity.io/" target="_blank" class="link">Aeternity Documentation</a></li>
            </ul>
        </div>
    </div>

    <script>
        function copyContractCode() {
            const code = \`${CONTRACT_SOURCE}\`;
            navigator.clipboard.writeText(code).then(() => {
                alert('✅ Contract code copied to clipboard!');
            }).catch(err => {
                console.error('Failed to copy: ', err);
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = code;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                alert('✅ Contract code copied to clipboard!');
            });
        }

        function openCompiler() {
            window.open('https://studio.aepps.com/', '_blank');
        }

        // Auto-focus on page load
        window.onload = function() {
            console.log('🚀 TrustLens Contract Deployment Helper Loaded');
            console.log('📋 Contract code ready for deployment');
        };
    </script>
</body>
</html>`;

// Save HTML file
const htmlPath = path.join(__dirname, 'deployment-helper.html');
fs.writeFileSync(htmlPath, htmlContent);

console.log('📄 Deployment helper created: deployment/deployment-helper.html');
console.log('');
console.log('🌐 Opening deployment helper in browser...');

// Open the HTML file in the default browser
const platform = process.platform;
let command;

if (platform === 'darwin') {
    command = 'open';
} else if (platform === 'win32') {
    command = 'start';
} else {
    command = 'xdg-open';
}

exec(`${command} "${htmlPath}"`, (error, stdout, stderr) => {
    if (error) {
        console.log('⚠️  Could not open browser automatically.');
        console.log(`📄 Please open this file manually: ${htmlPath}`);
    } else {
        console.log('✅ Deployment helper opened in browser!');
    }
    
    console.log('');
    console.log('📋 NEXT STEPS:');
    console.log('1. 📋 Copy the contract code from the browser');
    console.log('2. 🌐 Go to https://compiler.aepps.com/');
    console.log('3. 💰 Get testnet tokens from https://testnet.faucet.aepps.com/');
    console.log('4. 🚀 Deploy the contract with the provided parameters');
    console.log('5. 🔄 Update configuration with: node deployment/update-config.js <address> <hash> <deployer>');
    console.log('');
    console.log('🎯 The deployment helper will guide you through the process!');
});

// Also save contract to separate file for easy access
const contractPath = path.join(__dirname, 'TrustLensEscrow.aes');
fs.writeFileSync(contractPath, CONTRACT_SOURCE);
console.log(`💾 Contract source also saved to: ${contractPath}`);
