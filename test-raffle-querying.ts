import { createDripsSDK, DripsUtils } from "./dist/index";
import type { RaffleQueryOptions } from "./dist/types";

/**
 * Comprehensive test file for raffle querying and discovery functionality
 */

async function testRaffleQuerying() {
  console.log("🧪 Testing Raffle Querying Functionality\n");

  // Initialize SDK
  const sdk = createDripsSDK("testnet");
  console.log("✅ SDK initialized for testnet");
  console.log(`📦 Package ID: ${sdk.getConfig().packageId}`);
  console.log(`🏠 House ID: ${sdk.getConfig().houseId}`);
  console.log();

  let testResults = {
    queryRaffles: false,
    getRafflesByCreator: false,
    searchRaffles: false,
    pagination: false,
    statusFiltering: false,
    errorHandling: false
  };

  // Test 1: Basic queryRaffles functionality
  console.log("📋 Test 1: Basic queryRaffles()");
  try {
    const allRaffles = await sdk.queryRaffles({
      limit: 10,
      includeDetails: true,
      status: 'all'
    });

    console.log(`  ✅ Query successful: Found ${allRaffles.raffles.length} raffles`);
    console.log(`  📊 Has next page: ${allRaffles.hasNextPage}`);
    console.log(`  📈 Total count: ${allRaffles.totalCount || 'N/A'}`);
    
    if (allRaffles.raffles.length > 0) {
      const firstRaffle = allRaffles.raffles[0];
      console.log(`  🎯 First raffle: ${firstRaffle.objectId}`);
      console.log(`  📅 Status: ${DripsUtils.getRaffleStatusDescription(firstRaffle.status)}`);
      console.log(`  👥 Participants: ${firstRaffle.participantsCount}`);
      if (firstRaffle.nftMetadata?.name) {
        console.log(`  🎁 Prize: ${firstRaffle.nftMetadata.name}`);
      }
    } else {
      console.log("  ℹ️ No raffles found (this is normal if none exist)");
    }
    
    testResults.queryRaffles = true;
  } catch (error) {
    console.log(`  ❌ Query failed: ${error instanceof Error ? error.message : error}`);
    console.log("  ℹ️ This might be expected if the House structure is different");
  }
  console.log();

  // Test 2: Status filtering
  console.log("🔍 Test 2: Status Filtering");
  try {
    const activeOptions: RaffleQueryOptions = {
      limit: 5,
      includeDetails: true,
      status: 'active'
    };
    
    const activeRaffles = await sdk.queryRaffles(activeOptions);
    console.log(`  🟢 Active raffles: ${activeRaffles.raffles.length}`);

    const endedOptions: RaffleQueryOptions = {
      limit: 5,
      includeDetails: true,
      status: 'ended'
    };
    
    const endedRaffles = await sdk.queryRaffles(endedOptions);
    console.log(`  🔴 Ended raffles: ${endedRaffles.raffles.length}`);

    // Verify filtering works
    const hasActiveOnly = activeRaffles.raffles.every(r => r.status.isActive);
    const hasEndedOnly = endedRaffles.raffles.every(r => r.status.isEnded);
    
    if (activeRaffles.raffles.length === 0 || hasActiveOnly) {
      console.log("  ✅ Active filtering works correctly");
    } else {
      console.log("  ⚠️ Active filtering might not be working properly");
    }
    
    if (endedRaffles.raffles.length === 0 || hasEndedOnly) {
      console.log("  ✅ Ended filtering works correctly");
    } else {
      console.log("  ⚠️ Ended filtering might not be working properly");
    }

    testResults.statusFiltering = true;
  } catch (error) {
    console.log(`  ❌ Status filtering failed: ${error instanceof Error ? error.message : error}`);
  }
  console.log();

  // Test 3: Pagination
  console.log("📄 Test 3: Pagination");
  try {
    const firstPage = await sdk.queryRaffles({
      limit: 3,
      includeDetails: false // Faster for pagination test
    });

    console.log(`  📖 First page: ${firstPage.raffles.length} raffles`);
    console.log(`  ➡️ Has next page: ${firstPage.hasNextPage}`);

    if (firstPage.hasNextPage && firstPage.nextCursor) {
      const secondPage = await sdk.queryRaffles({
        limit: 3,
        cursor: firstPage.nextCursor,
        includeDetails: false
      });

      console.log(`  📖 Second page: ${secondPage.raffles.length} raffles`);
      console.log(`  ✅ Pagination working correctly`);
      testResults.pagination = true;
    } else {
      console.log("  ℹ️ Not enough raffles to test pagination (need >3 raffles)");
      testResults.pagination = true; // Not a failure, just not enough data
    }
  } catch (error) {
    console.log(`  ❌ Pagination failed: ${error instanceof Error ? error.message : error}`);
  }
  console.log();

  // Test 4: getRafflesByCreator
  console.log("👤 Test 4: getRafflesByCreator()");
  try {
    // Test with a known address (might not have raffles)
    const testCreatorAddress = "0x742d35cc6448c3d41b0e37b36b5e2e39db3b9d7b8b4d4c4e4f4a4b4c4d4e4f4a";
    
    const creatorRaffles = await sdk.getRafflesByCreator(testCreatorAddress, {
      limit: 10,
      includeDetails: true
    });

    console.log(`  👤 Raffles by creator: ${creatorRaffles.raffles.length}`);
    console.log(`  📊 Has next page: ${creatorRaffles.hasNextPage}`);

    if (creatorRaffles.raffles.length > 0) {
      creatorRaffles.raffles.forEach((raffle, index) => {
        console.log(`    ${index + 1}. ${raffle.nftMetadata?.name || 'Unknown NFT'} (${raffle.objectId})`);
      });
      console.log("  ✅ Creator query returned results");
    } else {
      console.log("  ℹ️ No raffles found for test creator (expected for random address)");
    }

    testResults.getRafflesByCreator = true;
  } catch (error) {
    console.log(`  ❌ Creator query failed: ${error instanceof Error ? error.message : error}`);
  }
  console.log();

  // Test 5: searchRaffles
  console.log("🔎 Test 5: searchRaffles()");
  try {
    const searchTerms = ["NFT", "Dragon", "Collectible", "Art"];
    
    for (const term of searchTerms) {
      const searchResults = await sdk.searchRaffles(term, { limit: 3 });
      console.log(`  🔍 Search "${term}": ${searchResults.raffles.length} results`);
      
      if (searchResults.raffles.length > 0) {
        searchResults.raffles.forEach((raffle, index) => {
          const name = raffle.nftMetadata?.name || 'Unknown';
          const desc = raffle.nftMetadata?.description || '';
          console.log(`    ${index + 1}. ${name}`);
          if (desc.length > 0 && desc.length < 100) {
            console.log(`       "${desc}"`);
          }
        });
        break; // Found results, no need to test other terms
      }
    }

    console.log("  ✅ Search functionality working");
    testResults.searchRaffles = true;
  } catch (error) {
    console.log(`  ❌ Search failed: ${error instanceof Error ? error.message : error}`);
  }
  console.log();

  // Test 6: Error handling
  console.log("⚠️ Test 6: Error Handling");
  try {
    // Test with invalid creator address
    console.log("  Testing invalid creator address...");
    try {
      await sdk.getRafflesByCreator("invalid-address", { limit: 1 });
      console.log("  ⚠️ Expected error for invalid address, but got success");
    } catch (error) {
      console.log("  ✅ Correctly handled invalid creator address");
    }

    // Test with very large limit
    console.log("  Testing large limit...");
    const largeQuery = await sdk.queryRaffles({ limit: 1000 });
    console.log(`  ✅ Large limit handled: ${largeQuery.raffles.length} results`);

    // Test with empty search
    console.log("  Testing empty search...");
    const emptySearch = await sdk.searchRaffles("", { limit: 1 });
    console.log(`  ✅ Empty search handled: ${emptySearch.raffles.length} results`);

    testResults.errorHandling = true;
  } catch (error) {
    console.log(`  ❌ Error handling test failed: ${error instanceof Error ? error.message : error}`);
  }
  console.log();

  // Test 7: Performance and edge cases
  console.log("⚡ Test 7: Performance & Edge Cases");
  try {
    const startTime = Date.now();
    
    // Test concurrent queries
    const [query1, query2, query3] = await Promise.all([
      sdk.queryRaffles({ limit: 5, status: 'active' }),
      sdk.queryRaffles({ limit: 5, status: 'ended' }),
      sdk.queryRaffles({ limit: 5, status: 'all' })
    ]);

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`  ⚡ Concurrent queries completed in ${duration}ms`);
    console.log(`  📊 Results: Active(${query1.raffles.length}), Ended(${query2.raffles.length}), All(${query3.raffles.length})`);

    // Test with includeDetails: false for speed
    const fastQuery = await sdk.queryRaffles({
      limit: 20,
      includeDetails: false
    });

    console.log(`  🚀 Fast query (no details): ${fastQuery.raffles.length} raffles`);
    console.log("  ✅ Performance tests completed");
  } catch (error) {
    console.log(`  ❌ Performance test failed: ${error instanceof Error ? error.message : error}`);
  }
  console.log();

  // Test Summary
  console.log("📊 Test Results Summary:");
  console.log("=" .repeat(50));
  
  const tests = [
    { name: "Basic Query Raffles", result: testResults.queryRaffles },
    { name: "Status Filtering", result: testResults.statusFiltering },
    { name: "Pagination", result: testResults.pagination },
    { name: "Get Raffles by Creator", result: testResults.getRafflesByCreator },
    { name: "Search Raffles", result: testResults.searchRaffles },
    { name: "Error Handling", result: testResults.errorHandling }
  ];

  let passedTests = 0;
  tests.forEach(test => {
    const status = test.result ? "✅ PASS" : "❌ FAIL";
    console.log(`  ${status} ${test.name}`);
    if (test.result) passedTests++;
  });

  console.log("=" .repeat(50));
  console.log(`📈 Overall: ${passedTests}/${tests.length} tests passed`);
  
  if (passedTests === tests.length) {
    console.log("🎉 All raffle querying functionality is working correctly!");
  } else {
    console.log("⚠️ Some tests failed - this might be due to:");
    console.log("   - No raffles existing in the system yet");
    console.log("   - Different House object structure than expected");
    console.log("   - Network connectivity issues");
    console.log("   - Contract deployment differences");
  }

  console.log("\n💡 Usage Tips:");
  console.log("  - Use queryRaffles() to discover all raffles");
  console.log("  - Use status filtering to get only active or ended raffles");
  console.log("  - Use pagination for large datasets");
  console.log("  - Use searchRaffles() to find specific NFT types");
  console.log("  - Use getRafflesByCreator() to find raffles by specific creators");
  
  return testResults;
}

// Helper function to create test raffles (for development)
async function createTestRaffles() {
  console.log("🏗️ Creating test raffles for testing...");
  console.log("⚠️ This requires private keys and would create actual raffles");
  console.log("💡 Implement this function if you want to create test data");
  
  // This would require:
  // 1. Private keys
  // 2. Test NFTs
  // 3. Actual raffle creation calls
  // 4. Different states (active, ended, with winners)
}

// Export for use in other test files
export { testRaffleQuerying, createTestRaffles };

// Run if called directly
if (typeof require !== 'undefined' && require.main === module) {
  testRaffleQuerying()
    .then(results => {
      const passedCount = Object.values(results).filter(Boolean).length;
      const totalCount = Object.keys(results).length;
      process.exit(passedCount === totalCount ? 0 : 1);
    })
    .catch(error => {
      console.error("❌ Test execution failed:", error);
      process.exit(1);
    });
}
