import { createDripsSDK } from "./dist/index";

/**
 * Test with the known raffle ID to verify discovery works
 */
async function testKnownRaffle() {
  console.log("🎯 Testing Known Raffle Discovery\n");

  const sdk = createDripsSDK("testnet");
  
  // Known raffle ID from the events
  const knownRaffleId = "0x0a682571c06926aed7dafce394742b16d617942446d568c1a06b835d7b1d153b";
  
  console.log(`🎲 Testing known raffle: ${knownRaffleId}`);
  
  try {
    // Test direct raffle details retrieval
    const raffleDetails = await sdk.getRaffleDetails(knownRaffleId);
    console.log("✅ Direct raffle retrieval successful!");
    console.log(`  Status: Active=${raffleDetails.status.isActive}, Ended=${raffleDetails.status.isEnded}`);
    console.log(`  Participants: ${raffleDetails.participantsCount}`);
    console.log(`  Prize: ${raffleDetails.nftMetadata?.name || 'Unknown NFT'}`);
    console.log(`  Balance: ${raffleDetails.formattedBalance}`);
    console.log();
    
    // Test if queryRaffles can find it through events
    console.log("🔍 Testing event-based discovery...");
    const eventResults = await sdk.queryRaffles({
      limit: 10,
      includeDetails: true
    });
    
    console.log(`  Event discovery found: ${eventResults.raffles.length} raffles`);
    if (eventResults.raffles.length > 0) {
      eventResults.raffles.forEach((raffle, index) => {
        console.log(`    ${index + 1}. ${raffle.objectId}`);
        if (raffle.objectId === knownRaffleId) {
          console.log("       ✅ Known raffle found through events!");
        }
      });
    }
    
    // Debug: Check events directly
    console.log("📅 Checking events directly...");
    const events = await sdk.getClient().queryEvents({
      query: {
        MoveModule: {
          package: sdk.getConfig().packageId,
          module: 'events'
        }
      },
      limit: 10,
      order: 'descending'
    });
    
    console.log(`  Found ${events.data.length} events`);
    const foundRaffleIds = new Set<string>();
    
    events.data.forEach((event, index) => {
      if (event.parsedJson && typeof event.parsedJson === 'object') {
        const parsed = event.parsedJson as any;
        const eventData = parsed.pos0 || parsed;
        const raffleId = eventData.raffle_id;
        
        console.log(`  Event ${index + 1}: ${event.type}`);
        console.log(`    Raffle ID: ${raffleId}`);
        
        if (raffleId && typeof raffleId === 'string') {
          foundRaffleIds.add(raffleId);
        }
      }
    });
    
    console.log(`  Unique raffle IDs from events: ${Array.from(foundRaffleIds).join(', ')}`);
    
    if (foundRaffleIds.has(knownRaffleId)) {
      console.log("  ✅ Known raffle ID found in events!");
    } else {
      console.log("  ⚠️ Known raffle ID not found in events - checking why...");
    }
    
  } catch (error) {
    console.error("❌ Test failed:", error instanceof Error ? error.message : error);
  }
}

// Run the test
testKnownRaffle().catch(console.error);
