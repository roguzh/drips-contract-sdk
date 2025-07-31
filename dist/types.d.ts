/**
 * Core types and interfaces for the Drips Raffle SDK
 */
export interface RaffleInfo {
    objectId: string;
    version: string;
    digest: string;
    type: string;
    fields: {
        balance: string;
        cost: any;
        deadline: string;
        is_raffle_paused: boolean;
        is_raffle_item_locked: boolean;
        max_capacity: any;
        max_per_participant: any;
        participants_count: string;
        raffle_item_id: string;
        winner_address: any;
        operator_cap_id: string;
    };
}
export interface NFTMetadata {
    objectId: string;
    name: string;
    description: string;
    image_url: string;
    symbol?: string;
    creator?: string;
    collection?: string;
    attributes?: any[];
}
export interface CreateRaffleParams {
    nftId: string;
    deadline: Date;
    entryCost?: string;
    maxCapacity?: number;
    maxPerParticipant?: number;
}
export interface JoinRaffleParams {
    raffleId: string;
    entryCost?: string;
}
export interface RaffleStatus {
    isActive: boolean;
    isEnded: boolean;
    hasWinner: boolean;
    isPastDeadline: boolean;
    isPaused: boolean;
    isJoinable: boolean;
}
export interface RaffleDetails extends RaffleInfo {
    status: RaffleStatus;
    nftMetadata?: NFTMetadata;
    formattedDeadline: string;
    formattedBalance: string;
    participantsCount: number;
}
export interface SDKConfig {
    network: 'testnet' | 'mainnet' | 'devnet';
    packageId: string;
    houseId: string;
    privateKey?: string;
}
export interface WalletAdapter {
    signAndExecuteTransaction: (params: {
        transaction: any;
        options?: {
            showEffects?: boolean;
            showEvents?: boolean;
            showObjectChanges?: boolean;
        };
    }) => Promise<any>;
    getAddress?: () => string;
}
export interface TransactionBuilderResult {
    transaction: any;
    metadata: {
        action: string;
        description: string;
        estimatedGas?: string;
    };
}
export interface TransactionResult {
    success: boolean;
    transactionHash?: string;
    error?: string;
    gasUsed?: string;
}
export interface CreateRaffleResult extends TransactionResult {
    raffleId?: string;
    operatorCapId?: string;
}
export interface JoinRaffleResult extends TransactionResult {
    participantCount?: number;
}
export interface WinnerSelectionResult extends TransactionResult {
    winner?: string;
    winnerAddress?: string;
    participantCount?: number;
    prizeTransferred?: boolean;
}
export interface RaffleQueryOptions {
    limit?: number;
    cursor?: string;
    includeDetails?: boolean;
    status?: 'active' | 'ended' | 'all';
}
export interface RaffleQueryResult {
    raffles: RaffleDetails[];
    hasNextPage: boolean;
    nextCursor?: string;
    totalCount?: number;
}
export declare enum RaffleEventType {
    RAFFLE_CREATED = "RaffleCreated",
    PARTICIPANT_JOINED = "ParticipantJoined",
    WINNER_SELECTED = "WinnerSelected",
    RAFFLE_PAUSED = "RafflePaused",
    RAFFLE_UNPAUSED = "RaffleUnpaused"
}
export interface RaffleEvent {
    type: RaffleEventType;
    raffleId: string;
    timestamp: number;
    transactionHash: string;
    data: any;
}
export declare class DripsSDKError extends Error {
    code?: string | undefined;
    constructor(message: string, code?: string | undefined);
}
export declare class RaffleNotFoundError extends DripsSDKError {
    constructor(raffleId: string);
}
export declare class InvalidRaffleStateError extends DripsSDKError {
    constructor(message: string);
}
export declare class InsufficientFundsError extends DripsSDKError {
    constructor(required: string, available: string);
}
export declare class NetworkError extends DripsSDKError {
    constructor(message: string);
}
//# sourceMappingURL=types.d.ts.map