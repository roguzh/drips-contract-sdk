import { createDripsSDK } from "./dist/index";

/**
 * Alternative raffle discovery approach that works with the actual contract structure
 * Since the House object doesn't exist as expected, we'll use events and object queries
 */
async function alternativeRaffleDiscovery() {
  console.log("🔍 Alternative Raffle Discovery Approach\n");

  const sdk = createDripsSDK("testnet");
  const config = sdk.getConfig();
  
  console.log(`📦 Package ID: ${config.packageId}`);
  console.log();

  // Approach 1: Find raffles by searching for RaffleOperatorCap objects
  console.log("🎯 Approach 1: Finding raffles via OperatorCaps");
  try {
    // First, let's examine the RaffleOperatorCap we found
    const operatorCapId = "0x38975daf6e145d8815c21819595bdbd031410bcf540d84b909376b7e1277153d";
    
    const operatorCap = await sdk.getClient().getObject({
      id: operatorCapId,
      options: {
        showContent: true,
        showType: true
      }
    });

    console.log("📋 OperatorCap structure:");
    if (operatorCap.data?.content && operatorCap.data.content.dataType === 'moveObject') {
      const fields = operatorCap.data.content.fields as any;
      console.log("  Fields:", JSON.stringify(fields, null, 2));
      
      // Extract raffle ID if present
      const raffleId = fields.raffle_id || fields.raffleId || fields.id;
      if (raffleId) {
        console.log(`  🎯 Found raffle ID: ${raffleId}`);
        
        // Try to get the raffle details
        try {
          const raffleDetails = await sdk.getRaffleDetails(raffleId);
          console.log("  ✅ Successfully retrieved raffle details!");
          console.log(`    Status: Active=${raffleDetails.status.isActive}, Ended=${raffleDetails.status.isEnded}`);
          console.log(`    Participants: ${raffleDetails.participantsCount}`);
          console.log(`    Prize: ${raffleDetails.nftMetadata?.name || 'Unknown NFT'}`);
        } catch (error) {
          console.log(`  ❌ Could not get raffle details: ${error instanceof Error ? error.message : error}`);
        }
      }
    }
  } catch (error) {
    console.log(`❌ Could not examine OperatorCap: ${error instanceof Error ? error.message : error}`);
  }
  console.log();

  // Approach 2: Search by events
  console.log("📅 Approach 2: Finding raffles via events");
  try {
    // Query events for raffle creation
    const events = await sdk.getClient().queryEvents({
      query: {
        MoveModule: {
          package: config.packageId,
          module: 'raffle'
        }
      },
      limit: 10,
      order: 'descending'
    });

    console.log(`  Found ${events.data.length} raffle events`);
    
    const raffleIds = new Set<string>();
    
    events.data.forEach((event, index) => {
      console.log(`  Event ${index + 1}:`);
      console.log(`    Type: ${event.type}`);
      console.log(`    Transaction: ${event.id.txDigest}`);
      
      if (event.parsedJson && typeof event.parsedJson === 'object') {
        const parsed = event.parsedJson as any;
        console.log(`    Data:`, JSON.stringify(parsed, null, 2));
        
        // Look for raffle IDs in the event data
        const possibleRaffleId = parsed.raffle_id || parsed.raffleId || parsed.id;
        if (possibleRaffleId && typeof possibleRaffleId === 'string') {
          raffleIds.add(possibleRaffleId);
        }
      }
    });

    console.log(`  📊 Unique raffle IDs found: ${raffleIds.size}`);
    
    // Test getting details for found raffles
    if (raffleIds.size > 0) {
      console.log("  🔍 Testing raffle details retrieval:");
      for (const raffleId of Array.from(raffleIds).slice(0, 3)) {
        try {
          const details = await sdk.getRaffleDetails(raffleId);
          console.log(`    ✅ ${raffleId}: ${details.nftMetadata?.name || 'Unknown'} (${details.participantsCount} participants)`);
        } catch (error) {
          console.log(`    ❌ ${raffleId}: ${error instanceof Error ? error.message : error}`);
        }
      }
    }

  } catch (error) {
    console.log(`❌ Event query failed: ${error instanceof Error ? error.message : error}`);
  }
  console.log();

  // Approach 3: Search for raffle objects by type
  console.log("🔎 Approach 3: Search objects by type pattern");
  try {
    // Try to query objects with multiGetObjects for known patterns
    const raffleTypePattern = `${config.packageId}::raffle::Raffle`;
    console.log(`  Looking for objects with type starting with: ${raffleTypePattern}`);

    // This is a more comprehensive approach to find all objects in the system
    const allObjectsResponse = await sdk.getClient().getOwnedObjects({
      owner: config.houseId, // Still use the house ID as it owns related objects
      options: {
        showType: true,
        showContent: true
      },
      limit: 50
    });

    console.log(`  Total objects owned by House address: ${allObjectsResponse.data.length}`);

    const raffleObjects = allObjectsResponse.data.filter(obj => 
      obj.data?.type?.includes('raffle::Raffle') && 
      !obj.data?.type?.includes('OperatorCap')
    );

    console.log(`  Raffle objects found: ${raffleObjects.length}`);

    if (raffleObjects.length > 0) {
      console.log("  📋 Raffle objects:");
      for (const raffleObj of raffleObjects) {
        console.log(`    ID: ${raffleObj.data?.objectId}`);
        console.log(`    Type: ${raffleObj.data?.type}`);
        
        if (raffleObj.data?.content && raffleObj.data.content.dataType === 'moveObject') {
          const fields = raffleObj.data.content.fields as any;
          console.log(`    Status: Active=${!fields.is_raffle_paused}, HasWinner=${!!fields.winner_address}`);
          console.log(`    Participants: ${fields.participants?.length || 0}`);
        }
      }
    }

  } catch (error) {
    console.log(`❌ Object search failed: ${error instanceof Error ? error.message : error}`);
  }

  console.log("\n✅ Alternative discovery analysis complete!");
  console.log("\n💡 Recommendations:");
  console.log("  1. Use event-based discovery as the primary method");
  console.log("  2. Cache discovered raffle IDs for better performance"); 
  console.log("  3. Consider querying objects by type instead of relying on House structure");
  console.log("  4. The current House ID might be incorrect or the House object might use a different pattern");
}

// Run the alternative discovery
alternativeRaffleDiscovery().catch(console.error);
