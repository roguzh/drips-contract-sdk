import { createDripsSDK, RafflableNFT } from "./dist/index";

/**
 * Complete example showing how to integrate NFT discovery in a frontend
 */
async function nftDiscoveryExample() {
  console.log("🚀 Complete NFT Discovery Integration Example");
  console.log("=" .repeat(50));
  console.log();

  const sdk = createDripsSDK("testnet");
  
  // Simulate different user scenarios
  console.log("📱 Frontend Integration Examples");
  console.log();
  
  // Example 1: Component that lists user's rafflable NFTs
  console.log("🎨 Example 1: NFT Selection Component");
  console.log("-".repeat(30));
  
  const userAddress = "0x79a37abe25aec4e2fd388e793745dc219f0ea5474434b277b047faf07f0c6bc8";
  
  console.log(`// Get user's rafflable NFTs`);
  console.log(`const nfts = await sdk.getRafflableNFTs('${userAddress.slice(0, 12)}...', {`);
  console.log(`  includeMetadata: true,`);
  console.log(`  onlyCompatible: true,`);
  console.log(`  limit: 20`);
  console.log(`});`);
  console.log();
  
  try {
    const userNFTs = await sdk.getRafflableNFTs(userAddress, {
      includeMetadata: true,
      onlyCompatible: true,
      limit: 20
    });
    
    console.log(`Result: Found ${userNFTs.nfts.length} compatible NFTs`);
    
    if (userNFTs.nfts.length === 0) {
      console.log("💡 UI would show: 'No NFTs available for raffling'");
    } else {
      console.log("💡 UI would show:");
      userNFTs.nfts.forEach((nft, index) => {
        console.log(`  [${index + 1}] ${nft.metadata?.name || 'Unnamed NFT'}`);
        console.log(`      ${nft.metadata?.description || 'No description'}`);
      });
    }
  } catch (error) {
    console.log(`Error: ${error instanceof Error ? error.message : error}`);
  }
  
  console.log();
  
  // Example 2: Pagination for large collections
  console.log("📄 Example 2: Paginated NFT Loading");
  console.log("-".repeat(30));
  
  console.log(`// Load NFTs with pagination`);
  console.log(`async function loadNFTsPage(cursor?: string) {`);
  console.log(`  return await sdk.getRafflableNFTs(userAddress, {`);
  console.log(`    includeMetadata: true,`);
  console.log(`    onlyCompatible: true,`);
  console.log(`    limit: 10,`);
  console.log(`    cursor`);
  console.log(`  });`);
  console.log(`}`);
  console.log();
  
  // Example 3: Performance optimization
  console.log("⚡ Example 3: Performance-Optimized Loading");
  console.log("-".repeat(30));
  
  console.log(`// Quick load without metadata, then fetch metadata for visible items`);
  console.log(`const quickScan = await sdk.getRafflableNFTs(userAddress, {`);
  console.log(`  includeMetadata: false, // Fast initial load`);
  console.log(`  onlyCompatible: true,`);
  console.log(`  limit: 50`);
  console.log(`});`);
  console.log();
  console.log(`// Then fetch metadata for visible NFTs`);
  console.log(`for (const nft of quickScan.nfts.slice(0, 5)) { // First 5 visible`);
  console.log(`  nft.metadata = await sdk.getNFTMetadata(nft.objectId);`);
  console.log(`}`);
  console.log();
  
  // Example 4: Error handling
  console.log("🛡️ Example 4: Error Handling");
  console.log("-".repeat(30));
  
  console.log(`try {`);
  console.log(`  const nfts = await sdk.getRafflableNFTs(userAddress, options);`);
  console.log(`  if (nfts.nfts.length === 0) {`);
  console.log(`    showMessage('No NFTs available for raffling');`);
  console.log(`  } else {`);
  console.log(`    displayNFTs(nfts.nfts);`);
  console.log(`  }`);
  console.log(`} catch (error) {`);
  console.log(`  if (error instanceof NetworkError) {`);
  console.log(`    showMessage('Network error, please try again');`);
  console.log(`  } else {`);
  console.log(`    showMessage('Failed to load NFTs');`);
  console.log(`  }`);
  console.log(`}`);
  console.log();
  
  // Example 5: React component snippet
  console.log("⚛️ Example 5: React Component Snippet");
  console.log("-".repeat(30));
  
  console.log(`const NFTSelector = ({ userAddress, onSelect }) => {`);
  console.log(`  const [nfts, setNfts] = useState([]);`);
  console.log(`  const [loading, setLoading] = useState(true);`);
  console.log(``);
  console.log(`  useEffect(() => {`);
  console.log(`    async function loadNFTs() {`);
  console.log(`      try {`);
  console.log(`        setLoading(true);`);
  console.log(`        const result = await sdk.getRafflableNFTs(userAddress, {`);
  console.log(`          includeMetadata: true,`);
  console.log(`          onlyCompatible: true`);
  console.log(`        });`);
  console.log(`        setNfts(result.nfts);`);
  console.log(`      } catch (error) {`);
  console.log(`        console.error('Failed to load NFTs:', error);`);
  console.log(`      } finally {`);
  console.log(`        setLoading(false);`);
  console.log(`      }`);
  console.log(`    }`);
  console.log(`    if (userAddress) loadNFTs();`);
  console.log(`  }, [userAddress]);`);
  console.log(``);
  console.log(`  if (loading) return <LoadingSpinner />;`);
  console.log(`  if (nfts.length === 0) return <EmptyState />;`);
  console.log(``);
  console.log(`  return (`);
  console.log(`    <div className="nft-grid">`);
  console.log(`      {nfts.map(nft => (`);
  console.log(`        <NFTCard`);
  console.log(`          key={nft.objectId}`);
  console.log(`          nft={nft}`);
  console.log(`          onClick={() => onSelect(nft)}`);
  console.log(`        />`);
  console.log(`      ))}`);
  console.log(`    </div>`);
  console.log(`  );`);
  console.log(`};`);
  console.log();
  
  console.log("🎉 Integration Examples Complete!");
  console.log("=" .repeat(50));
  console.log();
  console.log("🔑 Key Benefits:");
  console.log("  ✅ Automatic NFT discovery - no manual input needed");
  console.log("  🔍 Smart filtering - only compatible NFTs shown");
  console.log("  ⚡ Performance options - fast loading with optional metadata");
  console.log("  📄 Pagination support - handles large collections");
  console.log("  🛡️ Error handling - graceful failure management");
  console.log("  ⚛️ Framework agnostic - works with React, Vue, Angular, etc.");
  console.log();
  console.log("📚 Next Steps:");
  console.log("  1. Connect user wallet to get their address");
  console.log("  2. Use getRafflableNFTs() to discover their NFTs");
  console.log("  3. Display compatible NFTs in your UI");
  console.log("  4. Let user select an NFT to raffle");
  console.log("  5. Use the selected NFT's objectId in createRaffle()");
}

// Run the example
nftDiscoveryExample().catch(console.error);
