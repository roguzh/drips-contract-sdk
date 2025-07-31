"use strict";
/**
 * Drips Raffle SDK for Sui Blockchain
 *
 * A comprehensive TypeScript SDK for interacting with Drips Raffle contracts
 * on the Sui blockchain. Provides easy-to-use methods for creating raffles,
 * joining raffles, selecting winners, and managing NFT metadata.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.VERSION = exports.HOUSE_IDS = exports.PACKAGE_IDS = exports.RaffleEventListener = exports.RaffleBuilder = exports.DripsUtils = exports.DripsSDK = void 0;
exports.createDripsSDK = createDripsSDK;
exports.quickStart = quickStart;
// Main SDK class
var drips_sdk_1 = require("./drips-sdk");
Object.defineProperty(exports, "DripsSDK", { enumerable: true, get: function () { return drips_sdk_1.DripsSDK; } });
const drips_sdk_2 = require("./drips-sdk");
// Utilities
var utils_1 = require("./utils");
Object.defineProperty(exports, "DripsUtils", { enumerable: true, get: function () { return utils_1.DripsUtils; } });
Object.defineProperty(exports, "RaffleBuilder", { enumerable: true, get: function () { return utils_1.RaffleBuilder; } });
Object.defineProperty(exports, "RaffleEventListener", { enumerable: true, get: function () { return utils_1.RaffleEventListener; } });
// Default package IDs for different networks
exports.PACKAGE_IDS = {
    testnet: '0xf1a54310356e2a90d896462e19ce926eae5903bce26bd4a37b7c8553b628f71d',
    mainnet: '', // To be filled when deployed to mainnet
    devnet: '' // To be filled when deployed to devnet
};
// Default House IDs for different networks  
exports.HOUSE_IDS = {
    testnet: '0x33940b0b58b225b6f3673608c16acca032ceb3107aa47204ee33fa6f827b0452',
    mainnet: '', // To be filled when deployed to mainnet
    devnet: '' // To be filled when deployed to devnet
};
/**
 * Create a new DripsSDK instance with default configuration
 */
function createDripsSDK(network, privateKey) {
    const packageId = exports.PACKAGE_IDS[network];
    const houseId = exports.HOUSE_IDS[network];
    if (!packageId) {
        throw new Error(`Package ID not available for network: ${network}`);
    }
    if (!houseId) {
        throw new Error(`House ID not available for network: ${network}`);
    }
    return new drips_sdk_2.DripsSDK({
        network,
        packageId,
        houseId,
        privateKey
    });
}
/**
 * Quick start example function
 */
async function quickStart() {
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
exports.VERSION = '1.0.0';
//# sourceMappingURL=index.js.map