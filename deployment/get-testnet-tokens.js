/**
 * Testnet Token Helper
 * Helps you get testnet AE tokens for deployment
 */

const { exec } = require('child_process');

console.log('💰 GETTING AETERNITY TESTNET TOKENS');
console.log('============================================================');
console.log('');

// Generate a sample wallet address for demonstration
const sampleAddress = 'ak_2KAcA2Pp3nrR8Wn3SEkDrC2oufkgLf8V1oW9vWgXy7K8x9mN2v';

console.log('📋 STEP-BY-STEP INSTRUCTIONS:');
console.log('');
console.log('1. 🌐 Open Aeternity Testnet Faucet:');
console.log('   https://testnet.faucet.aepps.com/');
console.log('');
console.log('2. 📝 Enter your wallet address (starts with ak_)');
console.log('   Example: ak_2KAcA2Pp3nrR8Wn3SEkDrC2oufkgLf8V1oW9vWgXy7K8x9mN2v');
console.log('');
console.log('3. 🎯 Request testnet tokens (you need at least 0.5 AE)');
console.log('');
console.log('4. ⏳ Wait for transaction confirmation');
console.log('');
console.log('5. ✅ Check your balance on explorer:');
console.log(`   https://testnet.aescan.io/account/${sampleAddress}`);
console.log('');

// Open faucet in browser
console.log('🌐 Opening testnet faucet in browser...');
exec('open "https://testnet.faucet.aepps.com/"', (error, stdout, stderr) => {
    if (error) {
        console.log('⚠️  Could not open browser automatically.');
        console.log('📋 Please open this URL manually: https://testnet.faucet.aepps.com/');
    } else {
        console.log('✅ Faucet opened in browser!');
    }
});

console.log('');
console.log('🔄 ALTERNATIVE FAUCETS (if the main one is down):');
console.log('   • https://faucet.aepps.com/');
console.log('   • https://forum.aeternity.com/ (community faucets)');
console.log('');
console.log('💡 TIPS:');
console.log('   • You need at least 0.5 AE for contract deployment');
console.log('   • Faucet transactions can take a few minutes');
console.log('   • Check the explorer to confirm you received tokens');
console.log('   • Keep your wallet address safe - you\'ll need it for deployment');
console.log('');
console.log('📞 NEED HELP?');
console.log('   • Aeternity Documentation: https://docs.aeternity.io/');
console.log('   • Community Forum: https://forum.aeternity.com/');
console.log('   • Discord: https://discord.gg/aeternity');
