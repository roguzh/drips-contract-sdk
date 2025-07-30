# Drips Raffle SDK

A TypeScript SDK for interacting with the Drips Raffle smart contract on Sui blockchain. Build NFT-based raffles with ease, supporting both server-side and frontend applications.

## ✨ Features

- �️ **Complete Raffle Management** - Create, join, and manage NFT raffles
- 🔐 **Dual Integration** - Server-side private keys + Frontend wallet adapters
- � **Frontend Ready** - React/Vue/Angular compatible with Sui wallet ecosystem
- 📦 **TypeScript Native** - Full type safety and IDE support
- 🚀 **Easy to Use** - Fluent APIs and comprehensive utilities
- 🎯 **NFT Metadata** - Automatic NFT metadata fetching and display
- ⚡ **Real-time Status** - Live raffle state management and validation

## 🚀 Quick Start

### Installation

#### From GitHub (Recommended)
```bash
npm install git+https://github.com/yourusername/drips-raffle-sdk.git
```

#### Or using a specific version/tag
```bash
npm install git+https://github.com/yourusername/drips-raffle-sdk.git#v1.0.0
```

#### Or using yarn
```bash
yarn add git+https://github.com/yourusername/drips-raffle-sdk.git
```

### Server-Side Usage

```typescript
import { createDripsSDK, RaffleBuilder } from '@drips/raffle-sdk';

// Initialize SDK
const sdk = createDripsSDK('testnet');

// Create a raffle (server-side with private key)
const params = new RaffleBuilder()
  .setNFT('0xf1a5431...')
  .setDeadlineFromNow(24) // 24 hours
  .setEntryCost(0.1) // 0.1 SUI
  .build();

const result = await sdk.createRaffle(params, privateKey);
console.log('Raffle created:', result.raffleId);
```

### Frontend Usage (React)

```typescript
import { useWallet } from '@mysten/wallet-adapter-react';
import { createDripsSDK, RaffleBuilder } from '@drips/raffle-sdk';

const sdk = createDripsSDK('testnet');

function CreateRaffle() {
  const { signAndExecuteTransaction } = useWallet();

  const handleCreate = async () => {
    const params = new RaffleBuilder()
      .setNFT('0xf1a5431...')
      .setDeadlineFromNow(24)
      .setEntryCost(0.1)
      .build();

    // Frontend usage with wallet adapter
    const result = await sdk.createRaffleWithWallet(params, { 
      signAndExecuteTransaction 
    });
    
    if (result.success) {
      alert(`Raffle created! ID: ${result.raffleId}`);
    }
  };

  return <button onClick={handleCreate}>Create Raffle</button>;
}
```

## 📖 Documentation

### Core Concepts

- **House**: Central registry managing all raffles
- **Raffle**: Individual raffle instance with NFT prize
- **Kiosk**: Sui's NFT trading primitive integration
- **Operator Cap**: Authorization token for raffle management

### Configuration

```typescript
import { createDripsSDK } from '@drips/raffle-sdk';

// Testnet (default)
const sdk = createDripsSDK('testnet');

// Mainnet
const sdk = createDripsSDK('mainnet');

// Custom configuration
const sdk = createDripsSDK('testnet', {
  rpcUrl: 'https://your-custom-rpc.com',
  packageId: '0x...',
  houseId: '0x...'
});
```

### Creating Raffles

#### Fluent Builder API

```typescript
import { RaffleBuilder } from '@drips/raffle-sdk';

const params = new RaffleBuilder()
  .setNFT('0xf1a5431...', '0xnft123...') // Optional: NFT object ID
  .setDeadlineFromNow(48) // Hours from now
  .setDeadline(new Date('2024-12-31')) // Specific date
  .setEntryCost(0.5) // SUI amount
  .addMetadata('description', 'Epic raffle!')
  .build();
```

#### Server-Side Creation

