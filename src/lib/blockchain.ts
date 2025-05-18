import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';
import { ethers } from 'ethers';

// ABI for the ConsentContract
const CONSENT_CONTRACT_ABI = [
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_patientId",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_procedureType",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_description",
        "type": "string"
      }
    ],
    "name": "createConsent",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_consentId",
        "type": "uint256"
      }
    ],
    "name": "signConsent",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_consentId",
        "type": "uint256"
      }
    ],
    "name": "getConsentStatus",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// Initialize Viem client
export const publicClient = createPublicClient({
  chain: mainnet,
  transport: http()
});

// Initialize ethers provider
const provider = new ethers.JsonRpcProvider(import.meta.env.VITE_ETHEREUM_RPC_URL || 'http://localhost:8545');

// Contract address (to be set after deployment)
const CONSENT_CONTRACT_ADDRESS = import.meta.env.VITE_CONSENT_CONTRACT_ADDRESS;

export class ConsentManager {
  private contract: ethers.Contract | null = null;

  constructor() {
    if (!CONSENT_CONTRACT_ADDRESS) {
      console.warn('CONSENT_CONTRACT_ADDRESS is not defined in environment variables. Contract functionality will be disabled.');
      return;
    }

    try {
      this.contract = new ethers.Contract(
        CONSENT_CONTRACT_ADDRESS,
        CONSENT_CONTRACT_ABI,
        provider
      );
    } catch (error) {
      console.error('Failed to initialize contract:', error);
      this.contract = null;
    }
  }

  private ensureContract(): ethers.Contract {
    if (!this.contract) {
      throw new Error(
        'Contract is not initialized. Please ensure VITE_CONSENT_CONTRACT_ADDRESS is set in your .env file.'
      );
    }
    return this.contract;
  }

  async createConsent(
    patientId: string,
    procedureType: string,
    description: string
  ): Promise<string> {
    try {
      const contract = this.ensureContract();
      const signer = await provider.getSigner();
      const contractWithSigner = contract.connect(signer);
      
      const tx = await contractWithSigner.createConsent(
        patientId,
        procedureType,
        description
      );
      
      const receipt = await tx.wait();
      return receipt.transactionHash;
    } catch (error) {
      if (error instanceof Error && error.message.includes('Contract is not initialized')) {
        throw error;
      }
      console.error('Error creating consent:', error);
      throw new Error('Failed to create consent on blockchain');
    }
  }

  async signConsent(consentId: number): Promise<string> {
    try {
      const contract = this.ensureContract();
      const signer = await provider.getSigner();
      const contractWithSigner = contract.connect(signer);
      
      const tx = await contractWithSigner.signConsent(consentId);
      const receipt = await tx.wait();
      return receipt.transactionHash;
    } catch (error) {
      if (error instanceof Error && error.message.includes('Contract is not initialized')) {
        throw error;
      }
      console.error('Error signing consent:', error);
      throw new Error('Failed to sign consent on blockchain');
    }
  }

  async getConsentStatus(consentId: number): Promise<boolean> {
    try {
      const contract = this.ensureContract();
      return await contract.getConsentStatus(consentId);
    } catch (error) {
      if (error instanceof Error && error.message.includes('Contract is not initialized')) {
        throw error;
      }
      console.error('Error getting consent status:', error);
      throw new Error('Failed to get consent status from blockchain');
    }
  }

  async verifyConsentHash(transactionHash: string): Promise<boolean> {
    try {
      const tx = await provider.getTransaction(transactionHash);
      return tx !== null;
    } catch (error) {
      console.error('Error verifying consent hash:', error);
      throw new Error('Failed to verify consent hash on blockchain');
    }
  }
}

// Export a singleton instance
export const consentManager = new ConsentManager();