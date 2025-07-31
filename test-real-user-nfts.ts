import { createDripsSDK } from "./dist/index";

/**
 * Test with a real user address that likely has NFTs
 */
async function testRealUserNFTs() {
  console.log("🎨 Testing Rafflable NFTs with Real User Address");
  console.log("=" .repeat(50));
  console.log();

  const sdk = createDripsSDK("testnet");

  // This is a test address - in a real app, this would be the connected wallet address
  const testUserAddress = "0x5c5882d73a6e5b6ea1743fb028eff5e0d7cc8b7ae123d27856c5fe666d91569a";

  console.log(`👤 Testing with address: ${testUserAddress.slice(0, 12)}...${testUserAddress.slice(-8)}`);
  console.log();

  try {
    console.log("🔍 1. Quick scan - getting all objects...");
    const allObjects = await sdk.getRafflableNFTs(testUserAddress, {
      includeMetadata: false,
      onlyCompatible: false,
      limit: 20
    });

    console.log(`📊 Found ${allObjects.nfts.length} total objects`);
    
    if (allObjects.nfts.length === 0) {
      console.log("ℹ️ No objects found. Let's try a different approach...");
      
      // Try to get any objects at all
      const client = sdk.getClient();
      const anyObjects = await client.getOwnedObjects({
        owner: testUserAddress,
        options: { showType: true },
        limit: 5
      });
      
      console.log(`🔍 Raw object query found: ${anyObjects.data?.length || 0} objects`);
      
      if (anyObjects.data && anyObjects.data.length > 0) {
        console.log("📋 Object types found:");
        anyObjects.data.forEach((obj, index) => {
          console.log(`  ${index + 1}. Type: ${obj.data?.type || 'Unknown'}`);
          console.log(`     ID: ${obj.data?.objectId || 'Unknown'}`);
        });
      }
      
      console.log();
      console.log("💡 This address appears to have no objects.");
      console.log("   In a real application, users would connect their own wallet.");
      return;
    }

    // Show all objects with their compatibility
    console.log("\n📋 All Objects Found:");
    allObjects.nfts.forEach((nft, index) => {
      console.log(`  ${index + 1}. ${nft.objectId.slice(0, 8)}...`);
      console.log(`     Type: ${nft.type}`);
      console.log(`     Compatible: ${nft.isCompatible ? '✅' : '❌'}`);
      if (!nft.isCompatible && nft.incompatibilityReason) {
        console.log(`     Reason: ${nft.incompatibilityReason}`);
      }
      console.log();
    });

    // Get only compatible NFTs with metadata
    console.log("✅ 2. Getting compatible NFTs with metadata...");
    const compatibleNFTs = await sdk.getRafflableNFTs(testUserAddress, {
      includeMetadata: true,
      onlyCompatible: true,
      limit: 10
    });

    console.log(`🎯 Found ${compatibleNFTs.nfts.length} compatible NFTs`);
    
    if (compatibleNFTs.nfts.length > 0) {
      console.log("\n🎨 Ready to Raffle:");
      compatibleNFTs.nfts.forEach((nft, index) => {
        console.log(`  ${index + 1}. ${nft.metadata?.name || 'Unnamed NFT'}`);
        console.log(`     ID: ${nft.objectId}`);
        console.log(`     Description: ${nft.metadata?.description || 'No description'}`);
        if (nft.metadata?.image_url) {
          console.log(`     Image: ${nft.metadata.image_url}`);
        }
        console.log();
      });
    } else {
      console.log("ℹ️ No compatible NFTs found for raffling.");
      console.log("   This could mean:");
      console.log("   • User has no NFTs");
      console.log("   • All objects are system objects (coins, capabilities)");
      console.log("   • Objects don't meet NFT criteria");
    }

  } catch (error) {
    console.error("❌ Error:", error instanceof Error ? error.message : error);
  }

  console.log("\n🎉 Real User NFT Testing Complete!");
  console.log("=" .repeat(50));
  console.log();
  console.log("📝 Integration Guide:");
  console.log("  1. Connect user's wallet to get their address");
  console.log("  2. Call getRafflableNFTs(userAddress, { onlyCompatible: true })");
  console.log("  3. Show compatible NFTs in your UI");
  console.log("  4. Let user select which NFT to raffle");
  console.log("  5. Use the NFT's objectId in createRaffle()");
}

// Run the test
testRealUserNFTs().catch(console.error);
