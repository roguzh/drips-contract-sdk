# Frontend Integration Guide

This guide shows how to use the Drips Raffle SDK in frontend applications with wallet adapters.

## ✅ Frontend Compatibility

The SDK is **fully compatible** with frontend wallet adapters and provides two approaches:

1. **Transaction Building** - Build transactions for manual wallet signing
2. **Wallet Integration** - Direct integration with wallet adapter interfaces

## Installation

```bash
npm install @drips/raffle-sdk @mysten/wallet-adapter-react
```

## Basic Setup

```typescript
import { createDripsSDK } from '@drips/raffle-sdk';

// Initialize SDK (no private key needed for frontend)
const sdk = createDripsSDK('testnet');
```

## Approach 1: Transaction Building

Build transactions that can be signed by any wallet:

```typescript
import { RaffleBuilder } from '@drips/raffle-sdk';

// Build raffle parameters
const params = new RaffleBuilder()
  .setNFT('0x...')
  .setDeadlineFromNow(24)
  .setEntryCost(0.1)
  .build();

// Build transaction for wallet signing
const { transaction, metadata } = sdk.buildCreateRaffleTransaction(params);

// Sign with any wallet adapter
const result = await wallet.signAndExecuteTransaction({
  transaction,
  options: {
    showEffects: true,
    showEvents: true,
    showObjectChanges: true,
  }
});
```

## Approach 2: Direct Wallet Integration

Use the SDK's built-in wallet integration:

```typescript
// Create raffle directly with wallet
const result = await sdk.createRaffleWithWallet(params, wallet);

if (result.success) {
  console.log('Raffle created:', result.raffleId);
  console.log('Operator Cap:', result.operatorCapId);
}
```

## React Integration

### With @mysten/wallet-adapter-react

```typescript
import React from 'react';
import { useWallet } from '@mysten/wallet-adapter-react';
import { createDripsSDK, RaffleBuilder, DripsUtils } from '@drips/raffle-sdk';

const sdk = createDripsSDK('testnet');

function CreateRaffleComponent() {
  const { signAndExecuteTransaction, connected } = useWallet();

  const handleCreateRaffle = async () => {
    if (!connected) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      const params = new RaffleBuilder()
        .setNFT('0x...')
        .setDeadlineFromNow(24)
        .setEntryCost(0.1)
        .build();

      // Option 1: Use SDK wallet integration
      const result = await sdk.createRaffleWithWallet(params, {
        signAndExecuteTransaction
      });

      if (result.success) {
        alert(`Raffle created! ID: ${result.raffleId}`);
      } else {
        alert(`Error: ${result.error}`);
      }

    } catch (error) {
      console.error('Error creating raffle:', error);
    }
  };

  return (
    <button onClick={handleCreateRaffle} disabled={!connected}>
      Create Raffle
    </button>
  );
}
```

### Join Raffle Component

```typescript
function JoinRaffleComponent({ raffleId }: { raffleId: string }) {
  const { signAndExecuteTransaction } = useWallet();
  const [raffleDetails, setRaffleDetails] = useState(null);

  useEffect(() => {
    // Load raffle details
    sdk.getRaffleDetails(raffleId).then(setRaffleDetails);
  }, [raffleId]);

  const handleJoinRaffle = async () => {
    try {
      const result = await sdk.joinRaffleWithWallet(
        { raffleId },
        { signAndExecuteTransaction }
      );

      if (result.success) {
        alert(`Joined raffle! Participants: ${result.participantCount}`);
      }
    } catch (error) {
      console.error('Error joining raffle:', error);
    }
  };

  if (!raffleDetails) return <div>Loading...</div>;

  return (
    <div>
      <h3>Raffle: {raffleDetails.nftMetadata?.name}</h3>
      <p>Status: {DripsUtils.getRaffleStatusDescription(raffleDetails.status)}</p>
      <p>Participants: {raffleDetails.participantsCount}</p>
      <p>Time remaining: {DripsUtils.getTimeRemaining(raffleDetails.formattedDeadline)}</p>
      
      {DripsUtils.isRaffleJoinable(raffleDetails) ? (
        <button onClick={handleJoinRaffle}>
          Join Raffle
        </button>
      ) : (
        <p>Raffle is not joinable</p>
      )}
    </div>
  );
}
```

## Available Wallet Methods

The SDK provides these wallet-compatible methods:

### Transaction Builders
- `buildCreateRaffleTransaction(params)` - Build create raffle transaction
- `buildJoinRaffleTransaction(params)` - Build join raffle transaction  
- `buildSelectWinnerTransaction(raffleId, operatorCapId)` - Build winner selection transaction

### Wallet Integration Methods
- `createRaffleWithWallet(params, wallet)` - Create raffle with wallet
- `joinRaffleWithWallet(params, wallet)` - Join raffle with wallet
- `selectWinnerWithWallet(raffleId, operatorCapId, wallet)` - Select winner with wallet

### Read-Only Methods (No Wallet Needed)
- `getRaffleDetails(raffleId)` - Get raffle information
- `getNFTMetadata(nftId)` - Get NFT metadata
- `getActiveRaffles(raffleIds)` - Get active raffles
- `getEndedRaffles(raffleIds)` - Get ended raffles

## Wallet Adapter Interface

The SDK expects wallets to implement this interface:

```typescript
interface WalletAdapter {
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
```

This is compatible with most Sui wallet adapters including:
- Sui Wallet
- Suiet Wallet  
- Ethos Wallet
- Martian Wallet

## Error Handling

```typescript
import { DripsSDKError, InvalidRaffleStateError } from '@drips/raffle-sdk';

try {
  await sdk.createRaffleWithWallet(params, wallet);
} catch (error) {
  if (error instanceof InvalidRaffleStateError) {
    alert('Invalid raffle state');
  } else if (error instanceof DripsSDKError) {
    alert(`SDK Error: ${error.message}`);
  } else {
    alert('Unexpected error occurred');
  }
}
```

## Gas Estimation

Transaction builders provide gas estimates:

```typescript
const { transaction, metadata } = sdk.buildCreateRaffleTransaction(params);
console.log('Estimated gas:', metadata.estimatedGas); // "0.01 SUI"
```

## TypeScript Support

The SDK provides full TypeScript support for frontend development:

```typescript
import type { 
  RaffleDetails, 
  NFTMetadata, 
  CreateRaffleResult,
  WalletAdapter 
} from '@drips/raffle-sdk';
```

## Browser Compatibility

The SDK is designed to work in modern browsers and supports:
- ✅ ES2020+ browsers
- ✅ Webpack/Vite bundlers
- ✅ React/Vue/Angular frameworks
- ✅ TypeScript projects
- ✅ Sui wallet extensions

## Best Practices

1. **Always check wallet connection** before performing transactions
2. **Validate raffle state** before attempting to join
3. **Handle errors gracefully** with user-friendly messages
4. **Show loading states** during transaction processing
5. **Refresh data** after successful transactions

## Example Repository Structure

```
my-raffle-app/
├── src/
│   ├── components/
│   │   ├── CreateRaffle.tsx
│   │   ├── JoinRaffle.tsx
│   │   └── RaffleList.tsx
│   ├── hooks/
│   │   └── useRaffles.ts
│   ├── utils/
│   │   └── sdk.ts
│   └── App.tsx
├── package.json
└── README.md
```

The SDK is **fully ready** for frontend integration! 🚀
