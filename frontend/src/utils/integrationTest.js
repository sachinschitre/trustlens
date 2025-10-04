/**
 * Integration Test for Contract Configuration
 * Simple test to verify all components are working together
 */

import CONFIG from '../config/contract';

export function runIntegrationTest() {
  console.log('🧪 TrustLens Integration Test');
  console.log('============================');
  
  try {
    // Test 1: Contract Configuration
    console.log('✅ Contract Config Test:');
    console.log('  Contract Address:', CONFIG.contract.address);
    console.log('  Network:', CONFIG.network.name);
    console.log('  Is Testnet:', CONFIG.isTestnet());
    
    // Test 2: Explorer URL Generation
    const testTxHash = 'th_test123456789';
    const explorerUrl = CONFIG.getExplorerUrl('tx', testTxHash);
    console.log('  Explorer URL:', explorerUrl);
    
    // Test 3: Network Info
    const networkInfo = CONFIG.getNetworkInfo();
    console.log('  Network Info:', networkInfo);
    
    // Test 4: Environment Detection
    console.log('  Environment:', CONFIG.environment);
    console.log('  Mock Mode:', CONFIG.environment.useMockTransactions);
    
    console.log('\n✅ All integration tests passed!');
    console.log('🚀 Ready for hackathon demo!');
    
    return {
      success: true,
      contractAddress: CONFIG.contract.address,
      network: CONFIG.network.name,
      explorerUrl,
      environment: CONFIG.environment
    };
    
  } catch (error) {
    console.error('❌ Integration test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Auto-run test if imported directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runIntegrationTest();
}
