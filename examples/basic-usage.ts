import { createDripsSDK, RaffleBuilder, DripsUtils } from "../src/index";

/**
 * Basic usage example for the Drips Raffle SDK
 */
async function basicExample() {
  console.log("🎰 Drips SDK - Basic Example\n");

  // Initialize SDK
  const sdk = createDripsSDK("testnet");

  // Example NFT ID (replace with actual NFT)
  const nftId =
    "0x2fa05c16e392a2594e8f95f2ee4843f2e6873e808450c20325081cc314ccfa6";

  try {
    // 1. Get NFT metadata
    console.log("📋 Getting NFT metadata...");
    const nftMetadata = await sdk.getNFTMetadata(nftId);
    if (nftMetadata) {
      console.log(`  Name: ${nftMetadata.name}`);
      console.log(`  Description: ${nftMetadata.description}`);
      console.log(`  Image: ${nftMetadata.image_url || "Not available"}`);
    }
    console.log();

    // 2. Create a raffle using builder pattern
    console.log("🎯 Creating a raffle...");
    const raffleParams = new RaffleBuilder()
      .setNFT(nftId)
      .setDeadlineFromNow(24) // 24 hours from now
      .build();

    // Note: You'll need to provide a private key to actually create
    console.log("  Raffle parameters created:", {
      nftId: raffleParams.nftId,
      deadline: raffleParams.deadline.toISOString(),
      entryCost: raffleParams.entryCost || "Free",
    });
    console.log();

    // 3. NEW: Discover raffles without knowing IDs
    console.log("🔍 Discovering existing raffles...");
    try {
      const discoveredRaffles = await sdk.queryRaffles({
        limit: 5,
        includeDetails: true,
        status: 'active'
      });

      console.log(`  Found ${discoveredRaffles.raffles.length} active raffles`);
      
      if (discoveredRaffles.raffles.length > 0) {
        console.log("  Active raffles:");
        discoveredRaffles.raffles.forEach((raffle, index) => {
          console.log(`    ${index + 1}. ${raffle.nftMetadata?.name || 'Unknown NFT'}`);
          console.log(`       Participants: ${raffle.participantsCount}`);
          console.log(`       Time remaining: ${DripsUtils.getTimeRemaining(raffle.formattedDeadline)}`);
        });
      } else {
        console.log("  No active raffles found");
      }
    } catch (error) {
      console.log("  Could not discover raffles (this is normal if none exist yet)");
    }
    console.log();

    // 4. Example of checking existing raffle (if we have the ID)
    const existingRaffleId =
      "0x0a682571c06926aed7dafce394742b16d617942446d568c1a06b835d7b1d153b";
    console.log("🔍 Getting raffle details...");
    const raffleDetails = await sdk.getRaffleDetails(existingRaffleId);

    console.log(`  Raffle ID: ${raffleDetails.objectId}`);
    console.log(
      `  Status: ${DripsUtils.getRaffleStatusDescription(raffleDetails.status)}`
    );
    console.log(`  Participants: ${raffleDetails.participantsCount}`);
    console.log(`  Balance: ${raffleDetails.formattedBalance}`);
    console.log(
      `  Time Remaining: ${DripsUtils.getTimeRemaining(
        raffleDetails.formattedDeadline
      )}`
    );

    if (raffleDetails.nftMetadata) {
      console.log(`  Prize: ${raffleDetails.nftMetadata.name}`);
    }
    console.log();

    // 5. Check if raffle is joinable
    if (DripsUtils.isRaffleJoinable(raffleDetails)) {
      console.log("✅ This raffle is joinable!");
    } else {
      console.log("❌ This raffle is not joinable");
      if (raffleDetails.status.isPastDeadline) {
        console.log("   Reason: Past deadline");
      }
      if (raffleDetails.status.isPaused) {
        console.log("   Reason: Paused");
      }
      if (raffleDetails.status.hasWinner) {
        console.log("   Reason: Winner already selected");
      }
    }
  } catch (error) {
    console.error("❌ Error:", error instanceof Error ? error.message : error);
  }
}
