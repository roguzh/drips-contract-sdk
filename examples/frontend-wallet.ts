import { createDripsSDK, RaffleBuilder, DripsUtils, WalletAdapter } from '../src/index';

/**
 * Frontend example showing how to use the SDK with wallet adapters
 * This example shows integration with popular Sui wallet adapters
 */

// Mock wallet adapter for demonstration
// In real frontend, you'd use @mysten/wallet-adapter-react or similar
class MockWalletAdapter implements WalletAdapter {
  async signAndExecuteTransaction(params: any) {
    console.log('🔐 Wallet would sign transaction:', params.transaction);
    // Mock successful response
    return {
      digest: '0x123...mockTransaction',
      effects: {
        status: { status: 'success' },
        gasUsed: { computationCost: '1000000' }
      },
      objectChanges: [
        {
          type: 'created',
          objectId: '0x456...mockRaffle',
          objectType: '0xpackage::raffle::Raffle<0x2::sui::SUI, 0xnft::nft::Nft>'
        },
        {
          type: 'created', 
          objectId: '0x789...mockOperatorCap',
          objectType: '0xpackage::raffle::OperatorCap'
        }
      ]
    };
  }

  getAddress(): string {
    return '0xuser...walletAddress';
  }
}

/**
 * Frontend raffle creation example
 */
async function frontendCreateRaffle() {
  console.log('🌐 Frontend - Create Raffle Example\n');

  // Initialize SDK (no private key needed for frontend)
  const sdk = createDripsSDK('testnet');
  
  // Mock wallet adapter (in real app, get from wallet context)
  const wallet = new MockWalletAdapter();

  try {
    // 1. Build raffle parameters
    console.log('🏗️  Building raffle parameters...');
    const raffleParams = new RaffleBuilder()
      .setNFT('0x2fa05c16e392a2594e8f95f2ee4843f2ee6873e808450c20325081cc314ccfa6')
      .setDeadlineFromNow(48) // 48 hours
      .setEntryCost(0.1) // 0.1 SUI
      .setMaxCapacity(100)
      .build();

    console.log('  ✅ Parameters built:', {
      nftId: raffleParams.nftId.substring(0, 20) + '...',
      deadline: raffleParams.deadline.toISOString(),
      entryCost: DripsUtils.formatSuiAmount(raffleParams.entryCost || '0')
    });
    console.log();

    // 2. Option A: Build transaction for manual wallet signing
    console.log('📝 Option A: Building transaction for wallet...');
    const txBuilder = sdk.buildCreateRaffleTransaction(raffleParams);
    console.log('  ✅ Transaction built:', txBuilder.metadata);
    console.log('  📋 Description:', txBuilder.metadata.description);
    console.log('  ⛽ Estimated Gas:', txBuilder.metadata.estimatedGas);
    console.log();

    // 3. Option B: Create raffle directly with wallet
    console.log('🚀 Option B: Creating raffle with wallet...');
    const result = await sdk.createRaffleWithWallet(raffleParams, wallet);
    
    if (result.success) {
      console.log('  ✅ Raffle created successfully!');
      console.log('  🎯 Raffle ID:', result.raffleId);
      console.log('  🔑 Operator Cap:', result.operatorCapId);
      console.log('  🧾 Transaction:', result.transactionHash);
    } else {
      console.log('  ❌ Failed:', result.error);
    }

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
  }
}

/**
 * Frontend raffle joining example
 */
async function frontendJoinRaffle() {
  console.log('\n🎫 Frontend - Join Raffle Example\n');

  const sdk = createDripsSDK('testnet');
  const wallet = new MockWalletAdapter();

  try {
    const raffleId = '0x0a682571c06926aed7dafce394742b16d617942446d568c1a06b835d7b1d153b';
    
    // 1. Check if raffle is joinable
    console.log('🔍 Checking raffle status...');
    const raffleDetails = await sdk.getRaffleDetails(raffleId);
    
    console.log(`  Status: ${DripsUtils.getRaffleStatusDescription(raffleDetails.status)}`);
    console.log(`  Joinable: ${DripsUtils.isRaffleJoinable(raffleDetails) ? 'Yes' : 'No'}`);
    console.log(`  Participants: ${raffleDetails.participantsCount}`);
    console.log(`  Prize: ${raffleDetails.nftMetadata?.name || 'Unknown'}`);
    console.log();

    if (!DripsUtils.isRaffleJoinable(raffleDetails)) {
      console.log('❌ Cannot join this raffle');
      return;
    }

    // 2. Build join transaction
    console.log('📝 Building join transaction...');
    const txBuilder = await sdk.buildJoinRaffleTransaction({ raffleId });
    console.log('  ✅ Transaction built:', txBuilder.metadata);
    console.log();

    // 3. Join with wallet
    console.log('🎯 Joining raffle with wallet...');
    const result = await sdk.joinRaffleWithWallet({ raffleId }, wallet);
    
    if (result.success) {
      console.log('  ✅ Successfully joined raffle!');
      console.log('  👥 New participant count:', result.participantCount);
      console.log('  🧾 Transaction:', result.transactionHash);
    } else {
      console.log('  ❌ Failed:', result.error);
    }

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
  }
}

/**
 * React component example (pseudo-code)
 */
const ReactExample = `
// Example React component using the SDK
import { useWallet } from '@mysten/wallet-adapter-react';
import { createDripsSDK, RaffleBuilder } from '@drips/raffle-sdk';

function CreateRaffleComponent() {
  const { signAndExecuteTransaction } = useWallet();
  const sdk = createDripsSDK('testnet');

  const handleCreateRaffle = async () => {
    try {
      const params = new RaffleBuilder()
        .setNFT('0x...')
        .setDeadlineFromNow(24)
        .build();

      // Option 1: Use built-in wallet integration
      const result = await sdk.createRaffleWithWallet(params, {
        signAndExecuteTransaction
      });

      if (result.success) {
        console.log('Raffle created:', result.raffleId);
      }

      // Option 2: Build transaction and sign manually
      const { transaction } = sdk.buildCreateRaffleTransaction(params);
      const result2 = await signAndExecuteTransaction({ transaction });
      
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <button onClick={handleCreateRaffle}>
      Create Raffle
    </button>
  );
}`;

// Main demo function
async function frontendDemo() {
  await frontendCreateRaffle();
  await frontendJoinRaffle();
  
  console.log('\n📚 React Integration Example:');
  console.log(ReactExample);
  
  console.log('\n🎉 Frontend examples completed!');
  console.log('\n💡 Key Points:');
  console.log('  • No private keys needed in frontend');
  console.log('  • Wallet handles all signing');
  console.log('  • Build transactions first, then sign');
  console.log('  • Compatible with @mysten/wallet-adapter-react');
  console.log('  • Full TypeScript support');
}

// Run demo
frontendDemo().catch(console.error);

export { frontendDemo, frontendCreateRaffle, frontendJoinRaffle };
