import { createDripsSDK } from "./src/index";

/**
 * Debug script to check the actual house object structure
 */
async function debugHouseStructure() {
  console.log("🔍 Debugging House Object Structure...\n");

  try {
    const sdk = createDripsSDK("testnet");
    const client = sdk.getClient();
    const config = sdk.getConfig();

    console.log("🏠 House ID:", config.houseId);

    // Get raw house data
    const houseData = await client.getObject({
      id: config.houseId,
      options: {
        showContent: true,
        showType: true,
        showOwner: true,
      },
    });

    if (!houseData.data) {
      console.log("❌ House object not found!");
      return;
    }

    console.log("📦 Raw House Data:");
    console.log("  🆔 Object ID:", houseData.data.objectId);
    console.log("  📝 Type:", houseData.data.type);
    console.log("  👤 Owner:", JSON.stringify(houseData.data.owner, null, 2));
    console.log("  📄 Content:", JSON.stringify(houseData.data.content, null, 2));

  } catch (error) {
    console.error("❌ Error:", error instanceof Error ? error.message : error);
  }
}

debugHouseStructure();
