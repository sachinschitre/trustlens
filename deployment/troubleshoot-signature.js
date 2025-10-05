/**
 * Transaction Signature Troubleshooting Guide
 * Helps resolve signature verification errors
 */

console.log('🔧 TRANSACTION SIGNATURE TROUBLESHOOTING');
console.log('============================================================');
console.log('');

console.log('❌ Error: "Signature cannot be verified, please ensure that you transaction have the correct prefix and the correct private key for the sender address"');
console.log('');

console.log('🔍 COMMON CAUSES & SOLUTIONS:');
console.log('');

console.log('1. 🔑 WRONG PRIVATE KEY');
console.log('   Problem: Using incorrect private key for the sender address');
console.log('   Solution:');
console.log('   - Verify you\'re using the correct private key');
console.log('   - Ensure the private key matches the sender address');
console.log('   - Check for typos in the private key');
console.log('');

console.log('2. 📍 INCORRECT ADDRESS FORMAT');
console.log('   Problem: Wrong address format or prefix');
console.log('   Solution:');
console.log('   - Aeternity addresses start with "ak_" (account keys)');
console.log('   - Contract addresses start with "ct_" (contracts)');
console.log('   - Transaction hashes start with "th_" (transactions)');
console.log('   - Example: ak_2KAcA2Pp3nrR8Wn3SEkDrC2oufkgLf8V1oW9vWgXy7K8x9mN2v');
console.log('');

console.log('3. 🌐 NETWORK MISMATCH');
console.log('   Problem: Trying to use mainnet key on testnet or vice versa');
console.log('   Solution:');
console.log('   - Ensure you\'re using testnet keys on testnet');
console.log('   - Check the network configuration');
console.log('   - Verify the RPC endpoint is correct');
console.log('');

console.log('4. 💰 INSUFFICIENT BALANCE');
console.log('   Problem: Not enough tokens to cover gas fees');
console.log('   Solution:');
console.log('   - Check your account balance');
console.log('   - Get more testnet tokens from faucet');
console.log('   - Increase gas price if needed');
console.log('');

console.log('5. 🔄 STALE NONCE');
console.log('   Problem: Using outdated nonce value');
console.log('   Solution:');
console.log('   - Refresh the nonce');
console.log('   - Wait for pending transactions to confirm');
console.log('   - Retry the transaction');
console.log('');

console.log('📋 STEP-BY-STEP TROUBLESHOOTING:');
console.log('');

console.log('Step 1: Verify Your Wallet');
console.log('   - Check your wallet address format (starts with ak_)');
console.log('   - Verify you have the correct private key');
console.log('   - Ensure you\'re on the correct network (testnet)');
console.log('');

console.log('Step 2: Check Account Balance');
console.log('   - Visit: https://testnet.aescan.io/account/YOUR_ADDRESS');
console.log('   - Ensure you have at least 0.5 AE for deployment');
console.log('   - Get more tokens if needed: https://testnet.faucet.aepps.com/');
console.log('');

console.log('Step 3: Verify Network Settings');
console.log('   - Ensure you\'re connected to Aeternity testnet');
console.log('   - RPC URL should be: https://testnet.aeternity.io');
console.log('   - Chain ID should be: ae_uat');
console.log('');

console.log('Step 4: Try Alternative Deployment Methods');
console.log('');

console.log('🌐 METHOD 1: AEStudio (Web IDE)');
console.log('   1. Go to: https://studio.aepps.com/');
console.log('   2. Connect your wallet');
console.log('   3. Import contract code');
console.log('   4. Deploy directly from browser');
console.log('');

console.log('💻 METHOD 2: Command Line (AEproject)');
console.log('   1. cd deployment/aeproject-deployment');
console.log('   2. Update aeproject.yaml with correct addresses');
console.log('   3. aeproject deploy --network testnet');
console.log('');

console.log('🔧 METHOD 3: Manual Wallet Setup');
console.log('   1. Generate new wallet if needed');
console.log('   2. Fund with testnet tokens');
console.log('   3. Use fresh wallet for deployment');
console.log('');

console.log('🆘 IF STILL HAVING ISSUES:');
console.log('');

console.log('1. 🔄 Generate New Wallet');
console.log('   - Create a fresh wallet');
console.log('   - Fund it with testnet tokens');
console.log('   - Try deployment with new wallet');
console.log('');

console.log('2. 📞 Get Help');
console.log('   - Aeternity Documentation: https://docs.aeternity.io/');
console.log('   - Community Forum: https://forum.aeternity.com/');
console.log('   - Discord: https://discord.gg/aeternity');
console.log('   - GitHub Issues: Report the specific error');
console.log('');

console.log('3. 🔍 Debug Information');
console.log('   - Note the exact error message');
console.log('   - Check browser console for additional errors');
console.log('   - Verify network connectivity');
console.log('   - Check if the Aeternity network is operational');
console.log('');

console.log('💡 TIPS:');
console.log('   • Always use testnet for development');
console.log('   • Keep your private keys secure');
console.log('   • Double-check all addresses and parameters');
console.log('   • Use the latest version of AEproject or AEStudio');
console.log('   • Clear browser cache if using web tools');
console.log('');

console.log('🎯 RECOMMENDED NEXT STEP:');
console.log('   Try AEStudio at https://studio.aepps.com/ - it handles');
console.log('   wallet connection and signature verification automatically.');
