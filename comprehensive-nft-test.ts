import { createDripsSDK, DripsUtils } from "./dist/index";

/**
 * Comprehensive test of all NFT-related functionality
 */
async function comprehensiveNFTTest() {
  console.log("🎨 Comprehensive NFT Discovery & Utilities Test");
  console.log("=" .repeat(60));
  console.log();

  const sdk = createDripsSDK("testnet");

  // Test with multiple addresses to show different scenarios
  const testAddresses = [
    {
      address: "0x79a37abe25aec4e2fd388e793745dc219f0ea5474434b277b047faf07f0c6bc8",
      description: "Test Address 1"
    },
    {
      address: "0x33940b0b58b225b6f3673608c16acca032ceb3107aa47204ee33fa6f827b0452",
      description: "Contract Address (may have system objects)"
    }
  ];

  for (const testCase of testAddresses) {
    console.log(`🏷️  Testing: ${testCase.description}`);
    console.log(`📍 Address: ${testCase.address.slice(0, 12)}...${testCase.address.slice(-8)}`);
    console.log();

    try {
      // 1. Get all objects (including incompatible ones)
      console.log("1️⃣ Getting all objects (including incompatible)...");
      const allObjects = await sdk.getRafflableNFTs(testCase.address, {
        includeMetadata: true,
        onlyCompatible: false,
        limit: 20
      });

      console.log(`   📊 Total objects found: ${allObjects.nfts.length}`);

      if (allObjects.nfts.length > 0) {
        // 2. Use utility functions to analyze the results
        console.log("\n2️⃣ Analyzing with utility functions...");
        
        const grouped = DripsUtils.groupNFTsByCompatibility(allObjects.nfts);
        console.log(`   ✅ Compatible: ${grouped.compatible.length}`);
        console.log(`   ❌ Incompatible: ${grouped.incompatible.length}`);

        // Show incompatibility reasons
        if (grouped.incompatible.length > 0) {
          const reasons = DripsUtils.getIncompatibilityReasons(allObjects.nfts);
          console.log("\n   🔍 Incompatibility reasons:");
          Object.entries(reasons).forEach(([reason, count]) => {
            console.log(`      • ${reason}: ${count} object(s)`);
          });
        }

        // 3. Filter and sort compatible NFTs
        console.log("\n3️⃣ Working with compatible NFTs...");
        const compatibleNFTs = DripsUtils.filterCompatibleNFTs(allObjects.nfts);
        
        if (compatibleNFTs.length > 0) {
          const sortedNFTs = DripsUtils.sortNFTsByName(compatibleNFTs);
          const nftsWithMetadata = DripsUtils.getNFTsWithMetadata(sortedNFTs);
          
          console.log(`   📚 Sorted NFTs: ${sortedNFTs.length}`);
          console.log(`   🏷️  With metadata: ${nftsWithMetadata.length}`);
          
          // Show display names
          console.log("\n   🎯 Display names:");
          compatibleNFTs.slice(0, 5).forEach((nft, index) => {
            const displayName = DripsUtils.getNFTDisplayName(nft);
            const hasImage = DripsUtils.hasImage(nft) ? '🖼️' : '📄';
            console.log(`      ${index + 1}. ${hasImage} ${displayName}`);
            if (nft.metadata?.description) {
              console.log(`         "${nft.metadata.description.slice(0, 50)}${nft.metadata.description.length > 50 ? '...' : ''}"`);
            }
          });

          // 4. Search functionality
          console.log("\n4️⃣ Testing search functionality...");
          const searchTerms = ['NFT', 'Test', 'Sample', 'Collection'];
          
          for (const term of searchTerms) {
            const searchResults = DripsUtils.searchNFTs(compatibleNFTs, term);
            if (searchResults.length > 0) {
              console.log(`   🔎 Search "${term}": ${searchResults.length} results`);
              searchResults.slice(0, 2).forEach((nft, index) => {
                console.log(`      ${index + 1}. ${DripsUtils.getNFTDisplayName(nft)}`);
              });
              break;
            }
          }

        } else {
          console.log("   ℹ️ No compatible NFTs found");
        }

        // 5. Performance test - quick scan vs full metadata
        console.log("\n5️⃣ Performance comparison...");
        
        const startQuick = Date.now();
        const quickScan = await sdk.getRafflableNFTs(testCase.address, {
          includeMetadata: false,
          onlyCompatible: true,
          limit: 10
        });
        const quickTime = Date.now() - startQuick;

        const startFull = Date.now();
        const fullScan = await sdk.getRafflableNFTs(testCase.address, {
          includeMetadata: true,
          onlyCompatible: true,
          limit: 10
        });
        const fullTime = Date.now() - startFull;

        console.log(`   ⚡ Quick scan: ${quickTime}ms (${quickScan.nfts.length} NFTs)`);
        console.log(`   🔍 Full scan: ${fullTime}ms (${fullScan.nfts.length} NFTs)`);
        console.log(`   📈 Speed improvement: ${fullTime > 0 ? Math.round(((fullTime - quickTime) / fullTime) * 100) : 0}%`);

        break; // Found objects, no need to test other addresses

      } else {
        console.log("   ℹ️ No objects found for this address");
      }

    } catch (error) {
      console.error(`   ❌ Error testing ${testCase.description}:`, error instanceof Error ? error.message : error);
    }
    
    console.log();
  }

  // 6. Integration examples
  console.log("6️⃣ Integration Code Examples");
  console.log("-".repeat(40));
  console.log();
  
  console.log("// React Hook Example");
  console.log("const useUserNFTs = (userAddress) => {");
  console.log("  const [nfts, setNfts] = useState([]);");
  console.log("  const [loading, setLoading] = useState(false);");
  console.log("");
  console.log("  const loadNFTs = useCallback(async () => {");
  console.log("    setLoading(true);");
  console.log("    try {");
  console.log("      const result = await sdk.getRafflableNFTs(userAddress, {");
  console.log("        includeMetadata: true,");
  console.log("        onlyCompatible: true");
  console.log("      });");
  console.log("      setNfts(result.nfts);");
  console.log("    } catch (error) {");
  console.log("      console.error('Failed to load NFTs:', error);");
  console.log("    } finally {");
  console.log("      setLoading(false);");
  console.log("    }");
  console.log("  }, [userAddress]);");
  console.log("");
  console.log("  return { nfts, loading, reload: loadNFTs };");
  console.log("};");
  console.log();

  console.log("// Vue Composition API Example");
  console.log("const useUserNFTs = (userAddress) => {");
  console.log("  const nfts = ref([]);");
  console.log("  const loading = ref(false);");
  console.log("");
  console.log("  const loadNFTs = async () => {");
  console.log("    loading.value = true;");
  console.log("    try {");
  console.log("      const result = await sdk.getRafflableNFTs(userAddress.value, {");
  console.log("        includeMetadata: true,");
  console.log("        onlyCompatible: true");
  console.log("      });");
  console.log("      nfts.value = result.nfts;");
  console.log("    } finally {");
  console.log("      loading.value = false;");
  console.log("    }");
  console.log("  };");
  console.log("");
  console.log("  watchEffect(() => {");
  console.log("    if (userAddress.value) loadNFTs();");
  console.log("  });");
  console.log("");
  console.log("  return { nfts: readonly(nfts), loading: readonly(loading) };");
  console.log("};");
  console.log();

  console.log("🎉 Comprehensive NFT Test Complete!");
  console.log("=" .repeat(60));
  console.log();
  console.log("📋 Summary of New Features:");
  console.log("  🎨 getRafflableNFTs() - Discover user's NFTs");
  console.log("  🔍 Smart compatibility checking");
  console.log("  📊 Comprehensive utility functions:");
  console.log("     • filterCompatibleNFTs()");
  console.log("     • groupNFTsByCompatibility()");
  console.log("     • sortNFTsByName()");
  console.log("     • searchNFTs()");
  console.log("     • getNFTDisplayName()");
  console.log("     • hasImage()");
  console.log("     • getIncompatibilityReasons()");
  console.log("  ⚡ Performance optimizations");
  console.log("  📄 Pagination support");
  console.log("  🔧 Framework integration examples");
  console.log();
  console.log("🚀 Ready for production use!");
}

// Run the comprehensive test
comprehensiveNFTTest().catch(console.error);
