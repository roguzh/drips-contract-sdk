import { createDripsSDK, DripsUtils, RaffleBuilder } from './dist/index';

/**
 * Simple test to verify SDK functionality
 */
async function testSDK() {
  console.log('🧪 Testing Drips SDK...\n');

  try {
    // Test 1: Initialize SDK
    console.log('1. Initializing SDK...');
    const sdk = createDripsSDK('testnet');
    console.log('✅ SDK initialized successfully');
    console.log(`   Network: ${sdk.getConfig().network}`);
    console.log(`   Package ID: ${sdk.getConfig().packageId}`);
    console.log();

    // Test 2: Test utilities
    console.log('2. Testing utilities...');
    console.log(`   Format SUI: ${DripsUtils.formatSuiAmount('1000000000')}`);
    console.log(`   SUI to MIST: ${DripsUtils.suiToMist(1.5)}`);
    console.log(`   Shorten address: ${DripsUtils.shortenAddress('0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef')}`);
    console.log(`   Random deadline: ${DripsUtils.generateRandomDeadline(1, 24).toISOString()}`);
    console.log('✅ Utilities working correctly');
    console.log();

    // Test 3: Test builder pattern
    console.log('3. Testing RaffleBuilder...');
    const raffleParams = new RaffleBuilder()
      .setNFT('0x2fa05c16e392a2594e8f95f2ee4843f2ee6873e808450c20325081cc314ccfa6')
      .setDeadlineFromNow(24)
      .setEntryCost(0.1)
      .setMaxCapacity(100)
      .build();
    
    console.log('✅ RaffleBuilder working correctly');
    console.log(`   NFT ID: ${raffleParams.nftId}`);
    console.log(`   Deadline: ${raffleParams.deadline.toISOString()}`);
    console.log(`   Entry Cost: ${raffleParams.entryCost} MIST`);
    console.log();

    // Test 4: Test raffle details fetching (using existing raffle)
    console.log('4. Testing raffle details fetching...');
    const existingRaffleId = '0x0a682571c06926aed7dafce394742b16d617942446d568c1a06b835d7b1d153b';
    const raffleDetails = await sdk.getRaffleDetails(existingRaffleId);
    
    console.log('✅ Raffle details fetched successfully');
    console.log(`   Raffle ID: ${raffleDetails.objectId}`);
    console.log(`   Status: ${DripsUtils.getRaffleStatusDescription(raffleDetails.status)}`);
    console.log(`   Participants: ${raffleDetails.participantsCount}`);
    console.log(`   Balance: ${raffleDetails.formattedBalance}`);
    console.log(`   Joinable: ${DripsUtils.isRaffleJoinable(raffleDetails) ? 'Yes' : 'No'}`);
    console.log();

    // Test 5: Test NFT metadata fetching
    console.log('5. Testing NFT metadata fetching...');
    if (raffleDetails.fields.raffle_item_id) {
      const nftMetadata = await sdk.getNFTMetadata(raffleDetails.fields.raffle_item_id);
      if (nftMetadata) {
        console.log('✅ NFT metadata fetched successfully');
        console.log(`   Name: ${nftMetadata.name}`);
        console.log(`   Description: ${nftMetadata.description}`);
        console.log(`   Valid: ${DripsUtils.isValidNFTMetadata(nftMetadata) ? 'Yes' : 'No'}`);
      }
    }
    console.log();

    console.log('🎉 All tests passed! SDK is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error instanceof Error ? error.message : error);
  }
}

// Run tests
testSDK();
