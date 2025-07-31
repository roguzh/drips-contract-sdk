import { DripsSDK } from './drips-sdk';
import { RaffleDetails, RaffleStatus, NFTMetadata, RafflableNFT } from './types';
/**
 * Utility functions for the Drips SDK
 */
export declare class DripsUtils {
    /**
     * Format SUI amount from MIST to readable string
     */
    static formatSuiAmount(mistAmount: string | number): string;
    /**
     * Convert SUI amount to MIST
     */
    static suiToMist(suiAmount: number): string;
    /**
     * Check if a raffle is joinable
     */
    static isRaffleJoinable(raffle: RaffleDetails): boolean;
    /**
     * Check if a raffle needs winner selection
     */
    static needsWinnerSelection(raffle: RaffleDetails): boolean;
    /**
     * Get raffle status description
     */
    static getRaffleStatusDescription(status: RaffleStatus): string;
    /**
     * Get time remaining until deadline
     */
    static getTimeRemaining(deadline: string): string;
    /**
     * Validate NFT metadata
     */
    static isValidNFTMetadata(metadata: NFTMetadata): boolean;
    /**
     * Get shortened address for display
     */
    static shortenAddress(address: string, prefixLength?: number, suffixLength?: number): string;
    /**
     * Validate Sui address format
     */
    static isValidSuiAddress(address: string): boolean;
    /**
     * Generate a random deadline (for testing)
     */
    static generateRandomDeadline(minHours?: number, maxHours?: number): Date;
    /**
     * Filter compatible NFTs from a list
     */
    static filterCompatibleNFTs(nfts: RafflableNFT[]): RafflableNFT[];
    /**
     * Group NFTs by compatibility
     */
    static groupNFTsByCompatibility(nfts: RafflableNFT[]): {
        compatible: RafflableNFT[];
        incompatible: RafflableNFT[];
    };
    /**
     * Get NFTs with metadata only
     */
    static getNFTsWithMetadata(nfts: RafflableNFT[]): RafflableNFT[];
    /**
     * Sort NFTs by name (metadata name if available, otherwise by object ID)
     */
    static sortNFTsByName(nfts: RafflableNFT[]): RafflableNFT[];
    /**
     * Search NFTs by name or description
     */
    static searchNFTs(nfts: RafflableNFT[], query: string): RafflableNFT[];
    /**
     * Get a display name for an NFT
     */
    static getNFTDisplayName(nft: RafflableNFT): string;
    /**
     * Check if an NFT has an image
     */
    static hasImage(nft: RafflableNFT): boolean;
    /**
     * Get incompatibility reasons summary
     */
    static getIncompatibilityReasons(nfts: RafflableNFT[]): Record<string, number>;
}
/**
 * Builder pattern for creating raffles
 */
export declare class RaffleBuilder {
    private nftId?;
    private deadline?;
    private entryCost?;
    private maxCapacity?;
    private maxPerParticipant?;
    setNFT(nftId: string): RaffleBuilder;
    setDeadline(deadline: Date): RaffleBuilder;
    setDeadlineFromNow(hours: number): RaffleBuilder;
    setEntryCost(suiAmount: number): RaffleBuilder;
    setMaxCapacity(capacity: number): RaffleBuilder;
    setMaxPerParticipant(max: number): RaffleBuilder;
    build(): {
        nftId: string;
        deadline: Date;
        entryCost: string | undefined;
        maxCapacity: number | undefined;
        maxPerParticipant: number | undefined;
    };
}
/**
 * Event listener for raffle events (placeholder for future implementation)
 */
export declare class RaffleEventListener {
    private sdk;
    private listeners;
    constructor(sdk: DripsSDK);
    /**
     * Subscribe to raffle events
     */
    on(event: string, callback: Function): void;
    /**
     * Unsubscribe from raffle events
     */
    off(event: string, callback: Function): void;
    /**
     * Start listening for events (placeholder - would need WebSocket or polling implementation)
     */
    start(): void;
    /**
     * Stop listening for events
     */
    stop(): void;
}
//# sourceMappingURL=utils.d.ts.map