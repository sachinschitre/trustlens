import toast from 'react-hot-toast';

class ContractService {
  constructor(wallet) {
    this.wallet = wallet;
    this.contract = null;
    this.projectDetails = null;
  }

  // Connect to existing contract by address
  async ConnectToContract(contractAddress) {
    try {
      // Mock contract connection for demo
      this.contract = {
        address: contractAddress,
        mockContract: true
      };
      
      this.projectDetails = {
        client: 'ak_clientAddress123456789',
        freelancer: 'ak_freelancerAddress987654321',
        mediator: 'ak_mediatorAddress456789123',
        amount: 1000000000000000000, // 1 AE
        deadline: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days
        disputed: false
      };

      toast.success('Contract connected! (Demo mode)');
      return this.contract;
    } catch (error) {
      console.error('Contract connection error:', error);
      toast.error(`Failed to connect to contract: ${error.message}`);
      throw error;
    }
  }

  // Deploy new contract
  async deployContract(params) {
    try {
      // Mock contract deployment for demo
      this.contract = {
        address: `ct_mock${Date.now()}`,
        mockContract: true
      };
      
      this.projectDetails = {
        client: params.client,
        freelancer: params.freelancer,
        mediator: params.mediator,
        amount: params.amount,
        deadline: params.deadline,
        disputed: false
      };

      toast.success('Contract deployed! (Demo mode)');
      return {
        address: this.contract.address,
        txHash: `tx_mock${Date.now()}`,
        gasUsed: 50000
      };
    } catch (error) {
      console.error('Contract deployment error:', error);
      toast.error(`Deployment failed: ${error.message}`);
      throw error;
    }
  }

  // Contract interaction methods
  async deposit(amount) {
    try {
      // Mock deposit transaction
      toast.success(`Deposit successful! Amount: ${amount / 1e18} AE`);
      return {
        txHash: `tx_deposit_${Date.now()}`,
        status: 'success',
        gasUsed: 25000
      };
    } catch (error) {
      console.error('Deposit error:', error);
      toast.error(`Deposit failed: ${error.message}`);
      throw error;
    }
  }

  async release() {
    try {
      // Mock release transaction
      toast.success('Funds released successfully!');
      return {
        txHash: `tx_release_${Date.now()}`,
        status: 'success',
        gasUsed: 30000
      };
    } catch (error) {
      console.error('Release error:', error);
      toast.error(`Release failed: ${error.message}`);
      throw error;
    }
  }

  async dispute(reason) {
    try {
      // Mock dispute transaction
      this.projectDetails.disputed = true;
      toast.success('Dispute raised successfully!');
      return {
        txHash: `tx_dispute_${Date.now()}`,
        status: 'success',
        gasUsed: 20000
      };
    } catch (error) {
      console.error('Dispute error:', error);
      toast.error(`Dispute failed: ${error.message}`);
      throw error;
    }
  }

  async refund() {
    try {
      // Mock refund transaction
      this.projectDetails.disputed = false;
      toast.success('Refund processed successfully!');
      return {
        txHash: `tx_refund_${Date.now()}`,
        status: 'success',
        gasUsed: 25000
      };
    } catch (error) {
      console.error('Refund error:', error);
      toast.error(`Refund failed: ${error.message}`);
      throw error;
    }
  }

  async getProjectDetails() {
    if (!this.contract) {
      throw new Error('Contract not connected');
    }

    return this.projectDetails;
  }

  // Helper methods
  async getClientAddress() {
    const details = await this.getProjectDetails();
    return details.client;
  }

  async getFreelancerAddress() {
    const details = await this.getProjectDetails();
    return details.freelancer;
  }

  async getMediatorAddress() {
    const details = await this.getProjectDetails();
    return details.mediator;
  }

  isContractConnected() {
    return this.contract !== null;
  }

  getContractAddress() {
    return this.contract?.address;
  }
}

export default ContractService;