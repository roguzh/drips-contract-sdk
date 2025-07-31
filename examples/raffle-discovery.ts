import { createDripsSDK, DripsUtils } from "../src/index";

/**
 * Example showing how to discover and query raffles without knowing specific IDs
 */
async function raffleDiscoveryExample() {
  console.log("🔍 Drips SDK - Raffle Discovery Example\n");

  // Initialize SDK
  const sdk = createDripsSDK("testnet");

  try {
    // 1. Query all raffles from the House (without needing specific IDs)
    console.log("📋 Querying all raffles...");
    const allRaffles = await sdk.queryRaffles({
      limit: 10,
      includeDetails: true,
      status: 'all'
    });

    console.log(`  Found ${allRaffles.raffles.length} raffles total`);
    if (allRaffles.hasNextPage) {
      console.log("  More raffles available (pagination supported)");
    }
    console.log();

    // Display raffle summaries
    allRaffles.raffles.forEach((raffle, index) => {
      console.log(`  Raffle ${index + 1}:`);
      console.log(`    ID: ${raffle.objectId}`);
      console.log(`    Status: ${DripsUtils.getRaffleStatusDescription(raffle.status)}`);
      console.log(`    Participants: ${raffle.participantsCount}`);
      if (raffle.nftMetadata?.name) {
        console.log(`    Prize: ${raffle.nftMetadata.name}`);
      }
      console.log(`    Time: ${raffle.formattedDeadline}`);
      console.log();
    });

    // 2. Query only active raffles
    console.log("🟢 Querying active raffles only...");
    const activeRaffles = await sdk.queryRaffles({
      limit: 5,
      includeDetails: true,
      status: 'active'
    });

    console.log(`  Found ${activeRaffles.raffles.length} active raffles`);
    activeRaffles.raffles.forEach((raffle, index) => {
      console.log(`    ${index + 1}. ${raffle.nftMetadata?.name || 'Unknown NFT'} - ${raffle.participantsCount} participants`);
      console.log(`       Time remaining: ${DripsUtils.getTimeRemaining(raffle.formattedDeadline)}`);
    });
    console.log();

    // 3. Search for raffles by NFT name/description
    console.log("🔎 Searching raffles by keyword...");
    const searchResults = await sdk.searchRaffles("NFT", { limit: 5 });
    
    console.log(`  Found ${searchResults.raffles.length} raffles matching 'NFT'`);
    searchResults.raffles.forEach((raffle, index) => {
      console.log(`    ${index + 1}. ${raffle.nftMetadata?.name || 'Unknown'}`);
      console.log(`       Description: ${raffle.nftMetadata?.description || 'No description'}`);
    });
    console.log();

    // 4. Get raffles created by a specific address (example with a test address)
    console.log("👤 Getting raffles by creator...");
    const testCreatorAddress = "0x742d35cc6448c3d41b0e37b36b5e2e39db3b9d7b8b4d4c4e4f4a4b4c4d4e4f4a";
    
    try {
      const creatorRaffles = await sdk.getRafflesByCreator(testCreatorAddress, {
        limit: 5,
        includeDetails: true
      });

      if (creatorRaffles.raffles.length > 0) {
        console.log(`  Found ${creatorRaffles.raffles.length} raffles by creator`);
        creatorRaffles.raffles.forEach((raffle, index) => {
          console.log(`    ${index + 1}. ${raffle.nftMetadata?.name || 'Unknown NFT'}`);
        });
      } else {
        console.log("  No raffles found for this creator (this is expected for the test address)");
      }
    } catch (error) {
      console.log("  No raffles found for this creator (this is normal for test addresses)");
    }
    console.log();

    // 5. Demonstrate pagination
    if (allRaffles.hasNextPage && allRaffles.nextCursor) {
      console.log("📄 Demonstrating pagination...");
      const nextPage = await sdk.queryRaffles({
        limit: 5,
        cursor: allRaffles.nextCursor,
        includeDetails: false // Just get IDs for speed
      });

      console.log(`  Next page has ${nextPage.raffles.length} more raffles`);
      nextPage.raffles.forEach((raffle, index) => {
        console.log(`    ${index + 1}. ID: ${raffle.objectId}`);
      });
      console.log();
    }

    // 6. Show different ways to filter and use the results
    console.log("📊 Analysis of discovered raffles:");
    
    const activeCount = allRaffles.raffles.filter(r => r.status.isActive).length;
    const endedCount = allRaffles.raffles.filter(r => r.status.isEnded).length;
    const withWinnerCount = allRaffles.raffles.filter(r => r.status.hasWinner).length;
    
    console.log(`  Active: ${activeCount}`);
    console.log(`  Ended: ${endedCount}`);
    console.log(`  With Winners: ${withWinnerCount}`);
    
    // Find raffles with most participants
    const sortedByParticipants = [...allRaffles.raffles]
      .sort((a, b) => b.participantsCount - a.participantsCount);
    
    if (sortedByParticipants.length > 0) {
      console.log(`  Most popular: ${sortedByParticipants[0].nftMetadata?.name || 'Unknown'} with ${sortedByParticipants[0].participantsCount} participants`);
    }
    
    console.log("\n✅ Raffle discovery complete!");
    console.log("💡 You can now use these raffle IDs to join, check details, or manage raffles");

  } catch (error) {
    console.error("❌ Error during raffle discovery:", error instanceof Error ? error.message : error);
    console.log("\n💡 Note: If the House is empty or query fails, this might be because:");
    console.log("   - The House object structure is different than expected");
    console.log("   - No raffles have been created yet");
    console.log("   - Network connectivity issues");
  }
}

// Run the example
if (require.main === module) {
  raffleDiscoveryExample().catch(console.error);
}

export { raffleDiscoveryExample };
