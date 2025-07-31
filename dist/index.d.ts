/**
 * Drips Raffle SDK for Sui Blockchain
 *
 * A comprehensive TypeScript SDK for interacting with Drips Raffle contracts
 * on the Sui blockchain. Provides easy-to-use methods for creating raffles,
 * joining raffles, selecting winners, and managing NFT metadata.
 */
export { DripsSDK } from './drips-sdk';
import { DripsSDK } from './drips-sdk';
export type { RaffleInfo, NFTMetadata, CreateRaffleParams, JoinRaffleParams, CreateRaffleResult, JoinRaffleResult, WinnerSelectionResult, RaffleDetails, RaffleStatus, SDKConfig, TransactionResult, TransactionBuilderResult, WalletAdapter, RaffleQueryOptions, RaffleQueryResult, DripsSDKError, RaffleNotFoundError, InvalidRaffleStateError, NetworkError } from './types';
export { DripsUtils, RaffleBuilder, RaffleEventListener } from './utils';
export declare const PACKAGE_IDS: {
    testnet: string;
    mainnet: string;
    devnet: string;
};
export declare const HOUSE_IDS: {
    testnet: string;
    mainnet: string;
    devnet: string;
};
/**
 * Create a new DripsSDK instance with default configuration
 */
export declare function createDripsSDK(network: 'testnet' | 'mainnet' | 'devnet', privateKey?: string): DripsSDK;
/**
 * Quick start example function
 */
export declare function quickStart(): Promise<void>;
export declare const VERSION = "1.0.0";
export type { SuiClient } from '@mysten/sui/client';
export type { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
//# sourceMappingURL=index.d.ts.map