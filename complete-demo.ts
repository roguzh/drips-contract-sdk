import { createDripsSDK, DripsUtils } from "./dist/index";

/**
 * Complete demonstration of raffle discovery functionality
 * This shows all the new features working together
 */
async function completeRaffleDiscoveryDemo() {
  console.log("🎰 Complete Raffle Discovery Demo");
  console.log("=" .repeat(50));
  console.log();

  const sdk = createDripsSDK("testnet");
  console.log("✅ SDK initialized for testnet");
  console.log();

  try {
    // 1. Discover all raffles
    console.log("🔍 1. Discovering all raffles...");
    const allRaffles = await sdk.queryRaffles({
      includeDetails: true,
      status: 'all'
    });

    console.log(`📊 Found ${allRaffles.raffles.length} total raffles`);
    
    if (allRaffles.raffles.length > 0) {
      console.log("\n📋 Raffle Details:");
      allRaffles.raffles.forEach((raffle, index) => {
        console.log(`  ${index + 1}. ${raffle.nftMetadata?.name || 'Unknown NFT'}`);
        console.log(`     ID: ${raffle.objectId}`);
        console.log(`     Status: ${DripsUtils.getRaffleStatusDescription(raffle.status)}`);
        console.log(`     Participants: ${raffle.participantsCount}`);
        console.log(`     Entry Cost: ${raffle.fields.cost || 'Free'}`);
        console.log(`     Prize: ${raffle.nftMetadata?.description || 'No description'}`);
        
        if (raffle.status.isActive) {
          console.log(`     ⏰ Deadline: ${raffle.formattedDeadline}`);
        }
        
        if (raffle.status.hasWinner) {
          console.log(`     🏆 Winner Selected!`);
        }
        
        console.log();
      });
    }

    // 2. Filter by status
    console.log("📈 2. Filtering by status...");
    const activeRaffles = await sdk.queryRaffles({
      status: 'active',
      includeDetails: true
    });
    
    const endedRaffles = await sdk.queryRaffles({
      status: 'ended', 
      includeDetails: true
    });

    console.log(`  🟢 Active raffles: ${activeRaffles.raffles.length}`);
    console.log(`  🔴 Ended raffles: ${endedRaffles.raffles.length}`);
    console.log();

    // 3. Search functionality
    console.log("🔎 3. Search functionality...");
    const searchTerms = ["NFT", "Suiet", "Sample"];
    
    for (const term of searchTerms) {
      const searchResults = await sdk.searchRaffles(term, { limit: 5 });
      if (searchResults.raffles.length > 0) {
        console.log(`  🎯 Search "${term}": ${searchResults.raffles.length} results`);
        searchResults.raffles.forEach((raffle, index) => {
          console.log(`    ${index + 1}. ${raffle.nftMetadata?.name} (${raffle.participantsCount} participants)`);
        });
        break;
      }
    }
    console.log();

    // 4. Creator-based queries
    console.log("👤 4. Creator-based queries...");
    
    // Try to find the creator of the first raffle
    if (allRaffles.raffles.length > 0) {
      const firstRaffle = allRaffles.raffles[0];
      
      // We don't have direct creator info, but we can demonstrate the functionality
      const testCreatorAddress = "0x79a37abe25aec4e2fd388e793745dc219f0ea5474434b277b047faf07f0c6bc8";
      
      try {
        const creatorRaffles = await sdk.getRafflesByCreator(testCreatorAddress, {
          includeDetails: true
        });
        
        console.log(`  📊 Raffles by ${testCreatorAddress.slice(0, 10)}...: ${creatorRaffles.raffles.length}`);
        
        if (creatorRaffles.raffles.length > 0) {
          creatorRaffles.raffles.forEach((raffle, index) => {
            console.log(`    ${index + 1}. ${raffle.nftMetadata?.name || 'Unknown'}`);
          });
        }
      } catch (error) {
        console.log(`  ℹ️ No raffles found for test creator (expected)`);
      }
    }
    console.log();

    // 5. Utility functions showcase
    console.log("🔧 5. Utility functions showcase...");
    
    if (allRaffles.raffles.length > 0) {
      const raffle = allRaffles.raffles[0];
      
      console.log("  📊 Raffle Analysis:");
      console.log(`    Is Joinable: ${DripsUtils.isRaffleJoinable(raffle) ? '✅' : '❌'}`);
      console.log(`    Needs Winner Selection: ${DripsUtils.needsWinnerSelection(raffle) ? '✅' : '❌'}`);
      console.log(`    Status Description: ${DripsUtils.getRaffleStatusDescription(raffle.status)}`);
      console.log(`    Time Remaining: ${DripsUtils.getTimeRemaining(raffle.formattedDeadline)}`);
      console.log(`    Formatted Balance: ${raffle.formattedBalance}`);
    }
    console.log();

    // 6. Pagination demo (if we had more raffles)
    console.log("📄 6. Pagination capability...");
    console.log(`  Current implementation supports cursor-based pagination`);
    console.log(`  hasNextPage: ${allRaffles.hasNextPage}`);
    console.log(`  nextCursor: ${allRaffles.nextCursor || 'none'}`);
    console.log();

    // 7. Performance summary
    console.log("⚡ 7. Performance Summary:");
    const startTime = Date.now();
    
    const [concurrent1, concurrent2, concurrent3] = await Promise.all([
      sdk.queryRaffles({ status: 'active' }),
      sdk.queryRaffles({ status: 'ended' }),
      sdk.queryRaffles({ status: 'all', includeDetails: false })
    ]);
    
    const endTime = Date.now();
    console.log(`  🚀 3 concurrent queries completed in ${endTime - startTime}ms`);
    console.log(`  📊 Results: Active(${concurrent1.raffles.length}), Ended(${concurrent2.raffles.length}), All(${concurrent3.raffles.length})`);
    console.log();

  } catch (error) {
    console.error("❌ Demo failed:", error instanceof Error ? error.message : error);
    return;
  }

  // Final summary
  console.log("🎉 Raffle Discovery Demo Complete!");
  console.log("=" .repeat(50));
  console.log();
  console.log("✅ Features demonstrated:");
  console.log("  🔍 Automatic raffle discovery (no IDs needed)");
  console.log("  📊 Status-based filtering (active/ended)");
  console.log("  🔎 Search by NFT metadata");
  console.log("  👤 Creator-based queries");
  console.log("  🔧 Comprehensive utility functions");
  console.log("  📄 Pagination support");
  console.log("  ⚡ Concurrent query performance");
  console.log();
  console.log("💡 The SDK now supports complete raffle marketplace functionality!");
  console.log("   Users can discover, search, and explore raffles without needing to track IDs");
  console.log();
}

// Run the complete demo
completeRaffleDiscoveryDemo().catch(console.error);
