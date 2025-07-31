import { createDripsSDK } from "./dist/index";

/**
 * Diagnostic test to understand the House object structure
 * This will help us implement the raffle querying correctly
 */
async function diagnoseHouseStructure() {
  console.log("🔍 Diagnosing House Object Structure\n");

  const sdk = createDripsSDK("testnet");
  const config = sdk.getConfig();
  
  console.log(`📦 Package ID: ${config.packageId}`);
  console.log(`🏠 House ID: ${config.houseId}`);
  console.log();

  try {
    // Get the House object details
    console.log("📋 Fetching House object...");
    const houseData = await sdk.getClient().getObject({
      id: config.houseId,
      options: {
        showContent: true,
        showType: true,
        showOwner: true
      }
    });

    console.log("✅ House object retrieved");
    console.log("Raw response:", JSON.stringify(houseData, null, 2));
    console.log();

    // Display basic info
    console.log("📊 House Object Info:");
    console.log(`  Object ID: ${houseData.data?.objectId}`);
    console.log(`  Version: ${houseData.data?.version}`);
    console.log(`  Type: ${houseData.data?.type}`);
    console.log(`  Owner: ${JSON.stringify(houseData.data?.owner)}`);
    console.log();

    // Display content structure
    if (houseData.data?.content) {
      console.log("🏗️ House Content Structure:");
      console.log(`  Data Type: ${houseData.data.content.dataType}`);
      
      if (houseData.data.content.dataType === 'moveObject') {
        const fields = houseData.data.content.fields as any;
        console.log("  📝 Fields:");
        
        // Show all top-level fields
        Object.keys(fields).forEach(key => {
          const value = fields[key];
          const valueType = typeof value;
          const valueStr = valueType === 'object' ? 
            JSON.stringify(value, null, 2).substring(0, 200) + (JSON.stringify(value).length > 200 ? '...' : '') :
            String(value);
          
          console.log(`    ${key}: (${valueType}) ${valueStr}`);
        });
        
        console.log();
        
        // Look for raffle-related fields
        console.log("🔍 Looking for raffle-related fields...");
        const raffleFields = Object.keys(fields).filter(key => 
          key.toLowerCase().includes('raffle') || 
          key.toLowerCase().includes('table') ||
          key.toLowerCase().includes('registry') ||
          key.toLowerCase().includes('collection')
        );
        
        if (raffleFields.length > 0) {
          console.log("  📋 Found potential raffle fields:");
          raffleFields.forEach(field => {
            console.log(`    - ${field}`);
            const fieldValue = fields[field];
            if (fieldValue && typeof fieldValue === 'object') {
              console.log(`      Structure: ${JSON.stringify(fieldValue, null, 4)}`);
            }
          });
        } else {
          console.log("  ❌ No obvious raffle-related fields found");
          console.log("  💡 All fields:", Object.keys(fields).join(', '));
        }
        
        console.log();
        
        // Check for Table or Bag structures that might contain raffles
        console.log("🗂️ Checking for dynamic collections...");
        const dynamicFields = Object.keys(fields).filter(key => {
          const value = fields[key];
          return value && typeof value === 'object' && 
                 (value.type?.includes('Table') || 
                  value.type?.includes('Bag') ||
                  value.fields?.id);
        });
        
        if (dynamicFields.length > 0) {
          console.log("  📦 Found dynamic collection fields:");
          for (const field of dynamicFields) {
            const fieldValue = fields[field];
            console.log(`    ${field}:`);
            console.log(`      Type: ${fieldValue.type || 'unknown'}`);
            
            if (fieldValue.fields?.id?.id) {
              const tableId = fieldValue.fields.id.id;
              console.log(`      Table/Bag ID: ${tableId}`);
              
              try {
                // Try to get dynamic fields from this table
                const dynamicFieldsResult = await sdk.getClient().getDynamicFields({
                  parentId: tableId,
                  limit: 5
                });
                
                console.log(`      Dynamic fields count: ${dynamicFieldsResult.data.length}`);
                if (dynamicFieldsResult.data.length > 0) {
                  console.log("      Sample dynamic fields:");
                  dynamicFieldsResult.data.slice(0, 3).forEach((df, index) => {
                    console.log(`        ${index + 1}. ${df.name?.value || df.name?.type || 'unknown'} -> ${df.objectId}`);
                  });
                }
              } catch (error) {
                console.log(`      ❌ Could not fetch dynamic fields: ${error instanceof Error ? error.message : error}`);
              }
            }
          }
        } else {
          console.log("  ❌ No dynamic collection fields found");
        }
      }
    } else {
      console.log("❌ No content found in House object");
    }
    
    console.log();
    
  } catch (error) {
    console.error("❌ Failed to fetch House object:");
    console.error(error instanceof Error ? error.message : error);
    
    if (error instanceof Error && error.message.includes('not found')) {
      console.log("\n💡 Possible solutions:");
      console.log("  1. Verify the House ID is correct for testnet");
      console.log("  2. Check if the House object exists on this network");
      console.log("  3. Ensure the contract is deployed correctly");
    }
    
    return;
  }

  // Additional diagnostic: try to find raffle objects directly
  console.log("🔍 Searching for raffle objects directly...");
  try {
    // Query objects by type pattern
    const raffleType = `${config.packageId}::raffle::Raffle`;
    console.log(`  Looking for objects of type pattern: ${raffleType}*`);
    
    // This might not work directly, but let's try to find objects owned by the House
    const houseOwnedObjects = await sdk.getClient().getOwnedObjects({
      owner: config.houseId,
      options: {
        showType: true,
        showContent: false,
      },
      limit: 10
    });
    
    console.log(`  Objects owned by House: ${houseOwnedObjects.data.length}`);
    if (houseOwnedObjects.data.length > 0) {
      console.log("  Sample objects:");
      houseOwnedObjects.data.slice(0, 5).forEach((obj, index) => {
        console.log(`    ${index + 1}. ${obj.data?.objectId} (${obj.data?.type})`);
      });
    }
    
  } catch (error) {
    console.log(`  ❌ Could not search for raffle objects: ${error instanceof Error ? error.message : error}`);
  }

  console.log("\n✅ House structure diagnosis complete!");
  console.log("\n💡 Next steps:");
  console.log("  1. Use the structure info above to update the queryRaffles() implementation");
  console.log("  2. Look for the correct field that contains raffle references");
  console.log("  3. Update the code to match the actual House object structure");
}

// Run the diagnostic
diagnoseHouseStructure().catch(console.error);
