import { SuiClient } from "@mysten/sui/client";
import { SDKConfig, NFTMetadata, CreateRaffleParams, JoinRaffleParams, CreateRaffleResult, JoinRaffleResult, WinnerSelectionResult, RaffleDetails, TransactionBuilderResult, WalletAdapter } from './types';
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
     * Get all active raffles (requires tracking raffle IDs externally)
     */
    getActiveRaffles(raffleIds: string[]): Promise<RaffleDetails[]>;
    /**
     * Get all ended raffles (requires tracking raffle IDs externally)
     */
    getEndedRaffles(raffleIds: string[]): Promise<RaffleDetails[]>;
    private getNFTType;
    private extractNFTTypeFromRaffle;
}
//# sourceMappingURL=drips-sdk.d.ts.map