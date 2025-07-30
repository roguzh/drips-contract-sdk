"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DripsSDK = void 0;
const client_1 = require("@mysten/sui/client");
const ed25519_1 = require("@mysten/sui/keypairs/ed25519");
const transactions_1 = require("@mysten/sui/transactions");
const utils_1 = require("@mysten/sui/utils");
const types_1 = require("./types");
/**
 * Main Drips Raffle SDK class for interacting with Drips contracts on Sui
 */
class DripsSDK {
    constructor(config) {
        this.config = config;
        this.client = new client_1.SuiClient({ url: (0, client_1.getFullnodeUrl)(config.network) });
        if (config.privateKey) {
            this.defaultKeypair = ed25519_1.Ed25519Keypair.fromSecretKey((0, utils_1.fromB64)(config.privateKey));
        }
    }
    /**
     * Get the Sui client instance
     */
    getClient() {
        return this.client;
    }
    /**
     * Get the SDK configuration
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * Set a default keypair for transactions
     */
    setDefaultKeypair(privateKey) {
        this.defaultKeypair = ed25519_1.Ed25519Keypair.fromSecretKey((0, utils_1.fromB64)(privateKey));
    }
    /**
     * Build a transaction for creating a raffle (for wallet signing)
     */
    buildCreateRaffleTransaction(params) {
        const txb = new transactions_1.Transaction();
        // Add deadline in milliseconds
        const deadlineMs = params.deadline.getTime();
        // Create the raffle
        const [raffle, operatorCap] = txb.moveCall({
            target: `${this.config.packageId}::raffle::create_raffle`,
            arguments: [
                txb.object(params.nftId),
                txb.pure.u64(deadlineMs)
            ],
            typeArguments: ['0x2::sui::SUI', `${params.nftId.split('::')[0]}::nft::Nft`], // Simplified type extraction
        });
        // Note: The wallet will handle transferring the operator cap to the signer
        // We'll return the transaction for the wallet to complete
        return {
            transaction: txb,
            metadata: {
                action: 'create_raffle',
                description: `Create raffle for NFT ${params.nftId}`,
                estimatedGas: '0.01 SUI' // Rough estimate
            }
        };
    }
    /**
     * Build a transaction for joining a raffle (for wallet signing)
     */
    async buildJoinRaffleTransaction(params) {
        // First check if raffle is joinable
        const raffleDetails = await this.getRaffleDetails(params.raffleId);
        if (!raffleDetails.status.isJoinable) {
            throw new types_1.InvalidRaffleStateError('Raffle is not joinable');
        }
        const txb = new transactions_1.Transaction();
        // Join the raffle
        txb.moveCall({
            target: `${this.config.packageId}::raffle::join_raffle`,
            arguments: [
                txb.object(params.raffleId)
            ],
            typeArguments: ['0x2::sui::SUI', this.extractNFTTypeFromRaffle(raffleDetails.type)],
        });
        return {
            transaction: txb,
            metadata: {
                action: 'join_raffle',
                description: `Join raffle ${params.raffleId}`,
                estimatedGas: '0.005 SUI' // Rough estimate
            }
        };
    }
    /**
     * Build a transaction for selecting a winner (for wallet signing)
     */
    async buildSelectWinnerTransaction(raffleId, operatorCapId) {
        const txb = new transactions_1.Transaction();
        // Get raffle details to extract type arguments
        const raffleDetails = await this.getRaffleDetails(raffleId);
        const nftType = this.extractNFTTypeFromRaffle(raffleDetails.type);
        txb.moveCall({
            target: `${this.config.packageId}::raffle::select_winner`,
            arguments: [
                txb.object(raffleId),
                txb.object(operatorCapId)
            ],
            typeArguments: ['0x2::sui::SUI', nftType],
        });
        return {
            transaction: txb,
            metadata: {
                action: 'select_winner',
                description: `Select winner for raffle ${raffleId}`,
                estimatedGas: '0.01 SUI' // Rough estimate
            }
        };
    }
    /**
     * Create a raffle using a wallet adapter
     */
    async createRaffleWithWallet(params, wallet) {
        try {
            const { transaction, metadata } = this.buildCreateRaffleTransaction(params);
            const result = await wallet.signAndExecuteTransaction({
                transaction,
                options: {
                    showEffects: true,
                    showEvents: true,
                    showObjectChanges: true,
                },
            });
            if (result.effects?.status?.status !== 'success') {
                throw new types_1.DripsSDKError(`Transaction failed: ${result.effects?.status?.error}`);
            }
            // Extract raffle ID and operator cap ID from object changes
            let raffleId = '';
            let operatorCapId = '';
            if (result.objectChanges) {
                for (const change of result.objectChanges) {
                    if (change.type === 'created') {
                        if (change.objectType.includes('::raffle::Raffle')) {
                            raffleId = change.objectId;
                        }
                        else if (change.objectType.includes('::raffle::OperatorCap')) {
                            operatorCapId = change.objectId;
                        }
                    }
                }
            }
            return {
                success: true,
                transactionHash: result.digest,
                raffleId,
                operatorCapId,
                gasUsed: result.effects?.gasUsed?.computationCost
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }
    /**
     * Join a raffle using a wallet adapter
     */
    async joinRaffleWithWallet(params, wallet) {
        try {
            const { transaction, metadata } = await this.buildJoinRaffleTransaction(params);
            const result = await wallet.signAndExecuteTransaction({
                transaction,
                options: {
                    showEffects: true,
                    showEvents: true,
                },
            });
            if (result.effects?.status?.status !== 'success') {
                throw new types_1.DripsSDKError(`Transaction failed: ${result.effects?.status?.error}`);
            }
            // Get updated participant count
            const updatedRaffle = await this.getRaffleDetails(params.raffleId);
            return {
                success: true,
                transactionHash: result.digest,
                participantCount: updatedRaffle.participantsCount,
                gasUsed: result.effects?.gasUsed?.computationCost
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }
    /**
     * Select a winner using a wallet adapter
     */
    async selectWinnerWithWallet(raffleId, operatorCapId, wallet) {
        try {
            const { transaction, metadata } = await this.buildSelectWinnerTransaction(raffleId, operatorCapId);
            const result = await wallet.signAndExecuteTransaction({
                transaction,
                options: {
                    showEffects: true,
                    showEvents: true,
                },
            });
            if (result.effects?.status?.status !== 'success') {
                throw new types_1.DripsSDKError(`Transaction failed: ${result.effects?.status?.error}`);
            }
            // Get updated raffle to check winner
            const updatedRaffle = await this.getRaffleDetails(raffleId);
            return {
                success: true,
                transactionHash: result.digest,
                winnerAddress: updatedRaffle.fields.winner_address,
                prizeTransferred: !!updatedRaffle.fields.winner_address,
                gasUsed: result.effects?.gasUsed?.computationCost
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }
    /**
     * Create a new raffle
     */
    async createRaffle(params, privateKey) {
        try {
            const keypair = privateKey ?
                ed25519_1.Ed25519Keypair.fromSecretKey((0, utils_1.fromB64)(privateKey)) :
                this.defaultKeypair;
            if (!keypair) {
                throw new types_1.DripsSDKError('No private key provided');
            }
            const txb = new transactions_1.Transaction();
            // Add deadline in milliseconds
            const deadlineMs = params.deadline.getTime();
            // Create the raffle
            const [raffle, operatorCap] = txb.moveCall({
                target: `${this.config.packageId}::raffle::create_raffle`,
                arguments: [
                    txb.object(params.nftId),
                    txb.pure.u64(deadlineMs)
                ],
                typeArguments: ['0x2::sui::SUI', `${this.getNFTType(params.nftId)}`],
            });
            // Transfer operator capability to sender
            txb.transferObjects([operatorCap], keypair.getPublicKey().toSuiAddress());
            const result = await this.client.signAndExecuteTransaction({
                signer: keypair,
                transaction: txb,
                options: {
                    showEffects: true,
                    showEvents: true,
                    showObjectChanges: true,
                },
            });
            if (result.effects?.status?.status !== 'success') {
                throw new types_1.DripsSDKError(`Transaction failed: ${result.effects?.status?.error}`);
            }
            // Extract raffle ID and operator cap ID from object changes
            let raffleId = '';
            let operatorCapId = '';
            if (result.objectChanges) {
                for (const change of result.objectChanges) {
                    if (change.type === 'created') {
                        if (change.objectType.includes('::raffle::Raffle')) {
                            raffleId = change.objectId;
                        }
                        else if (change.objectType.includes('::raffle::OperatorCap')) {
                            operatorCapId = change.objectId;
                        }
                    }
                }
            }
            return {
                success: true,
                transactionHash: result.digest,
                raffleId,
                operatorCapId,
                gasUsed: result.effects?.gasUsed?.computationCost
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }
    /**
     * Join an existing raffle
     */
    async joinRaffle(params, privateKey) {
        try {
            const keypair = privateKey ?
                ed25519_1.Ed25519Keypair.fromSecretKey((0, utils_1.fromB64)(privateKey)) :
                this.defaultKeypair;
            if (!keypair) {
                throw new types_1.DripsSDKError('No private key provided');
            }
            // First check if raffle is joinable
            const raffleDetails = await this.getRaffleDetails(params.raffleId);
            if (!raffleDetails.status.isJoinable) {
                throw new types_1.InvalidRaffleStateError('Raffle is not joinable');
            }
            const txb = new transactions_1.Transaction();
            // If raffle is paused, unpause it first (if we have operator cap)
            if (raffleDetails.status.isPaused) {
                // This would require operator cap - for now just throw error
                throw new types_1.InvalidRaffleStateError('Raffle is paused');
            }
            // Join the raffle
            txb.moveCall({
                target: `${this.config.packageId}::raffle::join_raffle`,
                arguments: [
                    txb.object(params.raffleId)
                ],
                typeArguments: ['0x2::sui::SUI', this.extractNFTTypeFromRaffle(raffleDetails.type)],
            });
            const result = await this.client.signAndExecuteTransaction({
                signer: keypair,
                transaction: txb,
                options: {
                    showEffects: true,
                    showEvents: true,
                },
            });
            if (result.effects?.status?.status !== 'success') {
                throw new types_1.DripsSDKError(`Transaction failed: ${result.effects?.status?.error}`);
            }
            // Get updated participant count
            const updatedRaffle = await this.getRaffleDetails(params.raffleId);
            return {
                success: true,
                transactionHash: result.digest,
                participantCount: updatedRaffle.participantsCount,
                gasUsed: result.effects?.gasUsed?.computationCost
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }
    /**
     * Select a winner for a raffle (requires operator capability)
     */
    async selectWinner(raffleId, operatorCapId, privateKey) {
        try {
            const keypair = privateKey ?
                ed25519_1.Ed25519Keypair.fromSecretKey((0, utils_1.fromB64)(privateKey)) :
                this.defaultKeypair;
            if (!keypair) {
                throw new types_1.DripsSDKError('No private key provided');
            }
            const txb = new transactions_1.Transaction();
            // Get raffle details to extract type arguments
            const raffleDetails = await this.getRaffleDetails(raffleId);
            const nftType = this.extractNFTTypeFromRaffle(raffleDetails.type);
            txb.moveCall({
                target: `${this.config.packageId}::raffle::select_winner`,
                arguments: [
                    txb.object(raffleId),
                    txb.object(operatorCapId)
                ],
                typeArguments: ['0x2::sui::SUI', nftType],
            });
            const result = await this.client.signAndExecuteTransaction({
                signer: keypair,
                transaction: txb,
                options: {
                    showEffects: true,
                    showEvents: true,
                },
            });
            if (result.effects?.status?.status !== 'success') {
                throw new types_1.DripsSDKError(`Transaction failed: ${result.effects?.status?.error}`);
            }
            // Get updated raffle to check winner
            const updatedRaffle = await this.getRaffleDetails(raffleId);
            return {
                success: true,
                transactionHash: result.digest,
                winnerAddress: updatedRaffle.fields.winner_address,
                prizeTransferred: !!updatedRaffle.fields.winner_address,
                gasUsed: result.effects?.gasUsed?.computationCost
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }
    /**
     * Get detailed information about a raffle
     */
    async getRaffleDetails(raffleId) {
        try {
            const raffleData = await this.client.getObject({
                id: raffleId,
                options: {
                    showContent: true,
                    showType: true,
                }
            });
            if (!raffleData.data || !raffleData.data.content || !('fields' in raffleData.data.content)) {
                throw new types_1.RaffleNotFoundError(raffleId);
            }
            const fields = raffleData.data.content.fields;
            const raffleInfo = {
                objectId: raffleData.data.objectId,
                version: raffleData.data.version,
                digest: raffleData.data.digest,
                type: raffleData.data.type || '',
                fields: {
                    balance: fields.balance || '0',
                    cost: fields.cost,
                    deadline: fields.deadline,
                    is_raffle_paused: fields.is_raffle_paused,
                    is_raffle_item_locked: fields.is_raffle_item_locked,
                    max_capacity: fields.max_capacity,
                    max_per_participant: fields.max_per_participant,
                    participants_count: fields.participants_count || '0',
                    raffle_item_id: fields.raffle_item_id,
                    winner_address: fields.winner_address,
                    operator_cap_id: fields.operator_cap_id
                }
            };
            // Calculate status
            const now = Date.now();
            const deadline = parseInt(raffleInfo.fields.deadline);
            const hasWinner = !!raffleInfo.fields.winner_address;
            const isPastDeadline = now >= deadline;
            const isPaused = raffleInfo.fields.is_raffle_paused;
            const isEnded = hasWinner || isPastDeadline;
            const isActive = !isPaused && !hasWinner && now < deadline;
            const status = {
                isActive,
                isEnded,
                hasWinner,
                isPastDeadline,
                isPaused,
                isJoinable: isActive && !isPaused
            };
            // Get NFT metadata if available
            let nftMetadata;
            if (raffleInfo.fields.raffle_item_id) {
                try {
                    const metadata = await this.getNFTMetadata(raffleInfo.fields.raffle_item_id);
                    nftMetadata = metadata || undefined;
                }
                catch (error) {
                    // NFT metadata is optional, continue without it
                }
            }
            const details = {
                ...raffleInfo,
                status,
                nftMetadata,
                formattedDeadline: new Date(deadline).toISOString(),
                formattedBalance: (parseInt(raffleInfo.fields.balance) / 1000000000).toString() + ' SUI',
                participantsCount: parseInt(raffleInfo.fields.participants_count)
            };
            return details;
        }
        catch (error) {
            if (error instanceof types_1.DripsSDKError) {
                throw error;
            }
            throw new types_1.NetworkError(error instanceof Error ? error.message : 'Failed to fetch raffle details');
        }
    }
    /**
     * Get NFT metadata
     */
    async getNFTMetadata(nftId) {
        try {
            const nftData = await this.client.getObject({
                id: nftId,
                options: {
                    showContent: true,
                    showType: true,
                    showDisplay: true,
                }
            });
            if (!nftData.data) {
                return null;
            }
            // Extract metadata from display fields (standardized way)
            const display = nftData.data.display?.data;
            // Also try to get data from content fields
            let contentFields = {};
            if (nftData.data.content && 'fields' in nftData.data.content) {
                contentFields = nftData.data.content.fields;
            }
            const metadata = {
                objectId: nftData.data.objectId,
                name: display?.name || contentFields?.name || "Unknown NFT",
                description: display?.description || contentFields?.description || "No description available",
                image_url: display?.image_url || contentFields?.url || contentFields?.image_url || "",
                symbol: contentFields?.symbol || undefined,
                creator: display?.creator || contentFields?.creator || undefined,
                collection: contentFields?.collection || undefined,
                attributes: contentFields?.attributes || undefined
            };
            return metadata;
        }
        catch (error) {
            throw new types_1.NetworkError(`Failed to fetch NFT metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Get all active raffles (requires tracking raffle IDs externally)
     */
    async getActiveRaffles(raffleIds) {
        const activeRaffles = [];
        for (const raffleId of raffleIds) {
            try {
                const details = await this.getRaffleDetails(raffleId);
                if (details.status.isActive) {
                    activeRaffles.push(details);
                }
            }
            catch (error) {
                // Skip raffles that can't be fetched
                continue;
            }
        }
        return activeRaffles;
    }
    /**
     * Get all ended raffles (requires tracking raffle IDs externally)
     */
    async getEndedRaffles(raffleIds) {
        const endedRaffles = [];
        for (const raffleId of raffleIds) {
            try {
                const details = await this.getRaffleDetails(raffleId);
                if (details.status.isEnded) {
                    endedRaffles.push(details);
                }
            }
            catch (error) {
                // Skip raffles that can't be fetched
                continue;
            }
        }
        return endedRaffles;
    }
    // Helper methods
    async getNFTType(nftId) {
        try {
            const nftData = await this.client.getObject({
                id: nftId,
                options: { showType: true }
            });
            return nftData.data?.type || '';
        }
        catch (error) {
            throw new types_1.DripsSDKError(`Failed to get NFT type: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    extractNFTTypeFromRaffle(raffleType) {
        // Extract NFT type from raffle type string
        // Example: "0x...::raffle::Raffle<0x2::sui::SUI, 0x...::nft::Nft>" -> "0x...::nft::Nft"
        const match = raffleType.match(/Raffle<[^,]+,\s*(.+)>$/);
        return match ? match[1].trim() : '';
    }
}
exports.DripsSDK = DripsSDK;
//# sourceMappingURL=drips-sdk.js.map