```typescript
// With private key (server-side only)
const result = await sdk.createRaffle(params, privateKey);

if (result.success) {
  console.log('Raffle ID:', result.raffleId);
  console.log('Operator Cap:', result.operatorCapId);
  console.log('Transaction:', result.transactionDigest);
}
```

#### Frontend Creation

```typescript
// With wallet adapter (frontend)
const result = await sdk.createRaffleWithWallet(params, walletAdapter);

// Or build transaction manually
const { transaction } = sdk.buildCreateRaffleTransaction(params);
const result = await wallet.signAndExecuteTransaction({ transaction });
```

### Joining Raffles

```typescript
// Server-side
const joinResult = await sdk.joinRaffle({ raffleId }, privateKey);

// Frontend
const joinResult = await sdk.joinRaffleWithWallet({ raffleId }, wallet);

console.log('Participants:', joinResult.participantCount);
console.log('Position:', joinResult.participantPosition);
```

## API Reference

### DripsSDK

The main SDK class for interacting with Drips contracts.

#### Constructor

```typescript
const sdk = new DripsSDK({
  network: 'testnet', // 'testnet' | 'mainnet' | 'devnet'
  packageId: '0x...', // Contract package ID
  privateKey?: 'base64-private-key' // Optional default private key
});
```

#### Methods

##### `createRaffle(params, privateKey?)`

Create a new raffle.

```typescript
const result = await sdk.createRaffle({
  nftId: '0x...',
  deadline: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
  entryCost?: '1000000000', // Optional: 1 SUI in MIST
  maxCapacity?: 100, // Optional: max participants
  maxPerParticipant?: 5 // Optional: max entries per participant
});
```

##### `joinRaffle(params, privateKey?)`

Join an existing raffle.

```typescript
const result = await sdk.joinRaffle({
  raffleId: '0x...',
  entryCost?: '1000000000' // Required if raffle has entry cost
});
```

##### `getRaffleDetails(raffleId)`

Get detailed information about a raffle.

```typescript
const details = await sdk.getRaffleDetails('0x...');
console.log(details.status.isActive); // boolean
console.log(details.participantsCount); // number
console.log(details.nftMetadata?.name); // string
```

##### `getNFTMetadata(nftId)`

Get NFT metadata.

```typescript
const metadata = await sdk.getNFTMetadata('0x...');
console.log(metadata.name);
console.log(metadata.description);
console.log(metadata.image_url);
```

##### `selectWinner(raffleId, operatorCapId, privateKey?)`

Select a winner for a raffle (requires operator capability).

```typescript
const result = await sdk.selectWinner('0x...', '0x...');
```

### RaffleBuilder

Builder pattern for creating raffle parameters.

```typescript
const params = new RaffleBuilder()
  .setNFT('0x...')
  .setDeadline(new Date('2024-12-31'))
  .setDeadlineFromNow(24) // 24 hours from now
  .setEntryCost(0.5) // 0.5 SUI
  .setMaxCapacity(100)
  .setMaxPerParticipant(5)
  .build();
```

### DripsUtils

Utility functions for common operations.

```typescript
import { DripsUtils } from '@drips/raffle-sdk';

// Format amounts
DripsUtils.formatSuiAmount('1000000000'); // "1 SUI"
DripsUtils.suiToMist(1.5); // "1500000000"

// Raffle utilities
DripsUtils.isRaffleJoinable(raffleDetails); // boolean
DripsUtils.needsWinnerSelection(raffleDetails); // boolean
DripsUtils.getRaffleStatusDescription(status); // string
DripsUtils.getTimeRemaining(deadline); // "2d 5h 30m"

// Address utilities
DripsUtils.shortenAddress('0x123...', 6, 4); // "0x123...abcd"
DripsUtils.isValidSuiAddress(address); // boolean
```

## Types

### RaffleDetails

