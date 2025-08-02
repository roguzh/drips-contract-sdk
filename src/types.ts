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

export interface HouseInfo {
  objectId: string;
  version: string;
  digest: string;
  type: string;
  feePercentage: number; // Fee percentage in basis points (e.g., 100 = 1%)
  feeBalances: Record<string, string>; // Coin type -> balance mapping
  kioskOwnerCapId: string;
  formattedFeePercentage: string; // Human readable percentage (e.g., "1%")
}

export interface RaffleFinancials {
  entryCost: string; // Cost per ticket in MIST (1 SUI = 1e9 MIST)
  totalBalance: string; // Total accumulated balance in MIST
  participantsCount: number; // Number of participants/tickets sold
  totalRevenue: string; // Total revenue generated (participants * cost)
  houseRevenue: string; // Estimated house fee taken
  netBalance: string; // Balance remaining in raffle after fees
  formattedEntryCost: string; // Human readable cost (e.g., "0.1 SUI")
  formattedTotalBalance: string; // Human readable balance
  formattedTotalRevenue: string; // Human readable revenue
  isFree: boolean; // Whether the raffle is free to join
}

export interface CreateRaffleParams {
  nftId: string;
  deadline: Date;
  entryCost?: string; // SUI amount in MIST (1 SUI = 1e9 MIST)
  maxCapacity?: number;
  maxPerParticipant?: number;
}

export interface JoinRaffleParams {
  raffleId: string;
  entryCost?: string; // SUI amount in MIST if raffle has entry cost
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
  houseId: string; // House object ID for querying raffles
  privateKey?: string; // Optional default private key for server-side use
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
  transaction: any; // The built transaction ready for signing
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
  winnerAddress?: string; // Add this for compatibility
  participantCount?: number;
  prizeTransferred?: boolean; // Add this for compatibility
}

export interface RaffleQueryOptions {
  limit?: number; // Max number of raffles to return
  cursor?: string; // For pagination
  includeDetails?: boolean; // Whether to fetch full details for each raffle
  status?: 'active' | 'ended' | 'all'; // Filter by status
}

export interface RaffleQueryResult {
  raffles: RaffleDetails[];
  hasNextPage: boolean;
  nextCursor?: string;
  totalCount?: number;
}

export interface RafflableNFT {
  objectId: string;
  type: string;
  version: string;
  digest: string;
  metadata?: NFTMetadata;
  isCompatible: boolean;
  incompatibilityReason?: string;
}

export interface RafflableNFTsResult {
  nfts: RafflableNFT[];
  total: number;
  hasNextPage: boolean;
  nextCursor?: string;
}

export interface GetRafflableNFTsOptions {
  includeMetadata?: boolean;
  onlyCompatible?: boolean;
  limit?: number;
  cursor?: string;
}

// Error classes

export enum RaffleEventType {
  RAFFLE_CREATED = 'RaffleCreated',
  PARTICIPANT_JOINED = 'ParticipantJoined',
  WINNER_SELECTED = 'WinnerSelected',
  RAFFLE_PAUSED = 'RafflePaused',
  RAFFLE_UNPAUSED = 'RaffleUnpaused'
}

export interface RaffleEvent {
  type: RaffleEventType;
  raffleId: string;
  timestamp: number;
  transactionHash: string;
  data: any;
}

// Error types
export class DripsSDKError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'DripsSDKError';
  }
}

export class RaffleNotFoundError extends DripsSDKError {
  constructor(raffleId: string) {
    super(`Raffle not found: ${raffleId}`, 'RAFFLE_NOT_FOUND');
  }
}

export class InvalidRaffleStateError extends DripsSDKError {
  constructor(message: string) {
    super(message, 'INVALID_RAFFLE_STATE');
  }
}

export class InsufficientFundsError extends DripsSDKError {
  constructor(required: string, available: string) {
    super(`Insufficient funds: required ${required}, available ${available}`, 'INSUFFICIENT_FUNDS');
  }
}

export class NetworkError extends DripsSDKError {
  constructor(message: string) {
    super(`Network error: ${message}`, 'NETWORK_ERROR');
  }
}
