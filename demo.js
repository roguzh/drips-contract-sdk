#!/usr/bin/env node

/**
 * Simple demo script for the Drips SDK
 * This script demonstrates basic SDK functionality without requiring private keys
 */

const { createDripsSDK, DripsUtils, RaffleBuilder } = require('./dist/index');

async function demo() {
  console.log('🎰 Drips Raffle SDK Demo\n');

  // Initialize SDK (no private key needed for read operations)
  const sdk = createDripsSDK('testnet');
  console.log('✅ SDK initialized for testnet');
  console.log(`📦 Package ID: ${sdk.getConfig().packageId}`);
  console.log();

  // Demo 1: Fetch existing raffle details
  console.log('📋 Demo 1: Fetching raffle details...');
  const existingRaffleId = '0x0a682571c06926aed7dafce394742b16d617942446d568c1a06b835d7b1d153b';
  
  try {
    const raffleDetails = await sdk.getRaffleDetails(existingRaffleId);
    
    console.log(`  🎯 Raffle ID: ${raffleDetails.objectId}`);
    console.log(`  📊 Status: ${DripsUtils.getRaffleStatusDescription(raffleDetails.status)}`);
    console.log(`  👥 Participants: ${raffleDetails.participantsCount}`);
    console.log(`  💰 Balance: ${raffleDetails.formattedBalance}`);
    console.log(`  ⏰ Time Remaining: ${DripsUtils.getTimeRemaining(raffleDetails.formattedDeadline)}`);
    console.log(`  🎫 Joinable: ${DripsUtils.isRaffleJoinable(raffleDetails) ? 'Yes' : 'No'}`);
    
    if (raffleDetails.nftMetadata) {
      console.log(`  🎁 Prize: ${raffleDetails.nftMetadata.name}`);
      console.log(`  📝 Description: ${raffleDetails.nftMetadata.description}`);
    }
  } catch (error) {
    console.error('  ❌ Error:', error.message);
  }
  console.log();

  // Demo 2: NFT Metadata fetching
  console.log('🖼️  Demo 2: Fetching NFT metadata...');
  const nftId = '0x2fa05c16e392a2594e8f95f2ee4843f2ee6873e808450c20325081cc314ccfa6';
  
  try {
    const nftMetadata = await sdk.getNFTMetadata(nftId);
    if (nftMetadata) {
      console.log(`  📛 Name: ${nftMetadata.name}`);
      console.log(`  📄 Description: ${nftMetadata.description}`);
      console.log(`  🖼️  Image: ${nftMetadata.image_url || 'Not available'}`);
      console.log(`  ✅ Valid: ${DripsUtils.isValidNFTMetadata(nftMetadata) ? 'Yes' : 'No'}`);
    } else {
      console.log('  ❌ No metadata found');
    }
  } catch (error) {
    console.error('  ❌ Error:', error.message);
  }
  console.log();

  // Demo 3: Utility functions
  console.log('🛠️  Demo 3: Utility functions...');
  console.log(`  💱 Format 1.5 SUI: ${DripsUtils.formatSuiAmount(DripsUtils.suiToMist(1.5))}`);
  console.log(`  🔤 Shorten address: ${DripsUtils.shortenAddress('0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef')}`);
  console.log(`  🎲 Random deadline: ${DripsUtils.generateRandomDeadline(1, 24).toLocaleString()}`);
  console.log();

  // Demo 4: Builder pattern
  console.log('🏗️  Demo 4: Raffle builder...');
  try {
    const raffleParams = new RaffleBuilder()
      .setNFT(nftId)
      .setDeadlineFromNow(48) // 48 hours
      .setEntryCost(0.25) // 0.25 SUI
      .setMaxCapacity(50)
      .build();
    
    console.log('  ✅ Raffle parameters created:');
    console.log(`    🎁 NFT: ${raffleParams.nftId.substring(0, 20)}...`);
    console.log(`    ⏰ Deadline: ${raffleParams.deadline.toLocaleString()}`);
    console.log(`    💰 Entry Cost: ${DripsUtils.formatSuiAmount(raffleParams.entryCost || '0')}`);
    console.log(`    👥 Max Capacity: ${raffleParams.maxCapacity}`);
  } catch (error) {
    console.error('  ❌ Error:', error.message);
  }
  console.log();

  console.log('🎉 Demo completed successfully!');
  console.log();
  console.log('📚 Next steps:');
  console.log('  • Add your private key to create actual raffles');
  console.log('  • Use sdk.createRaffle() to create new raffles');
  console.log('  • Use sdk.joinRaffle() to participate in raffles');
  console.log('  • Check the examples/ directory for more detailed usage');
}

// Run demo
demo().catch(console.error);