```typescript
interface RaffleDetails {
  objectId: string;
  status: RaffleStatus;
  nftMetadata?: NFTMetadata;
  formattedDeadline: string;
  formattedBalance: string;
  participantsCount: number;
  fields: {
    balance: string;
    deadline: string;
    is_raffle_paused: boolean;
    raffle_item_id: string;
    winner_address?: string;
    // ... other fields
  };
}
```

### RaffleStatus

```typescript
interface RaffleStatus {
  isActive: boolean;
  isEnded: boolean;
  hasWinner: boolean;
  isPastDeadline: boolean;
  isPaused: boolean;
  isJoinable: boolean;
}
```

### NFTMetadata

```typescript
interface NFTMetadata {
  objectId: string;
  name: string;
  description: string;
  image_url: string;
  symbol?: string;
  creator?: string;
  collection?: string;
  attributes?: any[];
}
```

## Error Handling

The SDK provides specific error types for different scenarios:

```typescript
import { 
  DripsSDKError, 
  RaffleNotFoundError, 
  InvalidRaffleStateError,
  InsufficientFundsError,
  NetworkError 
} from '@drips/raffle-sdk';

try {
  await sdk.createRaffle(params);
} catch (error) {
  if (error instanceof RaffleNotFoundError) {
    console.log('Raffle not found');
  } else if (error instanceof InvalidRaffleStateError) {
    console.log('Cannot perform action in current raffle state');
  } else if (error instanceof InsufficientFundsError) {
    console.log('Not enough funds');
  }
}
```

## Examples

### Basic Usage

```typescript
import { createDripsSDK, DripsUtils } from '@drips/raffle-sdk';

const sdk = createDripsSDK('testnet');

// Check existing raffle
const details = await sdk.getRaffleDetails('0x...');
console.log(`Status: ${DripsUtils.getRaffleStatusDescription(details.status)}`);
console.log(`Time remaining: ${DripsUtils.getTimeRemaining(details.formattedDeadline)}`);

if (DripsUtils.isRaffleJoinable(details)) {
  // Join the raffle
  await sdk.joinRaffle({ raffleId: details.objectId });
}
```

### Creating a Premium Raffle

```typescript
import { createDripsSDK, RaffleBuilder } from '@drips/raffle-sdk';

const sdk = createDripsSDK('testnet', 'your-private-key');

const premiumRaffle = new RaffleBuilder()
  .setNFT('0x...')
  .setDeadlineFromNow(72) // 3 days
  .setEntryCost(0.5) // 0.5 SUI entry fee
  .setMaxCapacity(50) // Limited to 50 participants
  .build();

const result = await sdk.createRaffle(premiumRaffle);
if (result.success) {
  console.log(`Raffle created: ${result.raffleId}`);
}
```

### Batch Operations

```typescript
// Get multiple raffle details
const raffleIds = ['0x...', '0x...', '0x...'];
const activeRaffles = await sdk.getActiveRaffles(raffleIds);
const endedRaffles = await sdk.getEndedRaffles(raffleIds);

console.log(`Active raffles: ${activeRaffles.length}`);
console.log(`Ended raffles: ${endedRaffles.length}`);
```

## Configuration

### Network Configuration

```typescript
import { createDripsSDK, PACKAGE_IDS } from '@drips/raffle-sdk';

// Use predefined package IDs
const sdk = createDripsSDK('testnet');

// Or specify custom package ID
const customSdk = new DripsSDK({
  network: 'testnet',
  packageId: 'your-custom-package-id'
});
```

### Private Key Management

```typescript
// Set default private key
const sdk = createDripsSDK('testnet', 'your-private-key');

// Or provide per-transaction
await sdk.createRaffle(params, 'transaction-specific-private-key');

// Update default private key
sdk.setDefaultKeypair('new-private-key');
```

## Development

### Building

```bash
npm run build
```

### Testing

```bash
npm test
```

### Linting

```bash
npm run lint
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For support, please open an issue on GitHub or contact the Drips team.

---

Made with ❤️ by the Drips team
