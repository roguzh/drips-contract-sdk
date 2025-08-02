import { createDripsSDK } from "./src/index";

/**
 * Test script to demonstrate the getHouseInfo function
 */
async function testHouseInfo() {
  console.log("🏠 Testing House Information Retrieval...\n");

  try {
    // Create SDK instance
    const sdk = createDripsSDK("testnet");

    // Get house information
    const houseInfo = await sdk.getHouseInfo();

    console.log("📋 House Information:");
    console.log("  🆔 Object ID:", houseInfo.objectId);
    console.log("  📦 Version:", houseInfo.version);
    console.log("  🔗 Type:", houseInfo.type);
    console.log("  💰 Fee Percentage:", houseInfo.formattedFeePercentage, `(${houseInfo.feePercentage} basis points)`);
    console.log("  🔑 Kiosk Owner Cap ID:", houseInfo.kioskOwnerCapId);
    
    console.log("\n💸 Fee Balances:");
    const balanceEntries = Object.entries(houseInfo.feeBalances);
    if (balanceEntries.length === 0) {
      console.log("  📭 No fee balances found (or bag is empty)");
    } else {
      balanceEntries.forEach(([coinType, balance]) => {
        const formattedBalance = coinType.includes("::sui::SUI") 
          ? `${(parseInt(balance) / 1e9).toFixed(6)} SUI`
          : `${balance} ${coinType.split("::").pop()}`;
        console.log(`  💵 ${coinType}: ${formattedBalance}`);
      });
    }

    console.log("\n📊 Summary:");
    console.log("  ✅ House is operational");
    console.log(`  📈 Current fee rate: ${houseInfo.formattedFeePercentage}`);
    console.log(`  🏪 Total fee balance types: ${balanceEntries.length}`);

  } catch (error) {
    console.error("❌ Error fetching house information:");
    console.error("  ", error instanceof Error ? error.message : error);
  }
}

// Run the test
testHouseInfo();
