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
     * Get all rafflable NFTs owned by a user
     * Returns NFTs that can be used to create raffles
     */
    async getRafflableNFTs(userAddress, options = {}) {
        const { includeMetadata = true, onlyCompatible = false, limit = 50, cursor } = options;
        try {
            // Get all owned objects for the user (exclude coins)
            const ownedObjects = await this.client.getOwnedObjects({
                owner: userAddress,
                options: {
                    showType: true,
                    showContent: true,
                    showDisplay: true
                },
                limit,
                cursor
            });
            if (!ownedObjects.data || ownedObjects.data.length === 0) {
                return {
                    nfts: [],
                    total: 0,
                    hasNextPage: false
                };
            }
            // Filter out non-NFT objects and process each one
            const rafflableNFTs = [];
            for (const obj of ownedObjects.data) {
                if (!obj.data?.objectId || !obj.data?.type)
                    continue;
                // Skip if this is a coin or system object
                if (this.isSystemObject(obj.data.type))
                    continue;
                const rafflableNFT = {
                    objectId: obj.data.objectId,
                    type: obj.data.type,
                    version: obj.data.version,
                    digest: obj.data.digest,
                    isCompatible: true, // We'll validate this
                    incompatibilityReason: undefined
                };
                // Check compatibility with raffle contract
                const compatibility = await this.checkNFTCompatibility(obj.data);
                rafflableNFT.isCompatible = compatibility.isCompatible;
                rafflableNFT.incompatibilityReason = compatibility.reason;
                // Get metadata if requested and the NFT is compatible
                if (includeMetadata && rafflableNFT.isCompatible) {
                    try {
                        const metadata = await this.getNFTMetadata(obj.data.objectId);
                        rafflableNFT.metadata = metadata || undefined;
                    }
                    catch (error) {
                        // Metadata is optional, continue without it
                        console.warn(`Failed to get metadata for ${obj.data.objectId}:`, error);
                    }
                }
                // If onlyCompatible is true, skip incompatible NFTs
                if (onlyCompatible && !rafflableNFT.isCompatible) {
                    continue;
                }
                rafflableNFTs.push(rafflableNFT);
            }
            return {
                nfts: rafflableNFTs,
                total: rafflableNFTs.length,
                hasNextPage: ownedObjects.hasNextPage || false,
                nextCursor: ownedObjects.nextCursor || undefined
            };
        }
        catch (error) {
            throw new types_1.NetworkError(`Failed to fetch rafflable NFTs: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Check if an object is a system object (coin, gas object, etc.)
     */
    isSystemObject(type) {
        const systemTypes = [
            '0x2::coin::Coin',
            '0x2::sui::SUI',
            '0x2::gas::GasCoin',
            '0x1::sui::SUI',
            '0x2::package::UpgradeCap',
            '0x2::kiosk::KioskOwnerCap',
            'AdminCap',
            'OperatorCap',
            'RaffleOperatorCap'
        ];
        return systemTypes.some(systemType => type.includes(systemType));
    }
    /**
     * Check if an NFT is compatible with the raffle contract
     */
    async checkNFTCompatibility(objectData) {
        try {
            // Basic checks
            if (!objectData.objectId) {
                return { isCompatible: false, reason: 'No object ID' };
            }
            if (!objectData.type) {
                return { isCompatible: false, reason: 'No type information' };
            }
            // Check if it's a system object (coins, capabilities, etc.)
            if (this.isSystemObject(objectData.type)) {
                return { isCompatible: false, reason: 'System object (not a rafflable NFT)' };
            }
            // Check for administrative capabilities or contract-specific objects
            const nonRafflableTypes = [
                'Cap', 'Authority', 'Treasury', 'Config', 'Registry',
                'Witness', 'Publisher', 'TreasuryCap', 'CoinMetadata'
            ];
            if (nonRafflableTypes.some(type => objectData.type.includes(type))) {
                return { isCompatible: false, reason: 'Administrative or capability object' };
            }
            // Check if the object has display metadata (common for NFTs)
            if (objectData.display &&
                (objectData.display.data?.name || objectData.display.data?.description)) {
                return { isCompatible: true };
            }
            // Check if it has typical NFT fields
            if (objectData.content && objectData.content.fields) {
                const fields = objectData.content.fields;
                // Look for common NFT fields
                const nftFields = ['name', 'description', 'url', 'image_url', 'metadata'];
                const hasNFTFields = nftFields.some(field => fields[field] !== undefined ||
                    (fields.metadata && fields.metadata.fields && fields.metadata.fields[field]));
                if (hasNFTFields) {
                    return { isCompatible: true };
                }
            }
            // If it's not clearly a system object and has some structure, it might be rafflable
            // But mark it as potentially incompatible
            if (objectData.content || objectData.display) {
                return { isCompatible: true };
            }
            return {
                isCompatible: false,
                reason: 'Object structure not recognized as NFT'
            };
        }
        catch (error) {
            return {
                isCompatible: false,
                reason: `Compatibility check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
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
    /**
     * Query raffles from the blockchain using events and object queries
     * This implementation works with the actual contract structure
     */
    async queryRaffles(options = {}) {
        try {
            const { limit = 50, cursor, includeDetails = true, status = 'all' } = options;
            // Method 1: Get raffle IDs from events (most reliable)
            let raffleIds = [];
            try {
                const events = await this.client.queryEvents({
                    query: {
                        MoveModule: {
                            package: this.config.packageId,
                            module: 'raffle' // Events are in the raffle module
                        }
                    },
                    limit: limit * 2, // Get more events to filter for unique raffles
                    order: 'descending'
                });
                // Extract raffle IDs from events
                const raffleIdSet = new Set();
                events.data.forEach(event => {
                    if (event.parsedJson && typeof event.parsedJson === 'object') {
                        const parsed = event.parsedJson;
                        // Handle nested event structure
                        const eventData = parsed.pos0 || parsed;
                        const raffleId = eventData.raffle_id;
                        if (raffleId && typeof raffleId === 'string') {
                            raffleIdSet.add(raffleId);
                        }
                    }
                });
                raffleIds = Array.from(raffleIdSet);
            }
            catch (eventError) {
                console.warn('Event-based discovery failed, trying alternative methods');
            }
            // Method 2: Fallback - search through owned objects (less reliable)
            if (raffleIds.length === 0) {
                try {
                    const ownedObjects = await this.client.getOwnedObjects({
                        owner: this.config.houseId,
                        options: {
                            showType: true,
                            showContent: true
                        },
                        limit: limit
                    });
                    // Look for OperatorCap objects that contain raffle IDs
                    const operatorCaps = ownedObjects.data.filter(obj => obj.data?.type?.includes('RaffleOperatorCap'));
                    for (const cap of operatorCaps) {
                        if (cap.data?.content && cap.data.content.dataType === 'moveObject') {
                            const fields = cap.data.content.fields;
                            // Handle object ID structure
                            let raffleId = fields.raffle_id || fields.raffleId;
                            if (raffleId && typeof raffleId === 'object' && raffleId.id) {
                                raffleId = raffleId.id;
                            }
                            if (raffleId && typeof raffleId === 'string') {
                                raffleIds.push(raffleId);
                            }
                        }
                    }
                }
                catch (ownedObjectsError) {
                    console.warn('Owned objects discovery also failed');
                }
            }
            // Remove duplicates and apply pagination
            raffleIds = [...new Set(raffleIds)];
            // Simple cursor-based pagination
            let startIndex = 0;
            if (cursor) {
                const cursorIndex = raffleIds.indexOf(cursor);
                if (cursorIndex !== -1) {
                    startIndex = cursorIndex + 1;
                }
            }
            const paginatedIds = raffleIds.slice(startIndex, startIndex + limit);
            const hasNextPage = startIndex + limit < raffleIds.length;
            const nextCursor = hasNextPage ? paginatedIds[paginatedIds.length - 1] : undefined;
            // Fetch details for each raffle if requested
            const raffles = [];
            if (includeDetails && paginatedIds.length > 0) {
                const rafflePromises = paginatedIds.map(async (raffleId) => {
                    try {
                        return await this.getRaffleDetails(raffleId);
                    }
                    catch (error) {
                        // Skip invalid raffles
                        return null;
                    }
                });
                const raffleResults = await Promise.all(rafflePromises);
                for (const raffle of raffleResults) {
                    if (raffle) {
                        // Apply status filter
                        if (status === 'active' && !raffle.status.isActive)
                            continue;
                        if (status === 'ended' && !raffle.status.isEnded)
                            continue;
                        raffles.push(raffle);
                    }
                }
            }
            else {
                // Just return basic info without full details
                for (const raffleId of paginatedIds) {
                    raffles.push({
                        objectId: raffleId,
                    });
                }
            }
            return {
                raffles,
                hasNextPage,
                nextCursor,
                totalCount: raffleIds.length
            };
        }
        catch (error) {
            throw new types_1.NetworkError(`Failed to query raffles: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Get all raffles created by a specific creator address
     * Uses OperatorCap objects to find raffles owned by the creator
     */
    async getRafflesByCreator(creatorAddress, options = {}) {
        try {
            const { limit = 50, cursor, includeDetails = true } = options;
            // Query objects owned by the creator that are raffle-related
            const creatorObjects = await this.client.getOwnedObjects({
                owner: creatorAddress,
                options: {
                    showType: true,
                    showContent: includeDetails
                },
                limit: limit,
                cursor: cursor
            });
            // Filter for operator caps which indicate created raffles
            const operatorCaps = creatorObjects.data.filter(obj => obj.data?.type?.includes('RaffleOperatorCap'));
            const raffles = [];
            if (includeDetails) {
                for (const cap of operatorCaps) {
                    try {
                        if (cap.data?.content && cap.data.content.dataType === 'moveObject') {
                            const capFields = cap.data.content.fields;
                            let raffleId = capFields.raffle_id || capFields.raffleId;
                            // Handle object ID structure from Sui
                            if (raffleId && typeof raffleId === 'object' && raffleId.id) {
                                raffleId = raffleId.id;
                            }
                            if (raffleId && typeof raffleId === 'string') {
                                const raffleDetails = await this.getRaffleDetails(raffleId);
                                raffles.push(raffleDetails);
                            }
                        }
                    }
                    catch (error) {
                        // Skip invalid raffles
                        continue;
                    }
                }
            }
            return {
                raffles,
                hasNextPage: creatorObjects.hasNextPage,
                nextCursor: creatorObjects.nextCursor || undefined,
                totalCount: operatorCaps.length
            };
        }
        catch (error) {
            throw new types_1.NetworkError(`Failed to get raffles by creator: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Search for raffles containing specific NFT types or names
     */
    async searchRaffles(searchTerm, options = {}) {
        // Get all raffles first
        const allRaffles = await this.queryRaffles({ ...options, includeDetails: true });
        // Filter based on search term
        const filteredRaffles = allRaffles.raffles.filter(raffle => {
            if (!raffle.nftMetadata)
                return false;
            const searchLower = searchTerm.toLowerCase();
            return (raffle.nftMetadata.name?.toLowerCase().includes(searchLower) ||
                raffle.nftMetadata.description?.toLowerCase().includes(searchLower) ||
                raffle.nftMetadata.collection?.toLowerCase().includes(searchLower));
        });
        return {
            raffles: filteredRaffles,
            hasNextPage: false,
            totalCount: filteredRaffles.length
        };
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