/**
 * Drips Raffle SDK for Sui Blockchain
 * 
 * A comprehensive TypeScript SDK for interacting with Drips Raffle contracts
 * on the Sui blockchain. Provides easy-to-use methods for creating raffles,
 * joining raffles, selecting winners, and managing NFT metadata.
 */

// Main SDK class
export { DripsSDK } from './drips-sdk';
import { DripsSDK } from './drips-sdk';

// Types and interfaces
export {
  RaffleInfo,
  NFTMetadata,
  CreateRaffleParams,
  JoinRaffleParams,
  RaffleStatus,
  RaffleDetails,
  SDKConfig,
  TransactionResult,
  CreateRaffleResult,
  JoinRaffleResult,
  WinnerSelectionResult,
  RaffleEventType,
  RaffleEvent,
  TransactionBuilderResult,
  WalletAdapter,
  
  // Error types
  DripsSDKError,
  RaffleNotFoundError,
  InvalidRaffleStateError,
  InsufficientFundsError,
  NetworkError
} from './types';

// Utilities
export {
  DripsUtils,
  RaffleBuilder,
  RaffleEventListener
} from './utils';

// Default package IDs for different networks
export const PACKAGE_IDS = {
  testnet: '0xf1a54310356e2a90d896462e19ce926eae5903bce26bd4a37b7c8553b628f71d',
  mainnet: '', // To be filled when deployed to mainnet
  devnet: ''   // To be filled when deployed to devnet
};

/**
 * Create a new DripsSDK instance with default configuration
 */
export function createDripsSDK(network: 'testnet' | 'mainnet' | 'devnet', privateKey?: string): DripsSDK {
  const packageId = PACKAGE_IDS[network];
  if (!packageId) {
    throw new Error(`Package ID not available for network: ${network}`);
  }
  
  return new DripsSDK({
    network,
    packageId,
    privateKey
  });
}

/**
 * Quick start example function
 */
export async function quickStart() {
  console.log(`
🎰 Drips Raffle SDK Quick Start

// 1. Install the SDK
npm install @drips/raffle-sdk

// 2. Import and initialize
import { createDripsSDK, RaffleBuilder } from '@drips/raffle-sdk';

const sdk = createDripsSDK('testnet', 'your-private-key');

// 3. Create a raffle
const raffleParams = new RaffleBuilder()
  .setNFT('0x...')
  .setDeadlineFromNow(24) // 24 hours
  .build();

const result = await sdk.createRaffle(raffleParams);

// 4. Join a raffle
await sdk.joinRaffle({ raffleId: result.raffleId });

// 5. Get raffle details
const details = await sdk.getRaffleDetails(result.raffleId);
console.log(details);

For more examples, see the documentation.
  `);
}

// Version
export const VERSION = '1.0.0';

// Re-export commonly used types from @mysten/sui for convenience
export type { SuiClient } from '@mysten/sui/client';
export type { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
