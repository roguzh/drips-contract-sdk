import { createDripsSDK, RaffleBuilder } from '../src/index';

/**
 * Advanced usage example showing raffle creation and management
 */
async function advancedExample() {
  console.log('🚀 Drips SDK - Advanced Example\n');

  // Private key for transactions (in real app, get from secure storage)
  const PRIVATE_KEY = 'your-private-key-here';
  const NFT_ID = 'your-nft-id-here';

  // Initialize SDK with private key
  const sdk = createDripsSDK('testnet', PRIVATE_KEY);

  try {
    // 1. Create a premium raffle with entry cost
    console.log('💎 Creating premium raffle...');
    const premiumRaffle = new RaffleBuilder()
      .setNFT(NFT_ID)
      .setDeadlineFromNow(72) // 3 days
      .setEntryCost(0.1) // 0.1 SUI entry cost
      .setMaxCapacity(100) // Max 100 participants
      .setMaxPerParticipant(5) // Max 5 entries per participant
      .build();

    const createResult = await sdk.createRaffle(premiumRaffle);
    
    if (createResult.success) {
      console.log('✅ Raffle created successfully!');
      console.log(`  Raffle ID: ${createResult.raffleId}`);
      console.log(`  Operator Cap ID: ${createResult.operatorCapId}`);
      console.log(`  Transaction: ${createResult.transactionHash}`);
    } else {
      console.log('❌ Failed to create raffle:', createResult.error);
      return;
    }
    console.log();

    // 2. Join the raffle
    console.log('🎫 Joining raffle...');
    const joinResult = await sdk.joinRaffle({
      raffleId: createResult.raffleId!,
      entryCost: '100000000' // 0.1 SUI in MIST
    });

    if (joinResult.success) {
      console.log('✅ Successfully joined raffle!');
      console.log(`  Participants: ${joinResult.participantCount}`);
    } else {
      console.log('❌ Failed to join raffle:', joinResult.error);
    }
    console.log();

    // 3. Monitor raffle status
    console.log('📊 Monitoring raffle...');
    const details = await sdk.getRaffleDetails(createResult.raffleId!);
    console.log(`  Current participants: ${details.participantsCount}`);
    console.log(`  Status: ${details.status.isActive ? 'Active' : 'Inactive'}`);
    console.log(`  Deadline: ${details.formattedDeadline}`);
    console.log();

    // 4. Select winner (after deadline - this would fail if before deadline)
    console.log('🏆 Selecting winner (this will fail if before deadline)...');
    const winnerResult = await sdk.selectWinner(
      createResult.raffleId!,
      createResult.operatorCapId!
    );

    if (winnerResult.success) {
      console.log('✅ Winner selected!');
      console.log(`  Winner: ${winnerResult.winnerAddress}`);
    } else {
      console.log('❌ Could not select winner:', winnerResult.error);
      console.log('   (This is expected if deadline has not passed)');
    }

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
  }
}

export { advancedExample };
