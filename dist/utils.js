"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RaffleEventListener = exports.RaffleBuilder = exports.DripsUtils = void 0;
/**
 * Utility functions for the Drips SDK
 */
class DripsUtils {
    /**
     * Format SUI amount from MIST to readable string
     */
    static formatSuiAmount(mistAmount) {
        const amount = typeof mistAmount === 'string' ? parseInt(mistAmount) : mistAmount;
        return (amount / 1000000000).toLocaleString() + ' SUI';
    }
    /**
     * Convert SUI amount to MIST
     */
    static suiToMist(suiAmount) {
        return (suiAmount * 1000000000).toString();
    }
    /**
     * Check if a raffle is joinable
     */
    static isRaffleJoinable(raffle) {
        return raffle.status.isJoinable;
    }
    /**
     * Check if a raffle needs winner selection
     */
    static needsWinnerSelection(raffle) {
        return raffle.status.isPastDeadline &&
            !raffle.status.hasWinner &&
            raffle.participantsCount > 0;
    }
    /**
     * Get raffle status description
     */
    static getRaffleStatusDescription(status) {
        if (status.hasWinner)
            return 'Winner Selected';
        if (status.isPastDeadline)
            return 'Expired';
        if (status.isPaused)
            return 'Paused';
        if (status.isActive)
            return 'Active';
        return 'Unknown';
    }
    /**
     * Get time remaining until deadline
     */
    static getTimeRemaining(deadline) {
        const now = new Date();
        const deadlineDate = new Date(deadline);
        const diff = deadlineDate.getTime() - now.getTime();
        if (diff <= 0) {
            return 'Expired';
        }
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        if (days > 0) {
            return `${days}d ${hours}h ${minutes}m`;
        }
        else if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        else {
            return `${minutes}m`;
        }
    }
    /**
     * Validate NFT metadata
     */
    static isValidNFTMetadata(metadata) {
        return !!(metadata.name && metadata.name !== 'Unknown NFT');
    }
    /**
     * Get shortened address for display
     */
    static shortenAddress(address, prefixLength = 6, suffixLength = 4) {
        if (address.length <= prefixLength + suffixLength) {
            return address;
        }
        return `${address.slice(0, prefixLength)}...${address.slice(-suffixLength)}`;
    }
    /**
     * Validate Sui address format
     */
    static isValidSuiAddress(address) {
        return /^0x[a-fA-F0-9]{64}$/.test(address);
    }
    /**
     * Generate a random deadline (for testing)
     */
    static generateRandomDeadline(minHours = 1, maxHours = 168) {
        const now = new Date();
        const hoursToAdd = Math.floor(Math.random() * (maxHours - minHours + 1)) + minHours;
        return new Date(now.getTime() + hoursToAdd * 60 * 60 * 1000);
    }
    /**
     * Filter compatible NFTs from a list
     */
    static filterCompatibleNFTs(nfts) {
        return nfts.filter(nft => nft.isCompatible);
    }
    /**
     * Group NFTs by compatibility
     */
    static groupNFTsByCompatibility(nfts) {
        return {
            compatible: nfts.filter(nft => nft.isCompatible),
            incompatible: nfts.filter(nft => !nft.isCompatible)
        };
    }
    /**
     * Get NFTs with metadata only
     */
    static getNFTsWithMetadata(nfts) {
        return nfts.filter(nft => nft.metadata && DripsUtils.isValidNFTMetadata(nft.metadata));
    }
    /**
     * Sort NFTs by name (metadata name if available, otherwise by object ID)
     */
    static sortNFTsByName(nfts) {
        return nfts.sort((a, b) => {
            const nameA = a.metadata?.name || a.objectId;
            const nameB = b.metadata?.name || b.objectId;
            return nameA.localeCompare(nameB);
        });
    }
    /**
     * Search NFTs by name or description
     */
    static searchNFTs(nfts, query) {
        const lowercaseQuery = query.toLowerCase();
        return nfts.filter(nft => {
            const name = nft.metadata?.name?.toLowerCase() || '';
            const description = nft.metadata?.description?.toLowerCase() || '';
            const objectId = nft.objectId.toLowerCase();
            return name.includes(lowercaseQuery) ||
                description.includes(lowercaseQuery) ||
                objectId.includes(lowercaseQuery);
        });
    }
    /**
     * Get a display name for an NFT
     */
    static getNFTDisplayName(nft) {
        if (nft.metadata?.name) {
            return nft.metadata.name;
        }
        // Try to extract a meaningful name from the type
        const typeParts = nft.type.split('::');
        if (typeParts.length >= 2) {
            return typeParts[typeParts.length - 1]; // Last part of the type
        }
        return `NFT ${nft.objectId.slice(0, 8)}...`;
    }
    /**
     * Check if an NFT has an image
     */
    static hasImage(nft) {
        return !!(nft.metadata?.image_url);
    }
    /**
     * Get incompatibility reasons summary
     */
    static getIncompatibilityReasons(nfts) {
        const reasons = {};
        nfts.filter(nft => !nft.isCompatible).forEach(nft => {
            const reason = nft.incompatibilityReason || 'Unknown reason';
            reasons[reason] = (reasons[reason] || 0) + 1;
        });
        return reasons;
    }
}
exports.DripsUtils = DripsUtils;
/**
 * Builder pattern for creating raffles
 */
class RaffleBuilder {
    setNFT(nftId) {
        this.nftId = nftId;
        return this;
    }
    setDeadline(deadline) {
        this.deadline = deadline;
        return this;
    }
    setDeadlineFromNow(hours) {
        const now = new Date();
        this.deadline = new Date(now.getTime() + hours * 60 * 60 * 1000);
        return this;
    }
    setEntryCost(suiAmount) {
        this.entryCost = DripsUtils.suiToMist(suiAmount);
        return this;
    }
    setMaxCapacity(capacity) {
        this.maxCapacity = capacity;
        return this;
    }
    setMaxPerParticipant(max) {
        this.maxPerParticipant = max;
        return this;
    }
    build() {
        if (!this.nftId) {
            throw new Error('NFT ID is required');
        }
        if (!this.deadline) {
            throw new Error('Deadline is required');
        }
        return {
            nftId: this.nftId,
            deadline: this.deadline,
            entryCost: this.entryCost,
            maxCapacity: this.maxCapacity,
            maxPerParticipant: this.maxPerParticipant
        };
    }
}
exports.RaffleBuilder = RaffleBuilder;
/**
 * Event listener for raffle events (placeholder for future implementation)
 */
class RaffleEventListener {
    constructor(sdk) {
        this.listeners = new Map();
        this.sdk = sdk;
    }
    /**
     * Subscribe to raffle events
     */
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }
    /**
     * Unsubscribe from raffle events
     */
    off(event, callback) {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }
    /**
     * Start listening for events (placeholder - would need WebSocket or polling implementation)
     */
    start() {
        // TODO: Implement event listening
        console.log('Event listener started (not implemented yet)');
    }
    /**
     * Stop listening for events
     */
    stop() {
        // TODO: Implement stopping event listening
        console.log('Event listener stopped');
    }
}
exports.RaffleEventListener = RaffleEventListener;
//# sourceMappingURL=utils.js.map