import { SuiClient } from "@mysten/sui/client";
import { SDKConfig, NFTMetadata, CreateRaffleParams, JoinRaffleParams, CreateRaffleResult, JoinRaffleResult, WinnerSelectionResult, RaffleDetails, TransactionBuilderResult, WalletAdapter, RaffleQueryOptions, RaffleQueryResult, RafflableNFTsResult, GetRafflableNFTsOptions } from './types';
/**
 * Main Drips Raffle SDK class for interacting with Drips contracts on Sui
 */
export declare class DripsSDK {
    private client;
    private config;
    private defaultKeypair?;
    constructor(config: SDKConfig);
    /**
     * Get the Sui client instance
     */
    getClient(): SuiClient;
    /**
     * Get the SDK configuration
     */
    getConfig(): SDKConfig;
    /**
     * Set a default keypair for transactions
     */
    setDefaultKeypair(privateKey: string): void;
    /**
     * Build a transaction for creating a raffle (for wallet signing)
     */
    buildCreateRaffleTransaction(params: CreateRaffleParams): TransactionBuilderResult;
    /**
     * Build a transaction for joining a raffle (for wallet signing)
     */
    buildJoinRaffleTransaction(params: JoinRaffleParams): Promise<TransactionBuilderResult>;
    /**
     * Build a transaction for selecting a winner (for wallet signing)
     */
    buildSelectWinnerTransaction(raffleId: string, operatorCapId: string): Promise<TransactionBuilderResult>;
    /**
     * Create a raffle using a wallet adapter
     */
    createRaffleWithWallet(params: CreateRaffleParams, wallet: WalletAdapter): Promise<CreateRaffleResult>;
    /**
     * Join a raffle using a wallet adapter
     */
    joinRaffleWithWallet(params: JoinRaffleParams, wallet: WalletAdapter): Promise<JoinRaffleResult>;
    /**
     * Select a winner using a wallet adapter
     */
    selectWinnerWithWallet(raffleId: string, operatorCapId: string, wallet: WalletAdapter): Promise<WinnerSelectionResult>;
    /**
     * Create a new raffle
     */
    createRaffle(params: CreateRaffleParams, privateKey?: string): Promise<CreateRaffleResult>;
    /**
     * Join an existing raffle
     */
    joinRaffle(params: JoinRaffleParams, privateKey?: string): Promise<JoinRaffleResult>;
    /**
     * Select a winner for a raffle (requires operator capability)
     */
    selectWinner(raffleId: string, operatorCapId: string, privateKey?: string): Promise<WinnerSelectionResult>;
    /**
     * Get detailed information about a raffle
     */
    getRaffleDetails(raffleId: string): Promise<RaffleDetails>;
    /**
     * Get NFT metadata
     */
    getNFTMetadata(nftId: string): Promise<NFTMetadata | null>;
    /**
     * Get all rafflable NFTs owned by a user
     * Returns NFTs that can be used to create raffles
     */
    getRafflableNFTs(userAddress: string, options?: GetRafflableNFTsOptions): Promise<RafflableNFTsResult>;
    /**
     * Check if an object is a system object (coin, gas object, etc.)
     */
    private isSystemObject;
    /**
     * Check if an NFT is compatible with the raffle contract
     */
    private checkNFTCompatibility;
    /**
     * Get all active raffles (requires tracking raffle IDs externally)
     */
    getActiveRaffles(raffleIds: string[]): Promise<RaffleDetails[]>;
    /**
     * Get all ended raffles (requires tracking raffle IDs externally)
     */
    getEndedRaffles(raffleIds: string[]): Promise<RaffleDetails[]>;
    /**
     * Query raffles from the blockchain using events and object queries
     * This implementation works with the actual contract structure
     */
    queryRaffles(options?: RaffleQueryOptions): Promise<RaffleQueryResult>;
    /**
     * Get all raffles created by a specific creator address
     * Uses OperatorCap objects to find raffles owned by the creator
     */
    getRafflesByCreator(creatorAddress: string, options?: RaffleQueryOptions): Promise<RaffleQueryResult>;
    /**
     * Search for raffles containing specific NFT types or names
     */
    searchRaffles(searchTerm: string, options?: RaffleQueryOptions): Promise<RaffleQueryResult>;
    private getNFTType;
    private extractNFTTypeFromRaffle;
}
//# sourceMappingURL=drips-sdk.d.ts.map