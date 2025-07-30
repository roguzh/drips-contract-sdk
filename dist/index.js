"use strict";
/**
 * Drips Raffle SDK for Sui Blockchain
 *
 * A comprehensive TypeScript SDK for interacting with Drips Raffle contracts
 * on the Sui blockchain. Provides easy-to-use methods for creating raffles,
 * joining raffles, selecting winners, and managing NFT metadata.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.VERSION = exports.PACKAGE_IDS = exports.RaffleEventListener = exports.RaffleBuilder = exports.DripsUtils = exports.NetworkError = exports.InsufficientFundsError = exports.InvalidRaffleStateError = exports.RaffleNotFoundError = exports.DripsSDKError = exports.RaffleEventType = exports.DripsSDK = void 0;
exports.createDripsSDK = createDripsSDK;
exports.quickStart = quickStart;
// Main SDK class
var drips_sdk_1 = require("./drips-sdk");
Object.defineProperty(exports, "DripsSDK", { enumerable: true, get: function () { return drips_sdk_1.DripsSDK; } });
const drips_sdk_2 = require("./drips-sdk");
// Types and interfaces
var types_1 = require("./types");
Object.defineProperty(exports, "RaffleEventType", { enumerable: true, get: function () { return types_1.RaffleEventType; } });
// Error types
Object.defineProperty(exports, "DripsSDKError", { enumerable: true, get: function () { return types_1.DripsSDKError; } });
Object.defineProperty(exports, "RaffleNotFoundError", { enumerable: true, get: function () { return types_1.RaffleNotFoundError; } });
Object.defineProperty(exports, "InvalidRaffleStateError", { enumerable: true, get: function () { return types_1.InvalidRaffleStateError; } });
Object.defineProperty(exports, "InsufficientFundsError", { enumerable: true, get: function () { return types_1.InsufficientFundsError; } });
Object.defineProperty(exports, "NetworkError", { enumerable: true, get: function () { return types_1.NetworkError; } });
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
/**
 * Create a new DripsSDK instance with default configuration
 */
function createDripsSDK(network, privateKey) {
    const packageId = exports.PACKAGE_IDS[network];
    if (!packageId) {
        throw new Error(`Package ID not available for network: ${network}`);
    }
    return new drips_sdk_2.DripsSDK({
        network,
        packageId,
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