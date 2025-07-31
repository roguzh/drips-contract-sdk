import { createDripsSDK } from "./dist/index";

/**
 * Test the new getRafflableNFTs functionality
 */
async function testRafflableNFTs() {
  console.log("🎨 Testing Rafflable NFTs Discovery");
  console.log("=" .repeat(50));
  console.log();

  const sdk = createDripsSDK("testnet");

  // Test addresses - we'll try a few different ones
  const testAddresses = [
    "0x79a37abe25aec4e2fd388e793745dc219f0ea5474434b277b047faf07f0c6bc8", // Test address 1
    "0x33940b0b58b225b6f3673608c16acca032ceb3107aa47204ee33fa6f827b0452", // House ID (might have some objects)
    "0xf1a54310356e2a90d896462e19ce926eae5903bce26bd4a37b7c8553b628f71d"  // Package ID (unlikely to have objects)
  ];

  for (const address of testAddresses) {
    console.log(`👤 Testing address: ${address.slice(0, 10)}...${address.slice(-8)}`);
    console.log();

    try {
      // Test 1: Get all rafflable NFTs with metadata
      console.log("🔍 1. Getting all rafflable NFTs (with metadata)...");
      const allNFTs = await sdk.getRafflableNFTs(address, {
        includeMetadata: true,
        onlyCompatible: false,
        limit: 10
      });

      console.log(`📊 Found ${allNFTs.nfts.length} total objects`);
      
      if (allNFTs.nfts.length > 0) {
        console.log("\n📋 Object Details:");
        allNFTs.nfts.forEach((nft, index) => {
          console.log(`  ${index + 1}. ${nft.metadata?.name || 'Unknown Object'}`);
          console.log(`     ID: ${nft.objectId}`);
          console.log(`     Type: ${nft.type}`);
          console.log(`     Compatible: ${nft.isCompatible ? '✅' : '❌'}`);
          
          if (!nft.isCompatible && nft.incompatibilityReason) {
            console.log(`     Reason: ${nft.incompatibilityReason}`);
          }
          
          if (nft.metadata) {
            console.log(`     Description: ${nft.metadata.description || 'No description'}`);
            if (nft.metadata.image_url) {
              console.log(`     Image: ${nft.metadata.image_url}`);
            }
          }
          console.log();
        });

        // Test 2: Get only compatible NFTs
        console.log("✅ 2. Getting only compatible NFTs...");
        const compatibleNFTs = await sdk.getRafflableNFTs(address, {
          includeMetadata: true,
          onlyCompatible: true,
          limit: 10
        });

        console.log(`🎯 Found ${compatibleNFTs.nfts.length} compatible NFTs`);
        
        if (compatibleNFTs.nfts.length > 0) {
          console.log("🎨 Compatible NFTs for raffling:");
          compatibleNFTs.nfts.forEach((nft, index) => {
            console.log(`  ${index + 1}. ${nft.metadata?.name || 'Unnamed NFT'} (${nft.objectId.slice(0, 8)}...)`);
          });
        } else {
          console.log("ℹ️ No compatible NFTs found for this address");
        }
        console.log();

        // Test 3: Without metadata (faster)
        console.log("⚡ 3. Getting NFTs without metadata (faster)...");
        const quickResults = await sdk.getRafflableNFTs(address, {
          includeMetadata: false,
          onlyCompatible: false,
          limit: 5
        });

        console.log(`🚀 Quick scan found ${quickResults.nfts.length} objects`);
        if (quickResults.nfts.length > 0) {
          quickResults.nfts.forEach((nft, index) => {
            console.log(`  ${index + 1}. ${nft.objectId} (${nft.isCompatible ? 'Compatible' : 'Incompatible'})`);
          });
        }
        console.log();

        // Test 4: Pagination
        console.log("📄 4. Testing pagination...");
        const firstPage = await sdk.getRafflableNFTs(address, {
          limit: 2,
          includeMetadata: false
        });

        console.log(`📃 First page: ${firstPage.nfts.length} objects`);
        console.log(`   Has next page: ${firstPage.hasNextPage}`);
        
        if (firstPage.hasNextPage && firstPage.nextCursor) {
          const secondPage = await sdk.getRafflableNFTs(address, {
            limit: 2,
            cursor: firstPage.nextCursor,
            includeMetadata: false
          });
          console.log(`📃 Second page: ${secondPage.nfts.length} objects`);
        }
        console.log();

        break; // Found objects, no need to test other addresses

      } else {
        console.log("ℹ️ No objects found for this address");
        console.log();
      }

    } catch (error) {
      console.error(`❌ Error testing address ${address.slice(0, 10)}...:`, error instanceof Error ? error.message : error);
      console.log();
    }
  }

  // Summary
  console.log("🎉 Rafflable NFTs Testing Complete!");
  console.log("=" .repeat(50));
  console.log();
  console.log("✅ Features tested:");
  console.log("  🎨 Automatic NFT discovery from user address");
  console.log("  ✅ Compatibility checking for raffle contract");
  console.log("  📖 Optional metadata fetching");
  console.log("  🎯 Filtering for compatible NFTs only");
  console.log("  ⚡ Fast scanning without metadata");
  console.log("  📄 Pagination support for large collections");
  console.log();
  console.log("💡 Users can now easily discover which NFTs they can raffle!");
  console.log("   No more guessing or manual checking required.");
  console.log();
}

// Run the test
testRafflableNFTs().catch(console.error);
